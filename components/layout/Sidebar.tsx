"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const isAdminRoute =
    currentPath === "/admin" || currentPath.startsWith("/admin/");

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
    <aside className="fixed left-0 top-0 h-screen w-[240px] overflow-y-auto border-r border-[var(--line)] bg-[var(--surface)] px-4 py-6">
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

        {role === "admin" || role === "superadmin" ? (
          <div>
            <button
              onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200",
                currentPath === "/admin" || currentPath.startsWith("/admin/")
                  ? "bg-[var(--surface-2)] text-[var(--pup-maroon)] shadow-sm"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
              )}
            >
              <span>Admin Panel</span>
              <svg
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  adminDropdownOpen ? "rotate-180" : "rotate-0",
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {adminDropdownOpen && (
              <div className="mt-2 space-y-1 pl-2">
                <Link
                  href="/admin"
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isAdminRoute && !searchParams.get("filter")
                      ? "bg-[var(--pup-maroon)] text-white"
                      : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                  )}
                >
                  List of Students
                </Link>
                <Link
                  href="/admin?filter=faculty"
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isAdminRoute && searchParams.get("filter") === "faculty"
                      ? "bg-[var(--pup-maroon)] text-white"
                      : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                  )}
                >
                  List of Faculty
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
