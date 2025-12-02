"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import api from "@/lib/api";

// Interface to match API response
interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  author: string;
  images: string[];
}

export default function BlogSection() {
  const t = useTranslations("blogSection");

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Mengambil hanya 3 post terbaru untuk halaman utama
        const response = await api.get("/public/posts?limit=3");
        
        // Pastikan menyesuaikan struktur response API Anda
        // Jika response.data.data adalah array, gunakan itu.
        setBlogs(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Jika tidak ada blog dan tidak loading, sembunyikan section (opsional)
  if (!loading && blogs.length === 0) {
    return null; 
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            {t("title")}
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Simple loading placeholders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-md flex flex-col overflow-hidden border border-gray-100">
                <div className="relative h-60 w-full bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mt-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : (
            blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group border border-gray-100"
              >
                {/* Gambar */}
                <div className="relative h-60 w-full overflow-hidden">
                  {blog.images.length > 0 ? (
                    <Image
                      src={blog.images[0]}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Konten */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-sm text-gray-500">
                    {new Date(blog.published_at).toLocaleDateString("id-ID", {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                  <h3 className="text-xl font-semibold mt-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mt-3 flex-1 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <span className="mt-4 text-sm font-medium text-gray-900">
                    Oleh {blog.author}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Show More Button - Mengarah ke halaman /blog utama */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            {t("button")}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}