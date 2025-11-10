// app/[locale]/auth/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
// ✅ FIX: Keep useSearchParams from next/navigation
import { useSearchParams } from "next/navigation"; 
// ✅ FIX: Import useRouter from your i18n/navigation file
import { useRouter } from "@/i18n/navigation"; 
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ FIX: This is now the locale-aware router
  const { handleSocialCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Social login failed. Please try again.");
      router.push("/login");
    } else if (token && name) {
      // ✅ FIX: This now calls the async handleSocialCallback
      // No need to await it here, just let it run
      handleSocialCallback(token, name);
      // The function itself will handle the redirect
    } else {
      // No token or error, something went wrong
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