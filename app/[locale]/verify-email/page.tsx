"use client";

import { useAuth } from "@/contexts/AuthContext"; // Kept your path alias
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, FormEvent, useEffect, ReactNode } from "react";
import axios, { AxiosError } from "axios"; // 1. Import axios for API calls

export default function VerifyEmailPage() {
  // --- Your Existing Code (Scenario A) ---
  const { user, loading, resendVerification, updateEmail, logout } = useAuth();
  const router = useRouter();

  const [isResending, setIsResending] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isChangingEmail, setIsChangingEmail] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");

  // --- New Code (Scenario B) ---
  const [isVerifyingFromLink, setIsVerifyingFromLink] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("Verifying your email...");
  const [verificationError, setVerificationError] = useState<boolean>(false);

  // 1. --- THIS EFFECT RUNS FIRST ---
  // It checks *why* the user is on this page.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("verify_url")) {
      // SCENARIO B: User clicked the link in their email.
      setIsVerifyingFromLink(true);
    }
    // If no param, 'isVerifyingFromLink' stays false (SCENARIO A).
  }, []); // Runs only once on page load

  // 2. --- THIS EFFECT HANDLES SCENARIO B ---
  // It runs *only if* we found the 'verify_url' param.
  useEffect(() => {
    if (isVerifyingFromLink) {
      const verify = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const verifyUrl = urlParams.get("verify_url");

        if (!verifyUrl) {
          setVerificationStatus("Invalid verification link. No URL provided.");
          setVerificationError(true);
          return;
        }

        try {
          // --- THIS IS THE API CALL THAT UPDATES THE DATABASE ---
          const response = await axios.get(verifyUrl);
          // --------------------------------------------------------

          setVerificationStatus(response.data.message || "Verification successful!");
          setVerificationError(false);
          toast.success(response.data.message || "Verification successful!");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);

        } catch (err: AxiosError | unknown) {
          let message = "Verification failed. Please try again.";
          if (axios.isAxiosError(err)) {
            message = err.response?.data?.message || message;
          }
          setVerificationStatus(message);
          setVerificationError(true);
          toast.error(message);
        }
      };

      verify();
    }
  }, [isVerifyingFromLink, router]); // Runs when 'isVerifyingFromLink' becomes true

  // 3. --- THIS EFFECT HANDLES SCENARIO A ---
  // Your original guards, now with one extra check.
  useEffect(() => {
    // If we're busy verifying a link, DON'T run these guards.
    if (isVerifyingFromLink || loading) {
      return;
    }

    if (!user) {
      router.push("/login");
    }

    if (user && user.email_verified_at) {
      router.push("/profile");
    }
  }, [user, loading, router, isVerifyingFromLink]); // Added isVerifyingFromLink

  // --- Your Existing Handlers (Unchanged) ---
  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      toast.success("Verification email sent!");
    } catch (error) { /* Handled in AuthContext */ }
    finally { setIsResending(false); }
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
      setIsChangingEmail(false);
      setNewEmail("");
    } catch (error) { /* Handled in AuthContext */ }
    finally { setIsUpdating(false); }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // --- Helper Wrapper Component ---
  const PageWrapper = ({ children }: { children: ReactNode }) => (
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
      {children}
    </div>
  );

  // 4. --- RENDER LOGIC ---

  // SCENARIO B: Show verification status
  if (isVerifyingFromLink) {
    return (
      <PageWrapper>
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 text-center bg-card/95 dark:bg-card/85 backdrop-blur-lg rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-foreground">
            Email Verification
          </h1>
          <p style={{ color: verificationError ? 'red' : 'green' }}>
            {verificationStatus}
          </p>
          {!verificationError && <p>Redirecting to login...</p>}
          {verificationError && <p>Please try again or contact support.</p>}
        </div>
      </PageWrapper>
    );
  }

  // SCENARIO A: Loading screen
  if (loading || !user || (user && user.email_verified_at)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen bg-transparent">
          <p className="text-white relative z-10">Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  // SCENARIO A: Show "Resend Email" UI
  return (
    <PageWrapper>
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 text-center bg-card/95 dark:bg-card/85 backdrop-blur-lg rounded-2xl shadow-xl">
        
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
    </PageWrapper>
  );
}