'use client';

import OrgAdminLayout from '@/layouts/OrgAdminLayout';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <OrgAdminLayout>{children}</OrgAdminLayout>
    </AdminAuthGuard>
  );
}
