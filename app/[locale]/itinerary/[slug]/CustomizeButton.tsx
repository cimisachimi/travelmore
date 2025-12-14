// app/[locale]/itinerary/[slug]/CustomizeButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

interface CustomizeButtonProps {
  url: string;
  btnText: string;
  loginText: string;
  description: string;
}

export default function CustomizeButton({ 
  url, 
  btnText, 
  loginText,
  description 
}: CustomizeButtonProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // --- CEK STATUS LOGIN ---
    // Ganti logika ini dengan cara pengecekan Auth asli di aplikasi Anda
    // Contoh: Cek apakah ada token di localStorage atau cookies
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token"); 
    // Atau jika pakai hook: const { user } = useAuth(); setIsLoggedIn(!!user);
    
    setIsLoggedIn(!!token); 
  }, []);

  // KONDISI 1: SUDAH LOGIN -> Tampilkan Tombol Link Biasa
  if (isLoggedIn) {
    return (
      <div className="space-y-3">
        <Link
          href={url}
          className="flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-center transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{btnText}</span>
          <ArrowLeft size={18} className="rotate-180" />
        </Link>
        <p className="text-xs text-center text-gray-500 px-4 leading-relaxed">
          {description}
        </p>
      </div>
    );
  }

  // KONDISI 2: BELUM LOGIN -> Tampilkan Tombol Terkunci (Lock)
  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          // Arahkan ke login, lalu redirect balik ke halaman planner tujuan
          const targetUrl = encodeURIComponent(url); 
          router.push(`/login?redirect=${targetUrl}`);
        }}
        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl text-center transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span>{loginText}</span>
        <Lock size={18} />
      </button>
      <p className="text-xs text-center text-gray-500 px-4 leading-relaxed italic">
        *Login required to customize this plan
      </p>
    </div>
  );
}