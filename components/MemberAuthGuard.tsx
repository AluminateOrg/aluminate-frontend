'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MemberAuthGuardProps {
  children: React.ReactNode;
}

export default function MemberAuthGuard({ children }: MemberAuthGuardProps) {
  const router = useRouter();
  const userState = useSelector((state: RootState) => state.user);
  const {getInfo,setLoading} = useAuth();

  useEffect(() => {
    const checkMember = async () => {
        setLoading(true);
        const isMember = await getInfo('member');
      if (!isMember) {
        router.replace('/login');
      }
      setLoading(false);
    }
    // If not authenticated or not a member, call backend to check auth
    if (!userState.isAuthenticated || userState.member === null) {
        checkMember();
    }else{
        return;
    }
  }, [userState.isAuthenticated, userState.member, router]);


  return <>{children}</>;
}
