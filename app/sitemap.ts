import { MetadataRoute } from 'next';

// Generic item type covering packages, activities, and cars
type Item = {
  id: number;
  name?: string; // For packages & activities
  brand?: string; // For cars
  car_model?: string; // For cars
  updated_at?: string;
};

// Helper slug generator
function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. Fetch Packages (Asumsi: API Packages tanpa /public)
  let allPackages: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/packages?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allPackages = json.data || [];
  } catch (error) {
    console.error("Sitemap Packages Error:", error);
  }

  // 2. Fetch Activities (Asumsi: API Activities tanpa /public, sesuai fix sebelumnya)
  let allActivities: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/activities?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allActivities = json.data || [];
  } catch (error) {
    console.error("Sitemap Activities Error:", error);
  }

  // 3. ✅ Fetch Cars (FIX: Menggunakan /public sesuai konfirmasi API Car Rental)
  let allCars: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/public/car-rentals?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allCars = json.data || [];
  } catch (error) {
    console.error("Sitemap Cars Error:", error);
  }

  const locales = ['en', 'id'];

  // 4. Static Routes
  const staticPages = ['', '/packages', '/activities', '/car-rental', '/blog', '/about', '/contact'];
  const staticRoutes = staticPages.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  // 5. Package Routes
  const packageRoutes = allPackages.flatMap((pkg) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/packages/${pkg.id}-${createSlug(pkg.name || "")}`,
      lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // 6. Activity Routes
  const activityRoutes = allActivities.flatMap((act) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/activities/${act.id}-${createSlug(act.name || "")}`,
      lastModified: act.updated_at ? new Date(act.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // 7. ✅ Car Routes
  const carRoutes = allCars.flatMap((car) =>
    locales.map((locale) => {
      // Create slug from Brand + Model (e.g., "Toyota Avanza")
      const carName = `${car.brand} ${car.car_model}`; 
      const slug = createSlug(carName);
      
      return {
        url: `${baseUrl}/${locale}/car-rental/${car.id}-${slug}`,
        lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      };
    })
  );

  return [...staticRoutes, ...packageRoutes, ...activityRoutes, ...carRoutes];
}