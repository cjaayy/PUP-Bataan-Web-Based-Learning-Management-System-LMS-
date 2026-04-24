"use server";

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ProfileRow = {
  id: string;
  full_name: string;
  role: "student" | "faculty" | "admin";
  created_at: string;
};

type AuthUserRow = {
  id: string;
  email: string;
  disabled?: boolean;
};

type AnnouncementRow = {
  id: string;
  title: string;
  created_at: string;
};

type Props = {
  searchParams?: {
    query?: string;
    role?: string;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  redirect("/setup");
}

const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function deleteUserAction(formData: FormData) {
  const userId = getText(formData, "user_id");

  if (!userId) {
    redirect("/admin");
  }

  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleUserStatusAction(formData: FormData) {
  const userId = getText(formData, "user_id");
  const disabled = getText(formData, "disabled") === "true";

  if (!userId) {
    redirect("/admin");
  }

  if (disabled) {
    await adminClient.auth.admin.enableUser(userId);
  } else {
    await adminClient.auth.admin.disableUser(userId);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export default async function AdminPage({ searchParams }: Props) {
  const { profile } = await requireRole(["admin"]);
  const supabase = await createClient();

  const query = searchParams?.query?.trim() ?? "";
  const roleFilter = searchParams?.role;

  const profilesQuery = adminClient
    .from("profiles")
    .select("id, full_name, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(20);

  const filteredProfiles = roleFilter
    ? profilesQuery.eq("role", roleFilter)
    : profilesQuery;

  const finalProfilesQuery = query
    ? filteredProfiles.ilike("full_name", `%${query}%`)
    : filteredProfiles;

  const { data: profiles, count: totalUsers } = await finalProfilesQuery;

  const typedProfiles = (profiles || []) as ProfileRow[];
  const profileIds = typedProfiles.map((user) => user.id);

  const { data: authUsers } = profileIds.length
    ? await adminClient
        .from("auth.users")
        .select("id, email, disabled")
        .in("id", profileIds)
    : { data: [] };

  const authMap = new Map(
    ((authUsers || []) as AuthUserRow[]).map((user) => [user.id, user]),
  );

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalEnrollments } = await supabase
    .from("course_members")
    .select("id", { count: "exact", head: true });

  const typedAnnouncements = (announcements || []) as AnnouncementRow[];

  const studentCount = typedProfiles.filter(
    (user) => user.role === "student",
  ).length;
  const facultyCount = typedProfiles.filter(
    (user) => user.role === "faculty",
  ).length;
  const adminCount = typedProfiles.filter(
    (user) => user.role === "admin",
  ).length;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[var(--ink-soft)]">Admin panel</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
              Welcome back, {profile.full_name}
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Manage student and faculty accounts from this panel.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">Total users</p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {totalUsers ?? 0}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">Students</p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {studentCount}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">Faculty</p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {facultyCount}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">Active enrollments</p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {totalEnrollments ?? 0}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Account management
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Search, deactivate, or delete student and faculty accounts.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            method="get"
          >
            <Input
              name="query"
              defaultValue={query}
              placeholder="Search by name"
              className="max-w-sm"
            />
            <select
              name="role"
              defaultValue={roleFilter ?? "all"}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--pup-maroon)]"
            >
              <option value="all">All roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              type="submit"
              variant="secondary"
              className="whitespace-nowrap"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                  Name
                </th>
                <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                  Role
                </th>
                <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                  Email
                </th>
                <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                  Status
                </th>
                <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {typedProfiles.length > 0 ? (
                typedProfiles.map((user) => {
                  const authUser = authMap.get(user.id);
                  const disabled = Boolean(authUser?.disabled);

                  return (
                    <tr key={user.id}>
                      <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink)]">
                        {user.full_name}
                      </td>
                      <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                        {user.role}
                      </td>
                      <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                        {authUser?.email ?? "-"}
                      </td>
                      <td className="border-b border-[var(--line)] px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            disabled
                              ? "bg-[#FDE8EE] text-[#B42318]"
                              : "bg-[#EDF2F7] text-[#2D3748]"
                          }`}
                        >
                          {disabled ? "Deactivated" : "Active"}
                        </span>
                      </td>
                      <td className="border-b border-[var(--line)] px-3 py-3 space-x-2">
                        <form
                          action={toggleUserStatusAction}
                          className="inline"
                        >
                          <input type="hidden" name="user_id" value={user.id} />
                          <input
                            type="hidden"
                            name="disabled"
                            value={String(disabled)}
                          />
                          <Button
                            type="submit"
                            variant="secondary"
                            className="text-[var(--ink)]"
                          >
                            {disabled ? "Activate" : "Deactivate"}
                          </Button>
                        </form>
                        <form action={deleteUserAction} className="inline">
                          <input type="hidden" name="user_id" value={user.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            className="text-[#b42318] hover:bg-[#fee2e2]"
                          >
                            Delete
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-sm text-[var(--ink-soft)]"
                  >
                    No users found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
