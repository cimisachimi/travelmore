import { useState, useEffect } from 'react';

// Define the shape of the data we expect from the API
export interface BannerData {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  expires_at: string | null;
}

export function useBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Get API URL from your environment variables
    // You said: NEXT_PUBLIC_API_URL=http://localhost:8000/api
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

    if (!apiUrl) {
        console.error("Configuration Error: NEXT_PUBLIC_API_URL is missing");
        setLoading(false);
        return;
    }

    // 2. Fetch the banner data
    fetch(`${apiUrl}/public/banner`, {
      headers: {
        'Accept': 'application/json',
      }
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch banner");
        return res.json();
    })
    .then((response) => {
      // The API returns { data: { ... } } or { data: null }
      setBanner(response.data); 
      setLoading(false);
    })
    .catch((err) => {
      console.error("Banner fetch error:", err);
      setLoading(false);
    });
  }, []);

  return { banner, loading };
}