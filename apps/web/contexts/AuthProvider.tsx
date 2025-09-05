/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/api";
import { setSession, clearSession, me } from "@/lib/auth";

export type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
};

type AuthContextType = {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;

  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<User | undefined>;
  register: (credentials: {
    name: string;
    email: string;
    password: string;
  }) => Promise<User | undefined>;
  logout: () => void;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async () => undefined,
  register: async () => undefined,
  logout: () => {},
  refetchUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(() => {
    // Initialize from localStorage safely
    if (typeof window !== 'undefined') {
      return me();
    }
    return undefined;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthResponse = (data: any) => {
    // FIX: Handle both response structures properly
    const tokens = data.token
    const userData = data.user || data;
    
    setSession({
      access: tokens.access,
      refresh: tokens.refresh,
      user: userData
    });
    
    setUser(userData);
    setError(null);
  };

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      handleAuthResponse(data);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<User | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      handleAuthResponse(data);
      return data.user;
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(undefined);
    setError(null);
  };

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data.user);
    } catch (err) {
      // Only logout if we had a user before
      console.log(err)
      if (user) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only refetch if we have a stored token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("access");
      if (token && !user) {
        refetchUser();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
