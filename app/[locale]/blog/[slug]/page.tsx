import { Metadata, ResolvingMetadata } from "next";
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

// --- Helper Functions (Salt Consistency: 54321 & 99999) ---
function decryptId(code: string) {
    const salt = 54321;
    try {
        const val = parseInt(code, 36);
        const result = (val - 99999) / salt;
        return Number.isInteger(result) ? result : null;
    } catch (e) {
        return null;
    }
}

function encryptId(n: number) {
    const salt = 54321; 
    const val = (n * salt) + 99999; 
    return val.toString(36).toUpperCase(); 
}

function extractOriginalSlug(fullSlug: string) {
    const parts = fullSlug.split('-');
    return parts.slice(0, -1).join('-');
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${baseUrl}${path}`;
  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${apiUrl}/storage/${cleanPath}`;
};

async function getBlogDataBySlug(originalSlug: string, locale: string): Promise<Blog | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const url = `${apiUrl}/public/posts/${originalSlug}`;

  try {
    const res = await fetch(url, {
      headers: { 
          "Accept-Language": locale,
          "Accept": "application/json" 
      },
      next: { revalidate: 60 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json; 
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug: fullSlug, locale } = await params;
  const originalSlug = extractOriginalSlug(fullSlug);
  const blog = await getBlogDataBySlug(originalSlug, locale);

  if (!blog) return { title: "Blog Not Found", robots: "noindex" };

  const uniqueCode = encryptId(blog.id);
  const correctFullSlug = `${blog.slug}-${uniqueCode}`;
  const canonicalUrl = `${baseUrl}/${locale}/blog/${correctFullSlug}`;
  const mainImage = blog.images?.[0] || getImageUrl(null);

  return {
    title: blog.title,
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
      siteName: 'TravelMore',
      images: [{ url: mainImage, width: 1200, height: 630, alt: blog.title }],
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

  const uniqueCode = encryptId(blogData.id);
  const correctFullSlug = `${blogData.slug}-${uniqueCode}`;

  if (fullSlug !== correctFullSlug) {
    permanentRedirect(`/${locale}/blog/${correctFullSlug}`);
  }

  const mainImage = blogData.images?.[0] || getImageUrl(null);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogData.title,
    image: [mainImage],
    datePublished: blogData.published_at,
    author: [{ '@type': 'Person', name: blogData.author || 'TravelMore Team' }],
    description: blogData.excerpt
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