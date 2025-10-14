"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAxiosError } from "axios"; // 1. Import the type guard from axios

export default function RegisterPage() {
  const { register, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
    } catch (err: unknown) { // 2. Catch the error as 'unknown'
      // 3. Handle the error in a type-safe way
      if (isAxiosError(err)) {
        // Handle validation errors from Laravel (status 422)
        if (err.response?.status === 422 && err.response.data.errors) {
          const validationErrors = err.response.data.errors;
          // Join all error messages into a single string
          const errorMessages = Object.values(validationErrors).flat().join(' ');
          setError(errorMessages);
        } else {
          // Handle other API errors that might have a message
          setError(err.response?.data?.message || "Registration failed. Please try again.");
        }
      } else if (err instanceof Error) {
        // Handle standard JavaScript errors
        setError(err.message)
      } else {
        // Fallback for any other unexpected errors
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {user ? (
        <p>Welcome, {user.name}! You are now registered and logged in.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col w-80 space-y-4 p-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-foreground">Create an Account</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded bg-background border-border"
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="border p-2 rounded bg-background border-border"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      )}
    </div>
  );
}