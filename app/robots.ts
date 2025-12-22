// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelmore.travel';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow halaman yang tidak perlu diindeks (Admin, API, Akun user)
      disallow: [
        '/api/', 
        '/admin/', 
        '/profile/', 
        '/login/', 
        '/register/',
        '/_next/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}