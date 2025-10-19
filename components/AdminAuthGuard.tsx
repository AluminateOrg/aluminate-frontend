'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const userState = useSelector((state: RootState) => state.user);
  const {getInfo,setLoading} = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
        const isAdmin = await getInfo('admin');
      if (!isAdmin) {
        router.replace('/login');
      }
      setLoading(false);
    }
    // Redirect if not authenticated or call backend
    if (!userState.isAuthenticated || userState.admin === null) {
        checkAdmin();
    }
  }, [userState.isAuthenticated, userState.admin, router]);

  // Optionally show a loader while checking
  if (!userState.isAuthenticated || userState.admin === null) {
    setLoading(true);
    
  }

  return <>{children}</>;
}
