"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  avatar?: string;
  designation?: string;
  phone?: string;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockUser: User = {
        id: role === "admin" ? "admin-1" : "member-1",
        email,
        name: role === "admin" ? "Admin User" : "Shane Mario",
        role,
        orgId: "org-1",
        avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1`,
        designation:
          role === "admin" ? "System Administrator" : "Software Engineer",
        phone: "+1234567890",
        joinedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Redirect based on role
      router.push(role === "admin" ? "/org/admin" : "/org/member");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
