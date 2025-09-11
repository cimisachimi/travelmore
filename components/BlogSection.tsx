"use client";

export default function BlogSection() {
  const blogs = [
    {
      title: "10 Destinasi Wisata Hits di Jogja 2025",
      excerpt:
        "Temukan tempat-tempat wisata terbaru dan populer di Yogyakarta yang wajib masuk daftar perjalanan Anda.",
      image:
        "https://images.unsplash.com/photo-1597218228539-87224cdbed27?auto=format&fit=crop&w=800&q=80",
      date: "5 September 2025",
      author: "Travelmore Team",
    },
    {
      title: "Tips Hemat Liburan di Yogyakarta",
      excerpt:
        "Nikmati perjalanan seru tanpa menguras dompet. Berikut tips hemat saat liburan di Jogja.",
      image:
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
      date: "28 Agustus 2025",
      author: "Travelmore Team",
    },
    {
      title: "Kuliner Khas Jogja yang Wajib Dicoba",
      excerpt:
        "Tidak lengkap rasanya ke Jogja tanpa mencicipi makanan khasnya. Ini rekomendasi terbaik untuk Anda.",
      image:
        "https://images.unsplash.com/photo-1604908177522-040ecbb4f1d5?auto=format&fit=crop&w=800&q=80",
      date: "20 Agustus 2025",
      author: "Travelmore Team",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Artikel & Blog</h2>
          <p className="text-gray-500 mt-2">
            Inspirasi perjalanan, tips liburan, dan cerita seru dari Travelmore.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-6 flex flex-col flex-1">
                <span className="text-sm text-teal-600">{blog.date}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 flex-1 line-clamp-3">
                  {blog.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{blog.author}</span>
                  <a
                    href="#"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Baca Selengkapnya →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
