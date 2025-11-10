"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { isAxiosError } from "axios"; // ✅ 1. ADDED IMPORT

// --- TYPE INTERFACES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
}

// ✅ 2. CREATED NEW INTERFACE
interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>; // ✅ 3. USED RegisterData
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  handleSocialCallback: (token: string, name: string) => void;
  resendVerification: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {}, // Changed to match new type
  logout: async () => {},
  fetchUser: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  handleSocialCallback: () => {},
  resendVerification: async () => {},
  updateEmail: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // --- CORE AUTH FUNCTIONS ---

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
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    const { token, user: loggedInUser } = response.data;
    localStorage.setItem("authToken", token);
    setUser(loggedInUser);
  };

  const register = async (data: RegisterData) => { // ✅ 4. USED RegisterData
    const response = await api.post("/register", data);
    const { token, user: registeredUser } = response.data;
    localStorage.setItem("authToken", token);
    setUser(registeredUser);
    // Guard effect will redirect to /verify-email
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

  // --- SOCIALITE FUNCTIONS ---

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

  const loginWithGoogle = async () => await redirectToProvider("google");
  const loginWithFacebook = async () => await redirectToProvider("facebook");

  const handleSocialCallback = useCallback(
    (token: string, name: string) => {
      localStorage.setItem("authToken", token);
      setUser({ name, id: 0, email: "", role: "client", email_verified_at: null });
      toast.success(`Welcome, ${name}!`);
      fetchUser();
      router.push("/profile");
    },
    [fetchUser, router]
  );

  // --- NEW EMAIL VERIFICATION FUNCTIONS ---

  const resendVerification = useCallback(async () => {
    try {
      await api.post("/email/verification-notification");
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend email. Please try again.");
      throw error;
    }
  }, []);

  const updateEmail = useCallback(async (newEmail: string) => {
    try {
      const response = await api.put("/email/update", { email: newEmail });
      setUser(response.data);
      toast.success("Email updated! Please check your new inbox.");
    } catch (error: unknown) { // ✅ 5. CHANGED to unknown
      
      // Handle validation errors (e.g., email already taken)
      // ✅ 6. ADDED type guard
      if (isAxiosError(error) && error.response?.status === 422 && error.response.data.errors) {
        const message = error.response.data.errors.email[0];
        toast.error(message);
      } else {
        toast.error("Failed to update email. Please try again.");
      }
      throw error;
    }
  }, []);

  // --- UPDATED & NEW useEffect HOOKS ---

  useEffect(() => {
    const isCallbackPage = pathname.includes("/auth/callback");
    if (!isCallbackPage) {
      fetchUser();
    }
  }, [fetchUser, pathname]);

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/verify-email"];
    const isPublicPage = publicPaths.some((path) => pathname.startsWith(path));

    if (loading) return;

    if (user && !user.email_verified_at && !isPublicPage) {
      router.push("/verify-email");
    }

    if (user && user.email_verified_at && pathname.startsWith("/verify-email")) {
      router.push("/profile");
    }
  }, [user, loading, pathname, router]);

  // --- PROVIDER VALUE ---
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
        handleSocialCallback,
        resendVerification,
        updateEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);