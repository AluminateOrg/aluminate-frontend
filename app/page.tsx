'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading ,getInfo} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (true) {
      //check for admin getInfo & member getInfo , if both fails then navigate to /login
      const adminCheck = getInfo("admin");
      const memberCheck = getInfo("member");

      console.log("checking admin and member info");

      Promise.all([adminCheck, memberCheck]).then((results) => {
        if (!results.includes(true)) {
          router.push("/login");
        }else{
          router.push(
            results[0] ? "/org/admin" : "/org/member"
          )
        }
      });
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Loading Alumni Portal...</p>
      </div>
    </div>
  );
}