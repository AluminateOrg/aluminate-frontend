"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import axiosCommon from "@/axiosInstances/axiosCommon";
import axiosAdmin from "@/axiosInstances/axiosAdmin";
export type SubscriptionTier = "basic" | "premium" | "enterprise";
import { useDispatch, useSelector } from "react-redux";
import { set } from "date-fns";
import { setOrganization as setOrganizationRedux } from "@/redux/userSlice";
import { toast } from "sonner";

export interface Organization {
  id: string;
  organizationName: string;
  membershipFree: boolean;
  maxMemberCount: number;
  currentMemberCount: number;
  deleted: boolean;
  tier?: SubscriptionTier;
  description?: string;
  logo?: string;
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, checking } = useAuth();
  const dispatch = useDispatch();

  const adminId = useSelector((state: any) => state.user.admin?.id);
  const isAuthenticated = useSelector(
    (state: any) => state.user.isAuthenticated
  );
  const organization = useSelector((state: any) => state.user.organization);
  console.log("admin id from redux: >>>", adminId);

  const fetchOrganization = async () => {
    try {
      if (isAuthenticated) {
        const response = await axiosCommon.get(`/get-org`);
        console.log("response from the backend: ", response.data);
        if (response.data) {
          dispatch(setOrganizationRedux(response.data as Organization));
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await axiosCommon.get("/group/get/all");
      console.log("Groups fetched from backend: ", data.data);
      if (data) {
        setGroups(data.data as Group[]);
      } else {
        setGroups([]);
        toast.warning("No groups found.");
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to fetch groups.");
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
      // setOrganization(updatedOrg);
    } catch (error) {
      console.error("Failed to update subscription:", error);
      throw error;
    }
  };



  useEffect(() => {
    if (!checking) {
      const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchOrganization(), fetchGroups()]);
        setLoading(false);
      };
      fetchAll();
    }
  }, [checking]);

  useEffect(() => {
    if (organization) {
      const fetchData = setInterval(() => {
        fetchGroups();
      }, 100000);
      return () => clearInterval(fetchData);
    }
  });

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
