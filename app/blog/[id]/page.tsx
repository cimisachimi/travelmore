import { blogs } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";

interface Props {
  params: { id: string };
}

// Tentukan id blog yang akan di-generate
export async function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export default function BlogDetail({ params }: Props) {
  const blog = blogs.find((b) => b.id === params.id);

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
        Artikel tidak ditemukan.
      </div>
    );
  }

  const contentHtml = marked.parse(blog.content);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="text-primary font-medium hover:underline mb-6 inline-block"
      >
        ← Kembali ke Blog
      </Link>

      <h1 className="text-4xl font-bold mb-4 text-gray-800">{blog.title}</h1>
      <div className="text-gray-500 mb-6">{blog.date} • {blog.author}</div>

      <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden">
        <Image src={blog.image} alt={blog.title} fill className="object-cover" />
      </div>

      <article
        className="prose prose-lg max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
