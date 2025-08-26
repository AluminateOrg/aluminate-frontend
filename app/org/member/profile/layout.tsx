"use client";

import { ProfileTabNav } from "@/components/profile/ProfileTabNav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <ProfileTabNav />
      {children}
    </div>
  );
}
