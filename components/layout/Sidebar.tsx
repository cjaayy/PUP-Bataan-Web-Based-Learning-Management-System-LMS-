"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const currentPath = usePathname();

  const itemSets = {
    student: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/courses", label: "Enrolled" },
      { href: "/join", label: "Join Class" },
      { href: "/calendar", label: "Calendar" },
    ],
    faculty: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/courses", label: "List of Class" },
      { href: "/courses/create", label: "Create Class" },
      { href: "/calendar", label: "Calendar" },
    ],
    superadmin: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/settings/superadmin", label: "Settings" },
      { href: "/admin", label: "Admin Panel" },
    ],
  } as const;

  const items =
    role === "student"
      ? itemSets.student
      : role === "faculty"
        ? itemSets.faculty
        : role === "superadmin"
          ? itemSets.superadmin
          : [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <aside className="w-[240px] shrink-0 border-r border-[var(--line)] bg-[var(--surface)] px-4 py-6">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/pngkey.com-phillies-logo-png-528919.png"
            alt="PUP Bataan logo"
            width={42}
            height={42}
            className="h-10 w-10 rounded-full border border-[var(--line)] bg-[var(--surface)] object-cover p-1 shadow-sm"
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
          let active =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);

          // Exclude /courses/create from /courses highlight
          if (
            item.href === "/courses" &&
            currentPath.startsWith("/courses/create")
          ) {
            active = false;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                i % 2 === 0 ? "ml-[3px]" : "ml-0",
                active
                  ? "bg-[var(--surface-2)] text-[var(--pup-maroon)] shadow-sm"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {role === "admin" ? (
          <Link
            href="/admin"
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
              currentPath === "/admin" || currentPath.startsWith("/admin/")
                ? "bg-[var(--surface-2)] text-[var(--pup-maroon)] shadow-sm"
                : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
            )}
          >
            Admin Panel
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
