// app/[locale]/activities/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import ActivityDetailView from "@/components/views/ActivityDetailView";
import { notFound } from "next/navigation";
import { Activity } from "@/types/activity";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

/**
 * Fetches activity data using the new slug-based endpoint.
 */
async function getActivityData(slug: string): Promise<Activity | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!slug) return null;

  try {
    // ✅ Updated to fetch by slug instead of ID
    const res = await fetch(`${apiUrl}/activities/slug/${slug}`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    
    // Returns data if nested or the object itself
    return json.data || json; 
  } catch (error) {
    console.error("Activity Fetch Connection Error:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getActivityData(slug); // ✅ Fetch using direct slug

  if (!product) {
    return {
      title: "Activity Not Found | TravelMore",
      robots: "noindex, nofollow",
    };
  }

  // Use the slug returned by the API as the source of truth
  const canonicalUrl = `${baseUrl}/${locale}/activities/${product.slug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  const mainImage = product.images_url?.[0]?.url || '/default-activity.jpg';

  const priceFormatted = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(Number(product.price));

  return {
    title: product.name,
    description: product.description 
      ? product.description.substring(0, 160) + "..." 
      : `Book ${product.name} at ${product.location}`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/activities/${product.slug}`,
        'id': `${baseUrl}/id/activities/${product.slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description: `Lokasi: ${product.location}. Mulai dari ${priceFormatted}. Pesan sekarang!`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [{ url: mainImage, width: 1200, height: 630, alt: product.name }, ...previousImages],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const activityData = await getActivityData(slug); // ✅ Direct slug lookup

  if (!activityData) {
    notFound();
  }

  // Schema JSON-LD
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction', 
    name: activityData.name,
    description: activityData.description ? activityData.description.substring(0, 300) : "",
    image: activityData.images_url?.map(img => img.url) || [],
    location: {
      '@type': 'Place',
      name: activityData.location,
      address: activityData.location 
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: activityData.price || '0',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${locale}/activities/${activityData.slug}`,
      validFrom: new Date().toISOString(),
      priceValidUntil: nextYear.toISOString().split('T')[0],
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
      <ActivityDetailView initialData={activityData} />
    </>
  );
}