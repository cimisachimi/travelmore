// app/sitemap.ts

import { MetadataRoute } from 'next';

// 1. Definisi Tipe Data dari API
type Item = {
  id: number;
  slug?: string;
  name?: string;
  brand?: string;
  car_model?: string;
  updated_at?: string;
  // Struktur gambar yang berbeda-beda dari API
  images_url?: { url: string }[]; 
  images?: { url: string }[];
  thumbnail_url?: string;
};

// 2. Interface Khusus untuk Sitemap agar support Images tanpa 'any'
interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    languages: Record<string, string>;
  };
  images?: string[]; // Properti ini yang kita butuhkan untuk Google Images
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ✅ Helper untuk mengekstrak URL gambar utama yang valid
function getMainImage(item: Item): string | undefined {
  let imgPath: string | undefined;

  // 1. Cek struktur images_url (Paket & Aktivitas)
  if (item.images_url && Array.isArray(item.images_url) && item.images_url.length > 0) {
    imgPath = item.images_url[0].url;
  }
  // 2. Cek struktur images (Mobil)
  else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    imgPath = item.images[0].url;
  }
  // 3. Cek struktur thumbnail_url (Open Trip)
  else if (item.thumbnail_url) {
    imgPath = item.thumbnail_url;
  }

  if (!imgPath) return undefined;

  // 4. Pastikan URL Absolute.
  if (imgPath.startsWith('http')) {
    return imgPath;
  } else {
    // Bersihkan slash untuk mencegah double slash
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.travelmore.travel').replace(/\/$/, '');
    const cleanPath = imgPath.replace(/^\//, '');
    return `${apiBase}/storage/${cleanPath}`;
  }
}

// ✅ Helper function agar fetch aman
async function safeFetchData(url: string): Promise<Item[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      console.warn(`Sitemap Fetch Warning: ${url} returned status ${res.status}`);
      return [];
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`Sitemap Fetch Warning: ${url} returned non-JSON content.`);
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(`Sitemap Fetch Error for ${url}:`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.travelmore.travel'; 

  // 1. Fetch Data Parallel
  const [allPackages, allActivities, allCars, allOpenTrips] = await Promise.all([
    safeFetchData(`${apiUrl}/public/packages?per_page=1000`),
    safeFetchData(`${apiUrl}/activities?per_page=1000`),
    safeFetchData(`${apiUrl}/public/car-rentals?per_page=1000`),
    safeFetchData(`${apiUrl}/open-trips?per_page=1000`),
  ]);

  const locales = ['en', 'id'];

  const getLastModified = (dateString?: string) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const getAlternates = (path: string) => {
    return {
      languages: {
        en: `${baseUrl}/en${path}`,
        id: `${baseUrl}/id${path}`,
      },
    };
  };

  // 2. Static Routes
  const staticPages = ['', '/packages', '/activities', '/car-rental', '/open-trip', '/blog', '/about', '/contact'];
  const staticRoutes: SitemapEntry[] = staticPages.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
      alternates: getAlternates(route),
    }))
  );

  // 3. Dynamic Routes (Packages)
  const packageRoutes: SitemapEntry[] = allPackages.flatMap((pkg) => {
    const slugPath = `/packages/${pkg.id}-${createSlug(pkg.name || "")}`;
    const mainImage = getMainImage(pkg);

    return locales.map((locale) => {
      const entry: SitemapEntry = {
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified: getLastModified(pkg.updated_at),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: getAlternates(slugPath),
      };
      if (mainImage) entry.images = [mainImage]; 
      return entry;
    });
  });

  // 4. Dynamic Routes (Activities)
  const activityRoutes: SitemapEntry[] = allActivities.flatMap((act) => {
    const slugPath = `/activities/${act.id}-${createSlug(act.name || "")}`;
    const mainImage = getMainImage(act);

    return locales.map((locale) => {
      const entry: SitemapEntry = {
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified: getLastModified(act.updated_at),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: getAlternates(slugPath),
      };
      if (mainImage) entry.images = [mainImage];
      return entry; // ✅ FIX: Jangan lupa return entry!
    });
  });

  // 5. Dynamic Routes (Cars)
  const carRoutes: SitemapEntry[] = allCars.flatMap((car) => {
    const carName = `${car.brand} ${car.car_model}`;
    const slugPath = `/car-rental/${car.id}-${createSlug(carName)}`;
    const mainImage = getMainImage(car);

    return locales.map((locale) => {
      const entry: SitemapEntry = {
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified: getLastModified(car.updated_at),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: getAlternates(slugPath),
      };
      if (mainImage) entry.images = [mainImage]; 
      return entry;
    });
  });

  // 6. Dynamic Routes (Open Trips)
  const openTripRoutes: SitemapEntry[] = allOpenTrips.flatMap((trip) => {
    const slugPath = `/open-trip/${trip.id}-${createSlug(trip.name || "")}`;
    const mainImage = getMainImage(trip);

    return locales.map((locale) => {
      const entry: SitemapEntry = {
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified: getLastModified(trip.updated_at),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: getAlternates(slugPath),
      };
      if (mainImage) entry.images = [mainImage]; 
      return entry;
    });
  });

  // Cast return ke MetadataRoute.Sitemap untuk kepatuhan Next.js
  return [
    ...staticRoutes,
    ...packageRoutes,
    ...activityRoutes,
    ...carRoutes,
    ...openTripRoutes,
  ] as MetadataRoute.Sitemap;
}