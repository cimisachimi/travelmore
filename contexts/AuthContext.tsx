"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

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
  // ✅ 1. Add the register function to the context type
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => { },
  // ✅ 2. Provide a default empty function for register
  register: async () => { },
  logout: async () => { },
  fetchUser: async () => { },
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

  // ✅ 3. Create the register function
  const register = async (data: any) => {
    const response = await api.post("/register", data);
    const { token, user: registeredUser } = response.data;

    // After registering, automatically log the user in
    localStorage.setItem("authToken", token);
    setUser(registeredUser);
  };

  const logout = async () => {
    await api.post("/logout");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ 4. Expose the register function in the provider's value
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);