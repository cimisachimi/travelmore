"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback, // 1. Import useCallback
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  handleSocialCallback: (token: string, name: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  fetchUser: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  handleSocialCallback: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 2. Wrap fetchUser in useCallback
  const fetchUser = useCallback(async () => {
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
  }, []); // No dependencies, so it's stable

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
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      window.location.href = "/login";
    }
  };

  const redirectToProvider = async (provider: "google" | "facebook") => {
    try {
      toast.info(`Redirecting to ${provider}...`);
      const response = await api.get(`/auth/${provider}/redirect`);
      const { redirect_url } = response.data;
      
      if (redirect_url) {
        window.location.href = redirect_url;
      }
    } catch (error) {
      console.error("Social login redirect failed", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const loginWithGoogle = async () => {
    await redirectToProvider("google");
  };

  const loginWithFacebook = async () => {
    await redirectToProvider("facebook");
  };
  
  // 3. Wrap handleSocialCallback in useCallback
  const handleSocialCallback = useCallback(
    (token: string, name: string) => {
      localStorage.setItem("authToken", token);
      setUser({ name, id: 0, email: "", role: "client" }); // This is the line that caused the loop
      toast.success(`Welcome, ${name}!`);
      fetchUser(); // Now 'fetchUser' is a stable dependency
      router.push("/profile"); // 'router' is stable
    },
    [fetchUser, router] // Add its dependencies
  );

  useEffect(() => {
    // 4. Clean up this effect to only fetch the user if NOT on the callback page.
    // The AuthCallback component is responsible for handling the callback.
    const isCallbackPage = window.location.pathname.includes("/auth/callback");

    if (!isCallbackPage) {
      fetchUser();
    }
  }, [fetchUser]); // Depend on the stable fetchUser

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
        loginWithGoogle,
        loginWithFacebook,
        handleSocialCallback, // Pass the new stable function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);