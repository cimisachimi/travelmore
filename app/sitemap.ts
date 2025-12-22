// app/sitemap.ts
import { MetadataRoute } from 'next';

type Item = {
  id: number;
  name: string;
  updated_at?: string;
};

// Helper slug yang konsisten
function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. Ambil Data Packages
  let allPackages: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/public/packages?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allPackages = json.data || [];
  } catch (error) {
    console.error("Sitemap Packages Error:", error);
  }

  // 2. ✅ TAMBAHAN: Ambil Data Activities
  let allActivities: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/public/activities?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allActivities = json.data || [];
  } catch (error) {
    console.error("Sitemap Activities Error:", error);
  }

  const locales = ['en', 'id'];

  // 3. Static Routes
  const staticPages = ['', '/packages', '/activities', '/blog', '/about', '/contact'];
  const staticRoutes = staticPages.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  // 4. Package Routes (Dynamic)
  const packageRoutes = allPackages.flatMap((pkg) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/packages/${pkg.id}-${createSlug(pkg.name)}`,
      lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // 5. ✅ TAMBAHAN: Activity Routes (Dynamic)
  const activityRoutes = allActivities.flatMap((act) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/activities/${act.id}-${createSlug(act.name)}`,
      lastModified: act.updated_at ? new Date(act.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  return [...staticRoutes, ...packageRoutes, ...activityRoutes];
}