import Image from "next/image";
import Link from "next/link";
import { packages } from "@/data/packages";

// Fungsi ini memberi tahu Next.js untuk membuat halaman statis
export async function generateStaticParams() {
  return packages.map((pkg) => ({
    id: pkg.id, // ID sudah string, tidak perlu konversi
  }));
}

export default function PackageDetail({ params }: { params: { id: string } }) {
  // Cari paket berdasarkan ID (tidak perlu konversi)
  const pkg = packages.find((p) => p.id === params.id);

  if (!pkg) {
    return <div className="p-8 text-center text-gray-500">Package not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white rounded-xl shadow-lg mt-8">
      <div className="overflow-hidden rounded-xl mb-6">
        <Image
          src={pkg.image}
          alt={pkg.title}
          width={800}
          height={400}
          className="object-cover w-full h-64 md:h-80 transition duration-300 hover:scale-105"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{pkg.title}</h1>
      <div className="mb-4 text-lg font-semibold text-blue-600">
        Harga Reguler: Rp {pkg.regularPrice.toLocaleString('id-ID')}
        <br />
        Harga Eksklusif: Rp {pkg.exclusivePrice.toLocaleString('id-ID')}
      </div>
      <p className="mb-6 text-gray-700">{pkg.description}</p>
      
      {/* Catatan: Properti 'facilities', 'destinations', dan 'wa' tidak ada di data baru, jadi saya hapus. */}
      {/* Anda bisa menambahkan kembali jika memperbarui data di packages.ts */}

      <Link
        href="/packages"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition"
      >
        ← Kembali ke Paket
      </Link>
    </div>
  );
}