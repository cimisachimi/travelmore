// app/[locale]/auth/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { useRouter } from "@/i18n/navigation"; 
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const { handleSocialCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Social login failed. Please try again.");
      router.push("/login");
    } else if (token && name) {
      
      handleSocialCallback(token, name);
     
    } else {
      
      toast.error("Invalid authentication callback.");
      router.push("/login");
    }
  }, [searchParams, router, handleSocialCallback]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <p className="text-foreground">Authenticating, please wait...</p>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() requires it
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}