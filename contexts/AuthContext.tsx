"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner"; // Import toast for feedback

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>; // ✅ 1. Add Google login to context
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  fetchUser: async () => {},
  loginWithGoogle: async () => {}, // ✅ 2. Add default empty function
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!localStorage.getItem("authToken")) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/user");
      setUser(res.data);
    } catch {
      setUser(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("authToken", token);
    setUser(loggedInUser);
  };

  const register = async (data: any) => {
    const response = await api.post("/register", data);
    const { token, user: registeredUser } = response.data;

    localStorage.setItem("authToken", token);
    setUser(registeredUser);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout failed", error); // Log error but proceed
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      // Redirect to home or login page after logout
      window.location.href = "/login";
    }
  };

  // ✅ 3. Add Google login handler
  const loginWithGoogle = async (): Promise<void> => {
    // This is a placeholder.
    // In a real app, you would redirect to your backend's Google auth URL:
    // e.g., window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`;

    // For now, we'll show a toast and simulate a delay.
    toast.info(
      "Google Login is not implemented yet. This is where you would redirect to the backend."
    );
    console.log("Redirecting to Google... (simulated)");

    // You would not have a 'throw' here in production.
    // This is just to show the error handling in the button.
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        reject(
          new Error("Simulation: Backend for Google Auth not configured.")
        );
      }, 1000);
    });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
        loginWithGoogle, // ✅ 4. Expose the new function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);