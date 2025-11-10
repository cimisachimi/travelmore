"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, FormEvent, useEffect } from "react"; // 1. Import useEffect

export default function VerifyEmailPage() {
  // 2. Get 'loading' from useAuth
  const { user, loading, resendVerification, updateEmail, logout } = useAuth();
  const router = useRouter();

  // State for loading spinners
  const [isResending, setIsResending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for the "change email" UI
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      toast.success("Verification email sent!");
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Please enter a new email address.");
      return;
    }
    setIsUpdating(true);
    try {
      await updateEmail(newEmail);
      // On success, reset the form
      setIsChangingEmail(false);
      setNewEmail("");
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // 3. ✅ --- THIS IS THE FIX ---
  // Move "Page Guards" into a useEffect hook to run *after* render
  useEffect(() => {
    // Don't do anything while auth status is being checked
    if (loading) {
      return;
    }

    // Guard 1: If user is logged out, redirect to login
    if (!user) {
      router.push("/login");
    }

    // Guard 2: If user is logged IN and ALREADY VERIFIED, redirect to profile
    if (user && user.email_verified_at) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  // 4. Show a loading screen while checking auth
  // This prevents the page from flashing or running guards too early
  if (loading || !user || (user && user.email_verified_at)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    );
  }
  
  // 5. By this point, we know:
  //    - loading is false
  //    - user exists
  //    - user.email_verified_at is null
  // So it is safe to render the page.

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
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 text-center bg-card/95 dark:bg-card/85 backdrop-blur-lg rounded-2xl shadow-xl">
        
        {/* --- This UI is for CHANGING email --- */}
        {isChangingEmail ? (
          <>
            <h1 className="text-3xl font-bold text-foreground">
              Update Your Email
            </h1>
            <p className="text-foreground/80">
              Enter a new email address below. We will send a new verification
              link.
            </p>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">New Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@new-email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:ring-2 focus:ring-primary focus:outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-90 transition-all disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Update and Resend Link"}
              </button>
            </form>
            <button
              onClick={() => setIsChangingEmail(false)}
              className="text-sm text-foreground/70 hover:underline"
            >
              Cancel
            </button>
          </>
        
        ) : (
          
          /* --- This is the DEFAULT UI --- */
          <>
            <h1 className="text-3xl font-bold text-foreground">
              Check Your Email
            </h1>
            <p className="text-foreground/80">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-primary">{user?.email}</strong>. Please
              check your inbox (and spam folder) to continue.
            </p>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-90 transition-all disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </button>

            <div className="flex justify-around items-center text-sm">
              <button
                onClick={() => setIsChangingEmail(true)}
                className="text-foreground/70 hover:underline"
              >
                Wrong email?
              </button>
              <button
                onClick={handleLogout}
                className="text-foreground/70 hover:underline"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}