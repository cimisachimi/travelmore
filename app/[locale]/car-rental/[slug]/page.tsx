// app/[locale]/car-rental/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import CarDetailView from "@/components/views/CarDetailView";
import { notFound } from "next/navigation";
import { Car } from "@/types/car";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// ✅ Updated: Fetch by backend slug
async function getCarData(slug: string): Promise<Car | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!slug) return null;

  try {
    const res = await fetch(`${apiUrl}/public/car-rentals/slug/${slug}`, {
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
  const car = await getCarData(slug); // ✅ Fetch using direct slug

  if (!car) return { title: "Car Not Found | TravelMore", robots: "noindex, nofollow" };

  const canonicalUrl = `${baseUrl}/${locale}/car-rental/${car.slug}`;
  const previousImages = (await parent).openGraph?.images || [];
  
  const thumbnail = car.images?.find(img => img.type === 'thumbnail')?.url 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${car.images.find(img => img.type === 'thumbnail')?.url}`
    : '/cars/placeholder.jpg';

  const priceVal = Number(car.price_per_day) || 0;
  const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceVal);

  return {
    title: `Rent ${car.brand} ${car.car_model} in Yogyakarta - TravelMore`,
    description: `Rent ${car.brand} ${car.car_model} in Jogja starting from ${priceFormatted}/day. Clean, reliable, and instant booking.`,
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
  const carData = await getCarData(slug); // ✅ Direct slug lookup

  if (!carData) notFound();

  // JSON-LD logic using carData.slug
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${carData.brand} ${carData.car_model}`,
    offers: {
      '@type': 'Offer',
      price: carData.price_per_day,
      url: `${baseUrl}/${locale}/car-rental/${carData.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <CarDetailView initialData={carData} />
    </>
  );
}