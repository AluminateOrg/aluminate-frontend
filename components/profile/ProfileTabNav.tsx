"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const TABS = [
  { href: "/org/member/profile", label: "Profile" },
  { href: "/org/member/profile/qr", label: "QR Code" },
  { href: "/org/member/profile/privacy", label: "Privacy" },
  { href: "/org/member/profile/notification", label: "Notifications" },
];

export function ProfileTabNav() {
  const pathname = usePathname();

  return (
    <div className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto rounded-lg border bg-muted/30 p-1">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cx(
              "text-center text-xs sm:text-sm px-2 sm:px-4 py-2 rounded-md transition",
              active
                ? "bg-background shadow font-medium text-foreground"
                : "text-muted-foreground hover:bg-background/60"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
