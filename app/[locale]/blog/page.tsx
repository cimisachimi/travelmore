// app/[locale]/blog/page.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blog";
import { useTranslations } from "next-intl";

export default function BlogListPage() {
  const t = useTranslations("blog");

  return (
    <section className="py-20 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">{t("title")}</h2>
          <p className="text-foreground/70 mt-3 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              className="bg-card rounded-3xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-sm text-foreground/50">{blog.date}</span>
                <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-foreground/70 mt-3 flex-1">{blog.excerpt}</p>
                <span className="mt-4 text-sm font-medium text-foreground/80">
                  {t("by")} {blog.author}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
