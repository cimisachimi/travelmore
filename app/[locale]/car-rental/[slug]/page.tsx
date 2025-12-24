// app/[locale]/car-rental/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import CarDetailView from "@/components/views/CarDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { Car } from "@/types/car";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

async function getCarData(slug: string, locale: string): Promise<Car | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!slug) return null;

  try {
    const res = await fetch(`${apiUrl}/public/car-rentals/slug/${slug}`, {
      headers: { "Accept-Language": locale },
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) {
    console.error("Car Detail Fetch Error:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, locale } = await params;
  const car = await getCarData(slug, locale);

  if (!car) return { title: "Car Not Found | TravelMore", robots: "noindex, nofollow" };

  const canonicalUrl = `${baseUrl}/${locale}/car-rental/${car.slug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  const thumbnail = car.images?.find(img => img.type === 'thumbnail')?.url 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${car.images.find(img => img.type === 'thumbnail')?.url}`
    : '/cars/placeholder.jpg';

  const priceVal = Number(car.price_per_day) || 0;
  const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceVal);

  return {
    title: `Sewa Mobil ${car.brand} ${car.car_model} Jogja - TravelMore`,
    description: `Rental ${car.brand} ${car.car_model} di Yogyakarta. Mulai dari ${priceFormatted}/day. Clean, reliable, and instant booking.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/car-rental/${car.slug}`,
        'id': `${baseUrl}/id/car-rental/${car.slug}`,
      },
    },
    openGraph: {
      title: `Rent ${car.brand} ${car.car_model} - Only ${priceFormatted}/day`,
      url: canonicalUrl,
      images: [{ url: thumbnail, width: 1200, height: 630, alt: `${car.brand} ${car.car_model}` }, ...previousImages],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const carData = await getCarData(slug, locale);

  if (!carData) notFound();

  if (slug !== carData.slug) {
    permanentRedirect(`/${locale}/car-rental/${carData.slug}`);
  }

  // 1. Schema Utama: Product (Car)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': `${carData.brand} ${carData.car_model} Rental Yogyakarta`,
    'description': carData.description || `Sewa mobil ${carData.brand} ${carData.car_model} di Yogyakarta dengan harga terbaik.`,
    
    // ✅ FIX SEO: Image URL lengkap
    'image': carData.images?.map(img => `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.url}`) || [],
    
    'brand': { 
      '@type': 'Brand', 
      'name': carData.brand 
    },
    
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR', // ✅ Wajib ada
      'price': carData.price_per_day,
      'availability': 'https://schema.org/InStock',
      'url': `${baseUrl}/${locale}/car-rental/${carData.slug}`,
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
    },
  };

  // 2. ✅ PERBAIKAN SEO: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${baseUrl}/${locale}` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Car Rental', 'item': `${baseUrl}/${locale}/car-rental` },
      { '@type': 'ListItem', 'position': 3, 'name': `${carData.brand} ${carData.car_model}`, 'item': `${baseUrl}/${locale}/car-rental/${carData.slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CarDetailView initialData={carData} />
    </>
  );
}