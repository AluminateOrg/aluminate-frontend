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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX;

  if (!backendUrl || !apiPrefix) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_API_PREFIX must be defined"
    );
  }
  const apiUrl = `${backendUrl}/${apiPrefix}`;

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
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json(); // data = { token: "...", member: { ... } }

      localStorage.setItem("token", data.token);
      const user = {
        id: data.member.id,
        name: data.member.name,
        email: data.member.email,
        role: role,
        avatar: data.member.photoUrl || null,
        designation: data.member.position || null,
        joinedAt: data.member.createdAt || null,
        token: data.token,
      };

      // @ts-ignore
      setUser(user); // Save real user
      localStorage.setItem("user", JSON.stringify(user)); // Save for persistence

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
