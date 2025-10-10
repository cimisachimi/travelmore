// app/[locale]/blog/[id]/page.tsx
import { blogs } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import { getTranslations } from "next-intl/server";
import "@/styles/prose.css"; // Impor file styling baru

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export default async function BlogDetail(props: Props) {
  const params = await props.params;
  const blogData = blogs.find((b) => b.id === params.id);

  const t = await getTranslations("blogDetail");
  const tBlog = await getTranslations(`blog.${params.id}`);

  if (!blogData) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-foreground/60">
        {t("notFound")}
      </div>
    );
  }

  // Mengambil konten mentah. Bisa berupa string atau array.
  const rawContent = tBlog.raw('content');

  // Memeriksa tipe data dan memprosesnya dengan sesuai.
  const contentMarkdown = Array.isArray(rawContent)
    ? rawContent.join('\n\n') // Jika array, gabungkan.
    : String(rawContent);     // Jika bukan, ubah menjadi string.

  const contentHtml = marked.parse(contentMarkdown);
  const title = tBlog("title");

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-foreground">
      <Link
        href="/blog"
        className="text-primary font-medium hover:underline mb-6 inline-block"
      >
        ← {t("back")}
      </Link>

      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <div className="text-foreground/60 mb-6">
        {blogData.date} • {t("by")} {blogData.author}
      </div>

      <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden">
        <Image
          src={blogData.image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}