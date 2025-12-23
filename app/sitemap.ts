// app/sitemap.ts
import { MetadataRoute } from 'next';

// Generic item type covering packages, activities, cars, AND Open Trips
type Item = {
  id: number;
  name?: string; // For packages, activities, open trips
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ''); // Safety: remove trailing slash

  // 1. Fetch Packages
  let allPackages: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/packages?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allPackages = json.data || [];
  } catch (error) {
    console.error("Sitemap Packages Error:", error);
  }

  // 2. Fetch Activities
  let allActivities: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/activities?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allActivities = json.data || [];
  } catch (error) {
    console.error("Sitemap Activities Error:", error);
  }

  // 3. Fetch Cars (Using /public)
  let allCars: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/public/car-rentals?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allCars = json.data || [];
  } catch (error) {
    console.error("Sitemap Cars Error:", error);
  }

  // 4. ✅ Fetch Open Trips (FIX: Tanpa /public)
  let allOpenTrips: Item[] = [];
  try {
    const res = await fetch(`${apiUrl}/open-trips?per_page=1000`, { next: { revalidate: 3600 } });
    const json = await res.json();
    allOpenTrips = json.data || [];
  } catch (error) {
    console.error("Sitemap Open Trips Error:", error);
  }

  const locales = ['en', 'id'];

  // 5. Static Routes
  const staticPages = ['', '/packages', '/activities', '/car-rental', '/open-trip', '/blog', '/about', '/contact'];
  const staticRoutes = staticPages.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  // 6. Package Routes
  const packageRoutes = allPackages.flatMap((pkg) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/packages/${pkg.id}-${createSlug(pkg.name || "")}`,
      lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // 7. Activity Routes
  const activityRoutes = allActivities.flatMap((act) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/activities/${act.id}-${createSlug(act.name || "")}`,
      lastModified: act.updated_at ? new Date(act.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // 8. Car Routes
  const carRoutes = allCars.flatMap((car) =>
    locales.map((locale) => {
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

  // 9. Open Trip Routes
  const openTripRoutes = allOpenTrips.flatMap((trip) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/open-trip/${trip.id}-${createSlug(trip.name || "")}`,
      lastModified: trip.updated_at ? new Date(trip.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  return [...staticRoutes, ...packageRoutes, ...activityRoutes, ...carRoutes, ...openTripRoutes];
}