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

export interface Organization {
  id: string;
  organizationName: string;
  membershipFree: boolean;
  maxMemberCount: number;
  currentMemberCount: number;
  deleted: boolean;
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
  const { user } = useAuth();
  const dispatch = useDispatch();

  const adminId = useSelector((state: any) => state.user.admin?.id)
  const organization = useSelector((state: any) => state.user.organization);
  console.log("admin id from redux: >>>", adminId);

  const fetchOrganization = async () => {

    try {

      const response = await axiosAdmin.get(`/get-org/${adminId}`);
      console.log("response from the backend: ", response.data);
      if (response.data) {
        dispatch(setOrganizationRedux(response.data as Organization));
      }

      // const fetchGroups = async (): Promise<Group[]> => {
      //   try {
      //     const response = await axiosCommon.get(`/group/get/all`);
      //     console.log("response from the backend: ", response.data);
      //     if (response.data) {
      //       return response.data.data as Group[];
      //     }
      //     return [];
      //   } catch (error) {
      //     console.error("Failed to fetch groups:", error);
      //     throw error;
      //   }
      // };

      // const data = await fetchGroups();
      // setGroups(data);

      // console.log("fetched data: ", data);

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
      // setOrganization(updatedOrg);
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
