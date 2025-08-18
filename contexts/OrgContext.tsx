"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import axiosCommon from "@/axiosInstances/axiosCommon";
export type SubscriptionTier = "basic" | "premium" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  tier: SubscriptionTier;
  memberCount: number;
  memberLimit: number;
  logo?: string;
  description?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  currentMembers: number;
  createdAt: string;
  requiredApproval: boolean;
  adminId: string;
  active: boolean;
}

interface OrgContextType {
  organization: Organization | null;
  groups: Group[];
  loading: boolean;
  refreshOrganization: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrganization = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      const mockOrg: Organization = {
        id: user.id,
        name: "Tech Alumni Network",
        tier: "premium",
        memberCount: 245,
        memberLimit: 500,
        logo: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
        description:
          "Connecting technology professionals and fostering innovation",
        createdAt: new Date().toISOString(),
      };

      const fetchGroups = async (): Promise<Group[]> => {
        try {
          const response = await axiosCommon.get(`/group/get/all`);
          console.log("response from the backend: ", response.data);
          if (response.data) {
            return response.data.data as Group[];
          }
          return [];
        } catch (error) {
          console.error("Failed to fetch groups:", error);
          throw error;
        }
      };

      const data = await fetchGroups();
      setGroups(data);

      console.log("fetched data: ", data);

      setOrganization(mockOrg);
      // setGroups(mockGroups);
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    if (!organization) return;

    try {
      // TODO: Replace with actual API call
      const updatedOrg = {
        ...organization,
        tier,
        memberLimit: tier === "basic" ? 100 : tier === "premium" ? 500 : 1000,
      };
      setOrganization(updatedOrg);
    } catch (error) {
      console.error("Failed to update subscription:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  return (
    <OrgContext.Provider
      value={{
        organization,
        groups,
        loading,
        refreshOrganization: fetchOrganization,
        updateSubscription,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
};
