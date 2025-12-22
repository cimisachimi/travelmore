
// app/sitemap.ts
import { MetadataRoute } from 'next';

type Package = {
  id: number;
  name: string; 
  updated_at?: string; 
};

// Helper slug yang SAMA PERSIS dengan di page.tsx
function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/(^-|-$)+/g, ''); 
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. Ambil Data
  let allPackages: Package[] = [];
  try {
    const res = await fetch(`${apiUrl}/public/packages?per_page=1000`, {
        next: { revalidate: 3600 } // Cache 1 jam agar build cepat
    });
    const responseJson = await res.json();
    allPackages = responseJson.data || [];
  } catch (error) {
    console.error("Sitemap Fetch Error:", error);
  }

  // 2. Tentukan Bahasa yang didukung
  const locales = ['en', 'id'];

  // 3. Generate URL Statis untuk setiap bahasa
  // Hasil: /en, /id, /en/packages, /id/packages, dll.
  const staticPages = [
    '',
    '/packages',
    '/activities',
    '/blog',
    '/about',
    '/contact',
  ];

  const staticRoutes = staticPages.flatMap((route) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8, // Home priority 1, lainnya 0.8
    }))
  );

 
  const packageRoutes = allPackages.flatMap((pkg) => 
    locales.map((locale) => ({
      
      url: `${baseUrl}/${locale}/packages/${pkg.id}-${createSlug(pkg.name)}`,
      lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9, 
    }))
  );

  // 5. Gabungkan
  return [...staticRoutes, ...packageRoutes];
}