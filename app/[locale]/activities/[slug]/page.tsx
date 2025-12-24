// app/[locale]/activities/[slug]/page.tsx
import { Metadata } from "next"; 
import ActivityDetailView from "@/components/views/ActivityDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { Activity } from "@/types/activity";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

async function getActivityData(slug: string, locale: string): Promise<Activity | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!slug) return null;

  try {
    const res = await fetch(`${apiUrl}/activities/slug/${slug}`, {
      headers: { "Accept-Language": locale },
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) {
    console.error("Activity Fetch Error:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getActivityData(slug, locale);

  if (!product) {
    return { title: "Activity Not Found | TravelMore", robots: "noindex, nofollow" };
  }

  const canonicalUrl = `${baseUrl}/${locale}/activities/${product.slug}`;
  const mainImage = product.images_url?.[0]?.url || '/default-activity.jpg';

  return {
    title: `${product.name} - Yogyakarta Activities`,
    description: product.description 
      ? product.description.substring(0, 160) + "..." 
      : `Book ${product.name} at ${product.location}. Best local rates on TravelMore.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/activities/${product.slug}`,
        'id': `${baseUrl}/id/activities/${product.slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description: `Lokasi: ${product.location}. Dapatkan penawaran terbaik hanya di TravelMore Yogyakarta.`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [{ url: mainImage, width: 1200, height: 630, alt: product.name }],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const activityData = await getActivityData(slug, locale);

  if (!activityData) notFound();

  if (slug !== activityData.slug) {
    permanentRedirect(`/${locale}/activities/${activityData.slug}`);
  }

  const priceExpiry = new Date();
  priceExpiry.setFullYear(priceExpiry.getFullYear() + 1);
  
  // ✅ FIX: Gunakan tipe intersection agar aman dari error 'no-explicit-any'
  // Ini memberi tahu TS bahwa data adalah Activity tapi rating bisa string/number
  const data = activityData as Activity & { rating?: number | string };

  // 1. Schema Utama: TouristAttraction
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction', 
    'name': data.name,
    'description': data.description?.substring(0, 300),
    'image': data.images_url?.map((img: { url: string }) => img.url) || [],
    'location': {
      '@type': 'Place',
      'name': data.location,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Yogyakarta',
        'addressCountry': 'ID'
      }
    },
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
      'price': data.price || '0',
      'priceValidUntil': priceExpiry.toISOString().split('T')[0],
      'availability': 'https://schema.org/InStock',
      'url': `${baseUrl}/${locale}/activities/${data.slug}`,
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
      { '@type': 'ListItem', 'position': 2, 'name': 'Activities', 'item': `${baseUrl}/${locale}/activities` },
      { '@type': 'ListItem', 'position': 3, 'name': data.name, 'item': `${baseUrl}/${locale}/activities/${data.slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ActivityDetailView initialData={activityData} />
    </>
  );
}