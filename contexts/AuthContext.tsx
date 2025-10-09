'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api'; // Adjust path as needed

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (details: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for an existing session on initial component mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/user'); // Ensure your user route is correct
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (details: { name: string; email: string; password: string; password_confirmation: string }) => {
    await api.get('/sanctum/csrf-cookie');
    await api.post('/register', details);
    await fetchUser(); // Fetch user data after successful registration
  };

  const login = async (credentials: { email: string; password: string }) => {
    await api.get('/sanctum/csrf-cookie');
    await api.post('/login', credentials);
    await fetchUser(); // Fetch user data after successful login
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null); // Clear user from state
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};