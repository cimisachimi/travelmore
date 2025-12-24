"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import api from "@/lib/api";
import { Calendar, User, ArrowRight } from "lucide-react";

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

// ✅ FIX: Fungsi encryptId agar konsisten dengan halaman detail
function encryptId(n: number) {
    const salt = 54321; 
    const val = (n * salt) + 99999; 
    return val.toString(36).toUpperCase(); 
}

// Helper untuk URL gambar
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${baseUrl}/storage/${cleanPath}`;
};

export default function BlogSection() {
  const t = useTranslations("blogSection");
  const params = useParams(); 
  const locale = (params.locale as string) || "en"; 

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await api.get("/public/posts?limit=3", {
            headers: {
                "Accept-Language": locale 
            }
        });
        
        setBlogs(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [locale]); 

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
            blogs.map((blog) => {
              // ✅ FIX: Buat slug lengkap dengan encryptId agar match dengan halaman detail
              const cleanSlug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              const uniqueCode = encryptId(blog.id);
              const href = `/${locale}/blog/${cleanSlug}-${uniqueCode}`;
              const imageUrl = getImageUrl(blog.images?.[0]);

              return (
                <Link
                  key={blog.id}
                  href={href} 
                  className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group border border-gray-100 h-full"
                >
                  {/* Gambar */}
                  <div className="relative h-60 w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={imageUrl.startsWith('http')}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>

                  {/* Konten */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(blog.published_at).toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </span>
                        {blog.author && (
                             <span className="flex items-center gap-1">
                                <User size={12} /> {blog.author}
                             </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                      {blog.excerpt}
                    </p>
                    
                    <span className="inline-flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all mt-auto">
                      Read More <ArrowRight size={16} className="ml-1" />
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}