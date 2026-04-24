"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const LMS_PREFIXES = [
  "/dashboard",
  "/courses",
  "/join",
  "/calendar",
  "/assignments",
  "/admin",
];

export function GlobalThemeToggle() {
  const pathname = usePathname();

  const isLmsRoute = LMS_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  if (isLmsRoute) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <ThemeToggle />
    </div>
  );
}
