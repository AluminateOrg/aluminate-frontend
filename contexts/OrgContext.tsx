'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'basic' | 'premium' | 'enterprise';

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
  adminId: string;
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
    if (!user?.orgId) return;
    
    try {
      // TODO: Replace with actual API call
      const mockOrg: Organization = {
        id: user.orgId,
        name: 'Tech Alumni Network',
        tier: 'premium',
        memberCount: 245,
        memberLimit: 500,
        logo: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        description: 'Connecting technology professionals and fostering innovation',
        createdAt: new Date().toISOString(),
      };

      const mockGroups: Group[] = [
        {
          id: 'group-1',
          name: 'Software Engineers',
          description: 'For all software engineering professionals',
          maxMembers: 100,
          currentMembers: 45,
          createdAt: new Date().toISOString(),
          adminId: user.id,
        },
        {
          id: 'group-2',
          name: 'Data Scientists',
          description: 'Data science and analytics professionals',
          maxMembers: 50,
          currentMembers: 23,
          createdAt: new Date().toISOString(),
          adminId: user.id,
        },
      ];

      setOrganization(mockOrg);
      setGroups(mockGroups);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
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
        memberLimit: tier === 'basic' ? 100 : tier === 'premium' ? 500 : 1000,
      };
      setOrganization(updatedOrg);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  return (
    <OrgContext.Provider value={{
      organization,
      groups,
      loading,
      refreshOrganization: fetchOrganization,
      updateSubscription,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};