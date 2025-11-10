// contexts/AuthContext.tsx
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
// ✅ FIX: Import from your i18n/navigation file
import { useRouter, usePathname } from "@/i18n/navigation";
import { isAxiosError } from "axios"; 

// --- TYPE INTERFACES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
}

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
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  handleSocialCallback: (token: string, name: string) => Promise<void>; // ✅ FIX: Make Promise<void>
  resendVerification: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
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
  handleSocialCallback: async () => {}, // ✅ FIX: Match new async type
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

  const register = async (data: RegisterData) => { 
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
      // ✅ FIX: Use router.push for locale-aware redirect
      router.push("/login");
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

  // ✅ --- FIX: This function is now async and awaits fetchUser ---
  const handleSocialCallback = useCallback(
    async (token: string, name: string) => {
      localStorage.setItem("authToken", token);
      toast.success(`Welcome, ${name}!`);
      
      // Wait for the real user data to be fetched
      await fetchUser(); 
      
      // Now redirect. The auth guards will have the correct user data.
      router.push("/profile");
    },
    [fetchUser, router]
  );
  // --- END OF FIX ---


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
    } catch (error: unknown) { 
      
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
    // Check against the start of the path, ignoring locale
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