'use client';

import { useOrg as useOrgContext } from '@/contexts/OrgContext';

export const useOrg = () => {
  return useOrgContext();
};