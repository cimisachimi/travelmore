// app/[locale]/blog/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl"; 
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Calendar, User, ArrowRight } from "lucide-react";

interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  author: string;
  images: string[]; 
}

function encryptId(n: number) {
    const salt = 54321; 
    const val = (n * salt) + 99999; 
    return val.toString(36).toUpperCase(); 
}

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
  const locale = useLocale(); 

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await api.get("/public/posts?limit=9", { 
          headers: { "Accept-Language": locale }
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

  return (
    
    <section className="bg-white min-h-screen py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
      
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs mb-2 block">Our Blog</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t("title", { defaultMessage: "Latest Stories" })}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle", { defaultMessage: "Updates, tips, and inspiration for your next journey." })}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
             
              <div key={i} className="bg-gray-50 rounded-3xl border border-gray-100 flex flex-col overflow-hidden">
                <div className="h-60 w-full bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : (
            blogs.map((blog) => {
              const cleanSlug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              const uniqueCode = encryptId(blog.id);
              const href = `/blog/${cleanSlug}-${uniqueCode}`;
              const imageUrl = getImageUrl(blog.images?.[0]);

              return (
                <Link
                  key={blog.id}
                  href={href}
                 
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group border border-gray-100 h-full"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                     <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized={imageUrl.startsWith('http')}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(blog.published_at).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
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

                    <span className="inline-flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all">
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