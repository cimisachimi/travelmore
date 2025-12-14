// app/[locale]/gallery/page.tsx
import GalleryGrid from "@/components/GalleryGrid";
import { useTranslations } from "next-intl";

export default function GalleryPage() {
  const t = useTranslations("galleryPage");

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pt-16 pb-12 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            {/* You can use t('title') here */}
            Explore Our Destinations
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover the breathtaking beauty of Indonesia through our lens. 
            Find your next adventure among these hand-picked spots.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl">
        <GalleryGrid />
      </div>
    </main>
  );
}