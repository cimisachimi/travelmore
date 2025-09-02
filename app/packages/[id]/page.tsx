import Image from "next/image";
import Link from "next/link";

const packagesData = {
  "borobudur-prambanan": {
    title: "2 Days: Borobudur & Prambanan",
    imgSrc: "/hero-1.jpg",
    price: "Rp 2.500.000",
    description: "Nikmati sunrise di Borobudur dan jelajahi kemegahan Candi Prambanan dalam perjalanan dua hari yang tak terlupakan.",
    facilities: ["Hotel 2 malam", "Transportasi AC", "Breakfast", "Guide"],
    destinations: ["Borobudur", "Prambanan"],
    wa: "6281234567890",
  },
  "yogyakarta-adventure": {
    title: "3 Days: Yogyakarta Adventure",
    imgSrc: "/hero-2.jpg",
    price: "Rp 3.800.000",
    description: "Rasakan petualangan seru di Goa Jomblang, Pantai Timang, dan lereng Merapi selama tiga hari penuh aksi.",
    facilities: ["Hotel 3 malam", "Transportasi AC", "Breakfast", "Guide", "Tiket masuk"],
    destinations: ["Jomblang Cave", "Timang Beach", "Merapi Volcano"],
    wa: "6281234567890",
  },
  "cultural-immersion": {
    title: "4 Days: Cultural Immersion",
    imgSrc: "/hero-3.jpg",
    price: "Rp 4.200.000",
    description: "Menyelami budaya Jogja dengan kunjungan ke Keraton, Taman Sari, dan workshop batik selama empat hari.",
    facilities: ["Hotel 4 malam", "Transportasi AC", "Breakfast", "Guide", "Workshop Batik"],
    destinations: ["Sultan's Palace", "Taman Sari", "Batik Workshop"],
    wa: "6281234567890",
  },
};

export default function PackageDetail({ params }: { params: { id: string } }) {
  const pkg = packagesData[params.id];

  if (!pkg) return <div className="p-8 text-center text-gray-500">Package not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white rounded-xl shadow-lg mt-8">
      <div className="overflow-hidden rounded-xl mb-6">
        <Image
          src={pkg.imgSrc}
          alt={pkg.title}
          width={800}
          height={400}
          className="object-cover w-full h-64 md:h-80 transition duration-300 hover:scale-105"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{pkg.title}</h1>
      <div className="mb-4 text-lg font-semibold text-primary">Harga: {pkg.price}</div>
      <p className="mb-6 text-gray-700">{pkg.description}</p>
      <div className="mb-4">
        <h2 className="font-bold mb-1 text-gray-800">Fasilitas:</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {pkg.facilities.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-bold mb-1 text-gray-800">Destinasi:</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {pkg.destinations.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <Link
        href={`https://wa.me/${pkg.wa}?text=Halo%20saya%20ingin%20memesan%20paket%20${encodeURIComponent(pkg.title)}`}
        target="_blank"
        className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition"
      >
        Pesan via WhatsApp
      </Link>
    </div>
  );
}