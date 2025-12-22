import { Metadata, ResolvingMetadata } from "next";
import ActivityDetailView from "@/components/views/ActivityDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { Activity } from "@/types/activity";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// Helper Slug
function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function getActivityData(id: string): Promise<Activity | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!id || isNaN(Number(id))) return null;

  try {
    // ✅ PERBAIKAN DISINI: Menghapus '/public' dari URL
    // URL menjadi: {apiUrl}/activities/{id}
    // Sesuai temuan Anda: https://api.travelmore.travel/api/activities/10
    const res = await fetch(`${apiUrl}/activities/${id}`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    
    // Support jika backend return { data: ... } atau langsung object
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
  const product = await getActivityData(id);

  if (!product) {
    return {
      title: "Activity Not Found | TravelMore",
      robots: "noindex, nofollow",
    };
  }

  const correctSlug = `${product.id}-${createSlug(product.name)}`;
  const canonicalUrl = `${baseUrl}/${locale}/activities/${correctSlug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  // Handle Activity Images structure
  // Mengambil gambar pertama dari array images_url yang ada di JSON
  const mainImage = product.images_url?.[0]?.url || '/default-activity.jpg';

  // Format harga untuk deskripsi SEO
  // Menggunakan Number() karena di JSON price berupa string "150000.00"
  const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(product.price));

  return {
    title: product.name,
    description: product.description ? product.description.substring(0, 160) + "..." : `Book ${product.name} at ${product.location}`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/activities/${correctSlug}`,
        'id': `${baseUrl}/id/activities/${correctSlug}`,
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
  const id = slug.split('-')[0];
  const activityData = await getActivityData(id);

  if (!activityData) {
    notFound();
  }

  // Auto Redirect Logic
  const correctSlug = `${activityData.id}-${createSlug(activityData.name)}`;
  if (slug !== correctSlug) {
    permanentRedirect(`/${locale}/activities/${correctSlug}`);
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
      url: `${baseUrl}/${locale}/activities/${correctSlug}`,
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