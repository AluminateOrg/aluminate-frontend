
import MemberLayout from '@/layouts/MemberLayout';
import MemberAuthGuard from '@/components/MemberAuthGuard';

export default function MemberLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberAuthGuard>
      <MemberLayout>{children}</MemberLayout>
    </MemberAuthGuard>
  );
}
