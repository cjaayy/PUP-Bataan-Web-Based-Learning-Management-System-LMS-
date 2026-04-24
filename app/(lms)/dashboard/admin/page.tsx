import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: coursesCount },
    { count: announcementsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[var(--ink-soft)]">Admin dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
              Welcome back, administrator
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Manage users, courses, and announcements across the LMS.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-[var(--pup-maroon)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--pup-maroon-deep)]"
          >
            Admin panel
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--ink-soft)]">Registered users</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
            {usersCount ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--ink-soft)]">Total courses</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
            {coursesCount ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--ink-soft)]">Announcements</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
            {announcementsCount ?? 0}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Admin actions
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Review users and manage global settings from the admin panel.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]"
          >
            Open admin panel
          </Link>
        </div>
      </Card>
    </div>
  );
}
