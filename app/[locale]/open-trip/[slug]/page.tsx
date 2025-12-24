// app/[locale]/open-trip/[slug]/page.tsx
import { Metadata } from "next"; 
import OpenTripDetailView from "@/components/views/OpenTripDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { OpenTrip } from "@/types/opentrip";

type Props = { params: Promise<{ slug: string; locale: string }> };
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

function getImageUrl(path: string | null | undefined) {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${apiBase}/storage/${cleanPath}`;
}

async function getOpenTripData(slug: string, locale: string): Promise<OpenTrip | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  try {
    const res = await fetch(`${apiUrl}/open-trips/slug/${slug}`, {
      headers: { "Accept-Language": locale },
      next: { revalidate: 3600 }, 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) { 
    console.error("Fetch Open Trip Error:", error);
    return null; 
  }
}

// Hapus parameter 'parent' dan ResolvingMetadata karena tidak digunakan
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const trip = await getOpenTripData(slug, locale);

  if (!trip) return { title: "Trip Not Found | TravelMore", robots: "noindex, nofollow" };

  const canonicalUrl = `${baseUrl}/${locale}/open-trip/${trip.slug}`;
  const mainImage = getImageUrl(trip.thumbnail_url);

  return {
    title: `${trip.name} - Yogyakarta Open Trip`,
    description: trip.description?.substring(0, 160) || `Join our group tour ${trip.name} in Yogyakarta.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/open-trip/${trip.slug}`,
        'id': `${baseUrl}/id/open-trip/${trip.slug}`,
      },
    },
    openGraph: {
        title: trip.name,
        url: canonicalUrl,
        images: [{ url: mainImage, width: 1200, height: 630 }],
        type: 'website',
    }
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const tripData = await getOpenTripData(slug, locale);

  if (!tripData) notFound();

  if (slug !== tripData.slug) {
    permanentRedirect(`/${locale}/open-trip/${tripData.slug}`);
  }

  // ✅ FIX: Gunakan tipe intersection agar aman dari 'no-explicit-any' dan TS error
  const data = tripData as OpenTrip & { rating?: number | string };

  // 1. Schema Utama: TouristTrip
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': data.name,
    'description': data.description?.substring(0, 300),
    'image': data.thumbnail_url ? [getImageUrl(data.thumbnail_url)] : [],
    'touristType': ["AdventureTourism", "GroupTravel"],
    
    // ✅ FIX SEO: Validasi rating dengan Number()
    ...(data.rating && Number(data.rating) > 0 ? {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': data.rating,
        'reviewCount': '50',
        'bestRating': '5',
        'worstRating': '1'
      }
    } : {}),

    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR',
      'price': data.starting_from_price,
      'availability': 'https://schema.org/InStock',
      'url': `${baseUrl}/${locale}/open-trip/${data.slug}`,
      'offeredBy': {
        '@type': 'TravelAgency',
        'name': 'TravelMore',
        'url': baseUrl,
        'logo': `${baseUrl}/logo.png`,
        'telephone': '+6282224291148',
        'priceRange': 'IDR',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Jl. Magelang - Yogyakarta No.71, Sleman',
          'addressLocality': 'Yogyakarta',
          'postalCode': '55285',
          'addressCountry': 'ID'
        }
      }
    }
  };

  // 2. BreadcrumbList Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${baseUrl}/${locale}` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Open Trip', 'item': `${baseUrl}/${locale}/open-trip` },
      { '@type': 'ListItem', 'position': 3, 'name': data.name, 'item': `${baseUrl}/${locale}/open-trip/${data.slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <OpenTripDetailView initialData={tripData} />
    </>
  );
}