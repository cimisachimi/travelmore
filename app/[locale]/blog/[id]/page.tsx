import { blogs } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import { useTranslations } from "next-intl";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export default async function BlogDetail(props: Props) {
  const params = await props.params;
  const blog = blogs.find((b) => b.id === params.id);
  const t = useTranslations("blogDetail");

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-foreground/60">
        {t("notFound")}
      </div>
    );
  }

  const contentHtml = marked.parse(blog.content);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-foreground">
      <Link
        href="/blog"
        className="text-primary font-medium hover:underline mb-6 inline-block"
      >
        ← {t("back")}
      </Link>

      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <div className="text-foreground/60 mb-6">
        {blog.date} • {t("by")} {blog.author}
      </div>

      <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover"
        />
      </div>

      <article
        className="prose prose-lg max-w-none text-foreground/80"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
