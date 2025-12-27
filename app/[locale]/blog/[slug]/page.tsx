// app/[locale]/blog/[slug]/page.tsx
import { Metadata } from "next"; 
import { notFound, permanentRedirect } from "next/navigation";
import BlogDetailView from "@/components/views/BlogDetailView";

interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  author?: string;
  images: string[];
}

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

// Helper Functions
function encryptId(n: number) {
    const salt = 54321; 
    const val = (n * salt) + 99999; 
    return val.toString(36).toUpperCase(); 
}

function extractOriginalSlug(fullSlug: string) {
    const parts = fullSlug.split('-');
    return parts.slice(0, -1).join('-');
}

async function getBlogDataBySlug(originalSlug: string, locale: string): Promise<Blog | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  try {
    const res = await fetch(`${apiUrl}/public/posts/${originalSlug}`, {
      headers: { "Accept-Language": locale },
      next: { revalidate: 3600 }, 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch { 
    // ✅ FIX: Hapus variabel 'error' karena tidak digunakan
    return null; 
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: fullSlug, locale } = await params;
  const originalSlug = extractOriginalSlug(fullSlug);
  const blog = await getBlogDataBySlug(originalSlug, locale);

  if (!blog) return { title: "Blog Not Found", robots: "noindex" };

  const correctFullSlug = `${blog.slug}-${encryptId(blog.id)}`;
  const canonicalUrl = `${baseUrl}/${locale}/blog/${correctFullSlug}`;

  return {
    title: `${blog.title} | TravelMore Blog`,
    description: blog.excerpt ? blog.excerpt.substring(0, 160) + "..." : blog.title,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/blog/${correctFullSlug}`,
        'id': `${baseUrl}/id/blog/${correctFullSlug}`,
      },
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonicalUrl,
      images: [{ url: blog.images?.[0] || '/default-blog.jpg' }],
      type: 'article',
      publishedTime: blog.published_at,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug: fullSlug, locale } = await params;
  const originalSlug = extractOriginalSlug(fullSlug);
  const blogData = await getBlogDataBySlug(originalSlug, locale);
  
  if (!blogData) notFound();


  const correctFullSlug = `${blogData.slug}-${encryptId(blogData.id)}`;
  if (fullSlug !== correctFullSlug) {
    permanentRedirect(`/${locale}/blog/${correctFullSlug}`);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogData.title,
    image: blogData.images?.[0],
    datePublished: blogData.published_at,
    author: { '@type': 'Person', name: blogData.author || 'TravelMore Team' },
    description: blogData.excerpt,
    publisher: {
      '@type': 'Organization',
      'name': 'TravelMore',
      'logo': { '@type': 'ImageObject', url: `${baseUrl}/logo.png` }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailView initialData={blogData} />
    </>
  );
}