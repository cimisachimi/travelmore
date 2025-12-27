// app/[locale]/packages/[slug]/page.tsx
import { Metadata } from "next"; 
import PackageDetailView from "@/components/views/PackageDetailView";
import { notFound, permanentRedirect } from "next/navigation"; 
import { HolidayPackage } from "@/types/package";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

async function getPackageData(slug: string, locale: string): Promise<HolidayPackage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!slug) return null;

  try {
    const res = await fetch(`${apiUrl}/public/packages/slug/${slug}`, {
      headers: { "Accept-Language": locale },
      next: { revalidate: 3600 }, 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getPackageData(slug, locale);

  if (!product) {
    return {
      title: "Package Not Found | TravelMore",
      robots: "noindex, nofollow", 
    };
  }

  const canonicalUrl = `${baseUrl}/${locale}/packages/${product.slug}`;
  const productImage = product.images_url?.[0] || '/default-package.jpg';
  
  const priceFormatted = product.starting_from_price 
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(product.starting_from_price))
    : 'Best Price';

  return {
    title: `${product.name} - Yogyakarta Tour Package`, 
    description: product.description 
      ? product.description.substring(0, 160) + "..." 
      : `Book your trip to ${product.location} with TravelMore. Best price starting from ${priceFormatted}`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/packages/${product.slug}`,
        'id': `${baseUrl}/id/packages/${product.slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description: `Lokasi: ${product.location}. Durasi: ${product.duration} Hari. Mulai dari ${priceFormatted}.`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [{ url: productImage, width: 1200, height: 630, alt: product.name }],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const packageData = await getPackageData(slug, locale);

  if (!packageData) {
    notFound(); 
  }

  if (slug !== packageData.slug) {
    permanentRedirect(`/${locale}/packages/${packageData.slug}`);
  }

  const priceExpiry = new Date();
  priceExpiry.setFullYear(priceExpiry.getFullYear() + 1);

  
  const data = packageData as HolidayPackage & { rating?: number | string };

  // 1. Schema Utama: TouristTrip
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': data.name,
    'description': data.description?.substring(0, 300),
    'image': data.images_url || [], 
    'touristType': ["AdventureTourism", "CulturalTourism"],
    'duration': `P${data.duration}D`, 

    // Validasi rating
    ...(data.rating && Number(data.rating) > 0 ? {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': data.rating,
        'reviewCount': '50', 
        'bestRating': '5',
        'worstRating': '1'
      }
    } : {}),

    
    'itinerary': data.itinerary?.map((item: { day: number | string; title: string; description: string }) => ({
      '@type': 'ItemList',
      'name': `Day ${item.day}: ${item.title}`,
      'description': item.description
    })),

    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR',
      'price': data.starting_from_price || '0',
      'priceValidUntil': priceExpiry.toISOString().split('T')[0],
      'availability': 'https://schema.org/InStock',
      'url': `${baseUrl}/${locale}/packages/${data.slug}`,
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
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${baseUrl}/${locale}`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Packages',
        'item': `${baseUrl}/${locale}/packages`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': data.name,
        'item': `${baseUrl}/${locale}/packages/${data.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PackageDetailView initialData={packageData} />
    </>
  );
}