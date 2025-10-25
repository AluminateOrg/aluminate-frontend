"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import axiosGlobal from "@/axiosInstances/axiosGlobal";
import { encryptObject, importPublicKey } from "@/util/rsa";
import { useDispatch } from "react-redux";
import { logoutUser, setAdminUser, setMemberUser } from "@/redux/userSlice";
import { log } from "console";
import { useSelector } from "react-redux";
import axiosAdmin from "@/axiosInstances/axiosAdmin";
import axiosMember from "@/axiosInstances/axiosMember";
import { set } from "date-fns";
import axiosCommon from "@/axiosInstances/axiosCommon";
import { toast } from "sonner";
import { rejects } from "assert";

export type UserRole = "admin" | "member";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  id?: string;
  avatar?: string | null;
  designation?: string | null;
  phone?: string | null;
  joinedAt: string | null;
  isMentor?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getInfo: (role: UserRole) => Promise<boolean>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const pathName = usePathname();
  const userFromRedux = useSelector((state: any) => state.user);
  const localUser = userFromRedux.user;

  const getInfo = async (role: UserRole) => {
    console.log("executing getInfo for role:", role);
    if (role === "admin") {
      try {
        const res = await axiosAdmin.get("/info/getAdminInfo");
        if (res.status === 200) {
          const { data } = res.data;
          // const response = await axiosCommon.get(`/mentor/is-mentor/${data.user.id}`)
          //setAdminUser in redux
          dispatch(
            setAdminUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              nic: data.user.nic || null,
              role: "admin",
              phone: data.user.phone || null,
              emailVerified: data.user.emailVerified || null,
              createdAt: data.user.createdAt || null,
          
            })
          );
          setChecking(false);
          //setUser in context
          setUser({
            email: data.user.email,
            name: data.user.name,
            role: "admin",
            id: data.user.id,
            avatar: data.user.photoUrl || null,
            designation: data.user.position || null,
            phone: data.user.phone || null,
            joinedAt: data.user.createdAt || null,
            // isMentor: response.data.data
          });
          return true;
        } else {
          console.log("Failed to fetch admin info");
          console.log("Status res ", res);
          return false;
        }
      } catch (error) {
        console.error("Error fetching admin info", error);
        return false;
      }
    } else {
      try {
        const res = await axiosMember.get("/info/getMemberInfo");
        if (res.status === 200) {
          const { data } = res.data;
          // const response = await axiosCommon.get(
          //   `/mentor/is-mentor/${data.user.id}`
          // );
          //setMemberUser in redux
          dispatch(
            setMemberUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: "member",
              avatar: data.user.photoUrl || null,
              designation: data.user.position || null,
              joinedAt: data.user.createdAt || null,
              // isMentor: response.data.data,
            })
          );
          setChecking(false);

          //setUser in context
          setUser({
            email: data.user.email,
            name: data.user.name,
            role: "member",
            id: data.user.id,
            avatar: data.user.photoUrl || null,
            designation: data.user.position || null,
            phone: data.user.phone || null,
            joinedAt: data.user.createdAt || null,
            // isMentor: response.data.data,
          });
          return true;
        } else {
          console.log("Failed to fetch member info");
          console.log("Status res ", res);
          return false;
        }
      } catch (error) {
        console.error("Error fetching member info", error);
        return false;
      }
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      //encrypt object
      const pem = process.env.NEXT_PUBLIC_ORG_PUBLIC_KEY!;
      const publicKey = importPublicKey(pem);

      const payload = encryptObject({ email, password }, publicKey);

      const res = await axiosGlobal.post("/auth/login", {
        payload,
      });

      if (res.status !== 200) {
        throw new Error("Login failed");
      }

      const { data } = res.data;
      console.log("data from login response:", data);



      if (role === "admin" && role === data.user.role.toLowerCase()) {
        dispatch(
          setAdminUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            nic: data.user.nic || null,
            role: data.user.role || null,
            phone: data.user.phone || null,
            emailVerified: data.user.emailVerified || null,
            createdAt: data.user.createdAt || null,
          })
        );
      } else if (role === "member" && role === data.user.role.toLowerCase()) {
        dispatch(
          setMemberUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: role,
            avatar: data.user.photoUrl || null,
            designation: data.user.position || null,
            joinedAt: data.user.createdAt || null,
            isMentor: false,
          })
        );
      } else {
        toast.error("Invalid login entry: Check Role!");
        throw new Error("Invalid login entry: Check Role!");
      }

      const user: User = {
        email: data.user.email,
        name: data.user.name,
        role: data.user.role.toLowerCase(),
        id: data.user.id,
        avatar: data.user.photoUrl || null,
        designation: data.user.position || null,
        phone: data.user.phone || null,
        joinedAt: data.user.createdAt || null,
        isMentor: false,
      };

      // @ts-ignore
      setUser(user); // Save real user
      setLoading(false);


      // Determine target path
      const target =
        pathName && pathName !== "/login"
          ? pathName
          : data.user.role.toLowerCase() === "admin"
            ? "/org/admin"
            : "/org/member";

      // Use Next.js router push (respects basePath)
      router.push(target);


    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);

    }
  };

  const handleLogout = async () => {
    console.log("calling logout");
    try {
      const res = await axiosGlobal.post("/auth/logout");
      if (res.status === 200) {
        dispatch(logoutUser());
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const logout = () => {
    setUser(null);
    handleLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        getInfo,
        setUser,
        setLoading,
        checking,
      }}
    >
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
