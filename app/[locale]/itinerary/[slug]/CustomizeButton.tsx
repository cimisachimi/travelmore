// app/[locale]/itinerary/[slug]/CustomizeButton.tsx
"use client";

import React from "react"; // Hapus useEffect dan useState manual
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

// ✅ 1. Import Auth Context (Agar satu sumber kebenaran dengan Login & Hero)
import { useAuth } from "@/contexts/AuthContext";

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
  
  // ✅ 2. Gunakan User dari Context, bukan cek localStorage manual
  const { user } = useAuth();
  
  // Cek status login
  const isLoggedIn = !!user;

  
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

  
  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          // ✅ 3. Logika Redirect yang sudah cocok dengan LoginPage Anda
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