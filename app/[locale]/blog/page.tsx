// app/[locale]/blog/page.tsx
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
        
        // ✅ FIXED: Removed the extra '/api' prefix.
        // The 'api' helper already includes it.
        const response = await api.get("/public/posts?limit=3");
        
        setBlogs(response.data.data); // API data is in `response.data.data`
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="bg-card py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="text-foreground/80 mt-3 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Simple loading placeholders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-background rounded-3xl shadow-md flex flex-col overflow-hidden border border-border">
                <div className="relative h-60 w-full bg-foreground/10 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-foreground/10 rounded w-1/4"></div>
                  <div className="h-6 bg-foreground/10 rounded w-3/4 mt-3"></div>
                  <div className="h-4 bg-foreground/10 rounded w-full mt-4"></div>
                  <div className="h-4 bg-foreground/10 rounded w-full mt-2"></div>
                  <div className="h-4 bg-foreground/10 rounded w-1/2 mt-4"></div>
                </div>
              </div>
            ))
          ) : (
            blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="bg-background rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group border border-border"
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
                    <div className="h-full w-full bg-foreground/10 flex items-center justify-center text-foreground/50">
                      No Image
                    </div>
                  )}
                </div>

                {/* Konten */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-sm text-foreground/60">
                    {new Date(blog.published_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                  <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-foreground/80 mt-3 flex-1">
                    {blog.excerpt}
                  </p>
                  <span className="mt-4 text-sm font-medium text-foreground">
                    {blog.author}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Show More Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-black transition-colors"
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