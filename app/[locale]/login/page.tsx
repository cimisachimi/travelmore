// app/[locale]/login/page.tsx
"use client";

import { useState, useEffect } from "react"; 
import { useAuth } from "@/contexts/AuthContext";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation"; 
import Image from "next/image";
import Link from "next/link";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams(); 

  
  const redirectTarget = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      
      
      if (redirectTarget) {
        
        router.push(decodeURIComponent(redirectTarget));
      } else {
        router.push("/profile"); 
      }

    } catch (err: unknown) {
      if (isAxiosError(err) && typeof err.response?.data?.message === "string") {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected login error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user && !loading) {
      if (redirectTarget) {
        router.push(decodeURIComponent(redirectTarget));
      } else {
        router.push("/profile");
      }
    }
  }, [user, loading, router, redirectTarget]);

  
  if (user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Welcome back, {user.name}!</p>
        <p className="text-sm text-center text-foreground/70">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center min-h-screen py-20 px-4"
      style={{
        backgroundImage: "url(/bg2.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-card/95 dark:bg-card/85 backdrop-blur-lg rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-foreground/70">
            Login to manage your adventures.
          </p>
        </div>

        <div className="space-y-3">
          
          <GoogleLoginButton />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card text-foreground/60">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:ring-2 focus:ring-primary focus:outline-none transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:ring-2 focus:ring-primary focus:outline-none transition"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-90 transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-foreground/70">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}