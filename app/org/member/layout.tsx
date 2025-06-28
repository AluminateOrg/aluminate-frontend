import MemberLayout from '@/layouts/MemberLayout';

export default function MemberLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MemberLayout>{children}</MemberLayout>;
}