import { Metadata, ResolvingMetadata } from "next";
import CarDetailView from "@/components/views/CarDetailView";
import { notFound, permanentRedirect } from "next/navigation";
import { Car } from "@/types/car";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// Helper: Create Slug
function createSlug(brand: string, model: string) {
  const fullName = `${brand} ${model}`;
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Helper: Fetch Data (Secure & Robust)
async function getCarData(id: string): Promise<Car | null> {
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  
  // Validasi ID harus angka
  if (!id || isNaN(Number(id))) return null;

  try {
    // ✅ FIX: Konsisten menggunakan endpoint '/public'
    const res = await fetch(`${apiUrl}/public/car-rentals/${id}`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return null;
  }
}

// --- GENERATE METADATA (SEO) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const car = await getCarData(id);

  if (!car) {
    return {
      title: "Car Not Found | TravelMore",
      robots: "noindex, nofollow",
    };
  }

  const correctSlug = `${car.id}-${createSlug(car.brand, car.car_model)}`;
  const canonicalUrl = `${baseUrl}/${locale}/car-rental/${correctSlug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  const thumbnail = car.images?.find(img => img.type === 'thumbnail')?.url 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${car.images.find(img => img.type === 'thumbnail')?.url}`
    : '/cars/placeholder.jpg';

  const priceVal = Number(car.price_per_day) || 0;
  const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceVal);

  return {
    title: `Rent ${car.brand} ${car.car_model} in Yogyakarta - TravelMore`,
    description: `Rent ${car.brand} ${car.car_model} in Jogja starting from ${priceFormatted}/day. ${car.transmission} transmission, ${car.capacity} seats. Clean, reliable, and instant booking.`,
    keywords: [
      `rent ${car.brand} ${car.car_model}`, 
      `sewa mobil ${car.brand} jogja`, 
      "car rental yogyakarta", 
      "sewa mobil lepas kunci", 
      "travelmore car rental",
      `${car.category} car rental`
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/car-rental/${correctSlug}`,
        'id': `${baseUrl}/id/car-rental/${correctSlug}`,
      },
    },
    openGraph: {
      title: `Rent ${car.brand} ${car.car_model} - Only ${priceFormatted}/day`,
      description: `Best deal for ${car.brand} ${car.car_model} in Yogyakarta. Book now via TravelMore.`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      images: [{ url: thumbnail, width: 1200, height: 630, alt: `${car.brand} ${car.car_model}` }, ...previousImages],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Rent ${car.brand} ${car.car_model} in Jogja`,
      description: `Starts from ${priceFormatted}/day. Book now!`,
      images: [thumbnail],
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const carData = await getCarData(id);

  if (!carData) {
    notFound();
  }

  // Auto Redirect jika Slug tidak rapi (SEO Friendly URL)
  const correctSlug = `${carData.id}-${createSlug(carData.brand, carData.car_model)}`;
  if (slug !== correctSlug) {
    permanentRedirect(`/${locale}/car-rental/${correctSlug}`);
  }

  // Persiapan Data Schema
  const thumbnail = carData.images?.find(img => img.type === 'thumbnail')?.url 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${carData.images.find(img => img.type === 'thumbnail')?.url}`
    : '';

  // 1. Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${carData.brand} ${carData.car_model}`,
    image: thumbnail,
    description: carData.description || `Rent ${carData.brand} ${carData.car_model}`,
    brand: {
      '@type': 'Brand',
      name: carData.brand
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: carData.price_per_day,
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${locale}/car-rental/${correctSlug}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: "https://schema.org/UsedCondition",
    },
    offeredBy: {
      '@type': 'AutoRental',
      name: 'TravelMore',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`
    }
  };

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Car Rental',
        item: `${baseUrl}/${locale}/car-rental`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${carData.brand} ${carData.car_model}`,
        item: `${baseUrl}/${locale}/car-rental/${correctSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <CarDetailView initialData={carData} />
    </>
  );
}