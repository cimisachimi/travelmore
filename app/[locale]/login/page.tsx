"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAxiosError } from "axios"; // Import the type guard from axios

export default function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: unknown) { // Catch error as 'unknown' type
      // ✅ FIXED: Use the isAxiosError type guard
      if (isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        // If it's an Axios error with a message, display that message.
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        // Handle standard JavaScript errors
        setError(err.message);
      } else {
        // Fallback for any other unexpected errors
        setError("An unexpected login error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {user ? (
        <div>
          <p>Welcome back, {user.name}!</p>
          <p className="text-sm text-center text-foreground/70">You are already logged in.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col w-80 space-y-4 p-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-foreground">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded bg-background border-border"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded bg-background border-border"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}