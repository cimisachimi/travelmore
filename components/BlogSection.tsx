// components/BlogSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blog";
import { useTranslations } from "next-intl";

export default function BlogSection() {
  const t = useTranslations("blogSection");

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
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              className="bg-background rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group border border-border"
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
                <span className="text-sm text-foreground/60">{blog.date}</span>
                <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-foreground/80 mt-3 flex-1">{blog.excerpt}</p>
                <span className="mt-4 text-sm font-medium text-foreground">
                  {blog.author}
                </span>
              </div>
            </Link>
          ))}
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

