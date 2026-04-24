"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/join", label: "Join Course" },
  { href: "/calendar", label: "Calendar" },
];

export function Sidebar({ role }: SidebarProps) {
  const currentPath = usePathname();

  return (
    <aside className="w-[240px] shrink-0 border-r border-[var(--line)] bg-[linear-gradient(180deg,#fffaf1_0%,#f8eddc_100%)] px-4 py-6">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/pngkey.com-phillies-logo-png-528919.png"
            alt="PUP Bataan logo"
            width={42}
            height={42}
            className="h-10 w-10 rounded-full border border-[var(--line)] bg-white object-cover p-1 shadow-sm"
            priority
          />
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--pup-maroon)]">
              PUP Bataan
            </p>
            <h1 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Integrated LMS
            </h1>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--ink-soft)]">Role: {role}</p>
      </div>

      <nav className="space-y-1">
        {items.map((item, i) => {
          const active =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                i % 2 === 0 ? "ml-[3px]" : "ml-0",
                active
                  ? "bg-white text-[var(--pup-maroon)] shadow-sm"
                  : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
