import OrgAdminLayout from '@/layouts/OrgAdminLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrgAdminLayout>{children}</OrgAdminLayout>;
}