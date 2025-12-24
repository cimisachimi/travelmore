// app/[locale]/packages/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import PackageDetailView from "@/components/views/PackageDetailView";
import { notFound } from "next/navigation"; 
import { HolidayPackage } from "@/types/package";
import { MessageCircle } from "lucide-react"; 

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

async function getPackageData(slug: string): Promise<HolidayPackage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!slug) return null;

  try {
    const res = await fetch(`${apiUrl}/public/packages/slug/${slug}`, {
      next: { revalidate: 60 }, 
    });
    if (!res.ok) return null;
    return res.json();
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
  const product = await getPackageData(slug);

  if (!product) {
    return {
      title: "Package Not Found | TravelMore",
      description: "The package you are looking for does not exist.",
      robots: "noindex, nofollow", 
    };
  }

  const canonicalUrl = `${baseUrl}/${locale}/packages/${product.slug}`;
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
        'en': `${baseUrl}/en/packages/${product.slug}`,
        'id': `${baseUrl}/id/packages/${product.slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description: `Lokasi: ${product.location}. Mulai dari ${priceFormatted}. Pesan sekarang!`,
      url: canonicalUrl,
      siteName: 'TravelMore',
      images: [{ url: productImage, width: 1200, height: 630, alt: product.name }, ...previousImages],
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const packageData = await getPackageData(slug);

  if (!packageData) {
    notFound(); 
  }

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
      url: `${baseUrl}/${locale}/packages/${packageData.slug}`, 
      validFrom: new Date().toISOString(),
      priceValidUntil: nextYear.toISOString().split('T')[0],
    },
    offeredBy: {
      '@type': 'TravelAgency',
      name: 'TravelMore',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`
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

  // WhatsApp Config
  const whatsappNumber = "6282224291148";
  const whatsappMsg = encodeURIComponent(`Hi TravelMore! I'm interested in the "${packageData.name}" package. Can we discuss custom arrangements?`);

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PackageDetailView initialData={packageData} />

      {/* Specific "Need help with booking?" Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Need help with booking?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Contact our support team for custom arrangements.
          </p>
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:brightness-95 text-black font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <MessageCircle size={20} />
            Send Us a Message
          </a>
        </div>
      </div>
    </div>
  );
}