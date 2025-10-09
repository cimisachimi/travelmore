// components/PopularPackages.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

// ✅ 1. Definisikan tipe untuk satu 'package'
interface IPackage {
  id: string;
  title: string;
  description: string;
}

const PackageCard = ({
  id,
  imgSrc,
  title,
  description,
  cta
}: {
  id: string;
  imgSrc: string;
  title: string;
  description: string;
  cta: string;
}) => (
  <div className="relative rounded-lg overflow-hidden shadow-lg group">
    <Image
      src={imgSrc}
      alt={title}
      width={400}
      height={500}
      className="object-cover w-full h-96 transform group-hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6 text-white">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-gray-300 mt-2">{description}</p>
      <Link
        href={`/packages/${id}`}
        className="inline-block mt-4 text-primary font-semibold hover:underline"
      >
        {cta}
      </Link>
    </div>
  </div>
);

const PopularPackages: React.FC = () => {
  const t = useTranslations("PopularPackages");
  
  // ✅ 2. Beri tahu TypeScript bahwa 'packages' adalah array dari IPackage
  const packages = t.raw("packages") as IPackage[];

  return (
    <section className="bg-background py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground/80 mt-2">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ✅ 3. Hapus tipe 'any', TypeScript sekarang sudah tahu tipe 'pkg' */}
          {packages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              id={pkg.id}
              imgSrc={`/hero-${index + 1}.jpg`} // Pastikan gambar ini ada
              title={pkg.title}
              description={pkg.description}
              cta={t("cta")}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularPackages;