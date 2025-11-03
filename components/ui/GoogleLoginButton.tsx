"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // This function is now defined in AuthContext
      await loginWithGoogle();
      // On success, the AuthContext will handle the user state and redirection
      toast.success("Logged in with Google successfully!");
    } catch (error) {
      // The context will handle showing specific errors
      console.error("Google login failed", error);
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors duration-300"
    >
      <Image
        src="/icons/google.svg"
        alt="Google icon"
        width={20}
        height={20}
      />
      <span className="text-sm font-semibold">Continue with Google</span>
    </button>
  );
}