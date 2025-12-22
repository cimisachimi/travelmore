// app/[locale]/packages/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import PackageDetailView from "@/components/views/PackageDetailView";
import { notFound, permanentRedirect } from "next/navigation"; 
import { HolidayPackage } from "@/types/package";

type Props = {
  // Folder sudah diubah jadi [slug], maka params juga 'slug'
  params: Promise<{ slug: string; locale: string }>;
};

// Base URL dari Environment Variable
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// --- HELPER FUNCTIONS ---

// 1. Helper membuat Slug URL-Friendly (contoh: "Bali Trip" -> "bali-trip")
function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Ganti karakter non-alphanumeric dengan -
    .replace(/(^-|-$)+/g, '');   // Hapus - di awal/akhir
}

// 2. Helper Fetch Data (Tetap pakai ID angka ke Backend)
async function getPackageData(id: string): Promise<HolidayPackage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Validasi sederhana: Jika ID bukan angka, return null (jangan fetch ke API)
  if (!id || isNaN(Number(id))) return null;

  try {
    const res = await fetch(`${apiUrl}/public/packages/${id}`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("SEO Fetch Connection Error:", error);
    return null;
  }
}

// --- GENERATE METADATA (SEO) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, locale } = await params;
  
  // Ambil ID dari bagian depan slug (misal: "34-bali-trip" -> ambil "34")
  const id = slug.split('-')[0]; 
  
  const product = await getPackageData(id);

  if (!product) {
    return {
      title: "Package Not Found | TravelMore",
      description: "The package you are looking for does not exist.",
      robots: "noindex, nofollow", 
    };
  }

  // Generate URL Slug yang benar untuk Canonical
  const correctSlug = `${product.id}-${createSlug(product.name)}`;
  const canonicalUrl = `${baseUrl}/${locale}/packages/${correctSlug}`;

  const previousImages = (await parent).openGraph?.images || [];
  const productImage = product.images_url?.[0] || '/default-package.jpg';
  
  const priceFormatted = product.starting_from_price 
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.starting_from_price)
    : 'Best Price';

  return {
    title: product.name, 
    description: product.description 
      ? product.description.substring(0, 160) + "..." 
      : `Book your trip to ${product.location} with TravelMore.`,
    
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/packages/${correctSlug}`,
        'id': `${baseUrl}/id/packages/${correctSlug}`,
      },
    },

    openGraph: {
      title: product.name,
      description: `Lokasi: ${product.location}. Mulai dari ${priceFormatted}. Pesan sekarang!`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
        ...previousImages
      ],
      type: 'website',
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  
  // 1. Ekstrak ID dari URL (ambil angka sebelum tanda strip pertama)
  const id = slug.split('-')[0];

  // 2. Fetch Data
  const packageData = await getPackageData(id);

  if (!packageData) {
    notFound(); 
  }

  // 3. SEO Strict Mode: Auto Redirect
  // Cek apakah URL saat ini ("slug") sama dengan slug yang seharusnya?
  // Jika user akses "/packages/34" -> Redirect ke "/packages/34-bali-trip"
  const correctSlug = `${packageData.id}-${createSlug(packageData.name)}`;
  
  if (slug !== correctSlug) {
    // Permanent Redirect (308) bagus untuk memindahkan ranking SEO ke URL baru
    permanentRedirect(`/${locale}/packages/${correctSlug}`);
  }

  // 4. Setup Schema JSON-LD (Structured Data)
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: packageData.name,
    description: packageData.description ? packageData.description.substring(0, 300) : "",
    image: packageData.images_url || [],
    touristType: ["AdventureTourism", "CulturalTourism"], 
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: packageData.starting_from_price || '0',
      availability: 'https://schema.org/InStock',
      // Gunakan URL dengan Slug yang benar
      url: `${baseUrl}/${locale}/packages/${correctSlug}`, 
      validFrom: new Date().toISOString(),
      priceValidUntil: nextYear.toISOString().split('T')[0],
    },
    offeredBy: {
      '@type': 'TravelAgency',
      name: 'TravelMore',
      url: baseUrl,
      logo: `${baseUrl}/logo.png` // Pastikan ada file ini di folder public
    },
    ...(packageData.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: packageData.rating,
        bestRating: "5",
        ratingCount: "50" 
      }
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PackageDetailView initialData={packageData} />
    </>
  );
}