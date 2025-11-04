"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function FacebookLoginButton() {
  const { loginWithFacebook } = useAuth(); // Get the function from context

  return (
    <button
      type="button"
      onClick={loginWithFacebook} // Use the context function directly
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors duration-300"
    >
      <Image
        src="/icons/facebookLogo.webp"
        alt="Facebook icon"
        width={20}
        height={20}
      />
      <span className="text-sm font-semibold">Continue with Facebook</span>
    </button>
  );
}