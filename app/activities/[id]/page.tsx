// app/activities/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { activities } from "@/data/activities";

export async function generateStaticParams() {
  return activities.map((act) => ({
    id: act.id,
  }));
}

export default function ActivityDetail({ params }: { params: { id: string } }) {
  const activity = activities.find((a) => a.id === params.id);

  if (!activity) {
    return <div className="p-8 text-center text-gray-500">Activity not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white rounded-xl shadow-lg my-8">
      <div className="overflow-hidden rounded-xl mb-6">
        <Image
          src={activity.image}
          alt={activity.title}
          width={800}
          height={400}
          className="object-cover w-full h-64 md:h-80 transition duration-300 hover:scale-105"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{activity.title}</h1>
      <div className="mb-4 text-lg font-semibold text-primary dark:text-primary">
        Harga Reguler: Rp {activity.regularPrice.toLocaleString('id-ID')}
        <br />
        Harga Eksklusif: Rp {activity.exclusivePrice.toLocaleString('id-ID')}
      </div>
      <p className="mb-6 text-gray-700">{activity.description}</p>
      
      <div className="flex space-x-4">
        <Link
          href="/activities"
          className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-300 transition"
        >
          ← Kembali ke Aktivitas
        </Link>
        <Link
          href={`/booking?activity=${encodeURIComponent(activity.title)}`} // ✨ Updated Link
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition"
        >
          Pesan Sekarang
        </Link>
      </div>
    </div>
  );
}