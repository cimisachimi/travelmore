import { Metadata, ResolvingMetadata } from "next";
import OpenTripDetailView from "@/components/views/OpenTripDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { OpenTrip } from "@/types/opentrip";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// ✅ FIX: Helper untuk Server Side
function getImageUrl(path: string | null | undefined) {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`; // Untuk SEO, url local harus full absolute path
    
    // Clean slash
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${apiBase}/storage/${cleanPath}`;
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function getOpenTripData(id: string): Promise<OpenTrip | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  
  if (!id || isNaN(Number(id))) return null;

  try {
    const res = await fetch(`${apiUrl}/open-trips/${id}`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) {
    console.error("SEO Fetch Connection Error:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const trip = await getOpenTripData(id);

  if (!trip) {
    return {
      title: "Trip Not Found | TravelMore",
      robots: "noindex, nofollow",
    };
  }

  const correctSlug = `${trip.id}-${createSlug(trip.name)}`;
  const canonicalUrl = `${baseUrl}/${locale}/open-trip/${correctSlug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  // ✅ FIX: Gunakan Helper
  const mainImage = getImageUrl(trip.thumbnail_url);

  const priceVal = Number(trip.starting_from_price) || 0;
  const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceVal);

  return {
    title: `${trip.name} - Open Trip Package`,
    description: trip.description ? trip.description.substring(0, 160) + "..." : `Join our ${trip.duration}-day open trip to ${trip.location}. Starting from ${priceFormatted}. Book now!`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/open-trip/${correctSlug}`,
        'id': `${baseUrl}/id/open-trip/${correctSlug}`,
      },
    },
    openGraph: {
      title: trip.name,
      description: `Lokasi: ${trip.location}. Durasi: ${trip.duration} Hari. Mulai ${priceFormatted}.`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [{ url: mainImage, width: 1200, height: 630, alt: trip.name }, ...previousImages],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const tripData = await getOpenTripData(id);

  if (!tripData) {
    notFound();
  }

  const correctSlug = `${tripData.id}-${createSlug(tripData.name)}`;
  if (slug !== correctSlug) {
    permanentRedirect(`/${locale}/open-trip/${correctSlug}`);
  }

  // ✅ FIX: Gunakan Helper
  const mainImage = getImageUrl(tripData.thumbnail_url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tripData.name,
    description: tripData.description,
    image: mainImage,
    touristType: ["AdventureTourism", "GroupTravel"],
    itinerary: tripData.itinerary_details?.map(item => ({
      '@type': 'ItemList',
      name: `Day ${item.day}: ${item.title}`,
      itemListElement: item.activities.map((act, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: act
      }))
    })),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: tripData.starting_from_price,
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${locale}/open-trip/${correctSlug}`,
      validFrom: new Date().toISOString(),
    },
    offeredBy: {
      '@type': 'TravelAgency',
      name: 'TravelMore',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OpenTripDetailView initialData={tripData} />
    </>
  );
}