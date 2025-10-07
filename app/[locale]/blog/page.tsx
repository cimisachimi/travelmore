"use client";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blog";

export default function BlogListPage() {
  return (
    // Menggunakan bg-background dan text-foreground untuk warna dinamis
    <section className="py-20 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Artikel & Blog</h2>
          <p className="text-foreground/70 mt-3 max-w-2xl mx-auto">
            Inspirasi perjalanan, tips liburan, dan cerita seru dari Travelmore.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              // Menggunakan bg-card untuk warna kartu
              className="bg-card rounded-3xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden group"
            >
              {/* Gambar */}
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Konten */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-sm text-foreground/50">{blog.date}</span>
                <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-foreground/70 mt-3 flex-1">{blog.excerpt}</p>
                <span className="mt-4 text-sm font-medium text-foreground/80">{blog.author}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}