"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccountStatusToggle } from "@/components/admin/AccountStatusToggle";

type ProfileRow = {
  id: string;
  full_name: string;
  role: "student" | "faculty" | "admin" | "superadmin";
  created_at: string;
};

type AuthUserRow = {
  id: string;
  email: string;
  disabled?: boolean;
  banned_until?: string | null;
};

type AnnouncementRow = {
  id: string;
  title: string;
  created_at: string;
};

type Props = {
  searchParams?:
    | {
        query?: string;
        role?: string;
        filter?: string;
      }
    | Promise<{
        query?: string;
        role?: string;
        filter?: string;
      }>;
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

function isUserDeactivated(user: AuthUserRow | undefined) {
  if (!user) {
    return false;
  }

  if (user.disabled) {
    return true;
  }

  if (!user.banned_until) {
    return false;
  }

  return new Date(user.banned_until).getTime() > Date.now();
}

async function getAccountRole(userId: string) {
  const { data } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: string }>();

  return data?.role ?? null;
}

export async function deleteUserAction(formData: FormData) {
  const { profile: actorProfile } = await requireUser();
  const userId = getText(formData, "user_id");

  if (!userId) {
    redirect("/admin");
  }

  const targetRole = await getAccountRole(userId);

  if (
    targetRole === "superadmin" ||
    (targetRole === "admin" && actorProfile.role !== "superadmin")
  ) {
    redirect("/admin");
  }

  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleUserStatusAction(formData: FormData) {
  const { profile: actorProfile } = await requireUser();
  const userId = getText(formData, "user_id");
  const disabled = getText(formData, "disabled") === "true";

  if (!userId) {
    redirect("/admin");
  }

  const targetRole = await getAccountRole(userId);

  if (
    targetRole === "superadmin" ||
    (targetRole === "admin" && actorProfile.role !== "superadmin")
  ) {
    redirect("/admin");
  }

  if (disabled) {
    // Activate account: clear both auth ban and disabled flags.
    const unbanAttempt = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });

    if (unbanAttempt.error) {
      const unbanSqlAttempt = await adminClient
        .from("auth.users")
        .update({ banned_until: null, disabled: false })
        .eq("id", userId);

      if (unbanSqlAttempt.error) {
        const fallbackUnban = await adminClient.auth.admin.updateUserById(
          userId,
          {
            ban_duration: "0s",
          },
        );

        if (fallbackUnban.error) {
          throw new Error(
            unbanSqlAttempt.error.message || fallbackUnban.error.message,
          );
        }
      }
    }
  } else {
    // Deactivate account with a long ban duration and disabled flag.
    const banAttempt = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });

    if (banAttempt.error) {
      const banSqlAttempt = await adminClient
        .from("auth.users")
        .update({ disabled: true })
        .eq("id", userId);

      if (banSqlAttempt.error) {
        const fallbackBan = await adminClient.auth.admin.updateUserById(
          userId,
          {
            ban_duration: "100y",
          },
        );

        if (fallbackBan.error) {
          throw new Error(
            banSqlAttempt.error.message || fallbackBan.error.message,
          );
        }
      }
    }
  }

  revalidatePath("/admin");
}

export default async function AdminPage({ searchParams }: Props) {
  const { profile } = await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const query = resolvedSearchParams?.query?.trim() ?? "";
  const filter = resolvedSearchParams?.filter ?? "all";
  const showFaculty = filter === "faculty";
  const showStudents = !showFaculty;

  let studentQuery = adminClient
    .from("profiles")
    .select("id, full_name, role, created_at", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(100);

  if (query) {
    studentQuery = studentQuery.ilike("full_name", `%${query}%`);
  }

  const { data: studentProfiles, count: totalStudents } = await studentQuery;

  let facultyQuery = adminClient
    .from("profiles")
    .select("id, full_name, role, created_at", { count: "exact" })
    .eq("role", "faculty")
    .order("created_at", { ascending: false })
    .limit(100);

  if (query) {
    facultyQuery = facultyQuery.ilike("full_name", `%${query}%`);
  }

  const { data: facultyProfiles, count: totalFaculty } = await facultyQuery;

  const typedStudentProfiles = (studentProfiles || []) as ProfileRow[];
  const typedFacultyProfiles = (facultyProfiles || []) as ProfileRow[];
  const totalUsers = (totalStudents ?? 0) + (totalFaculty ?? 0);

  const allProfileIds = [
    ...typedStudentProfiles.map((u) => u.id),
    ...typedFacultyProfiles.map((u) => u.id),
  ];

  const authUsers = allProfileIds.length
    ? (
        await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        })
      ).data.users
        .filter((user) => allProfileIds.includes(user.id))
        .map((user) => ({
          id: user.id,
          email: user.email || "-",
          banned_until: user.banned_until,
        }))
    : [];

  const authMap = new Map(
    (authUsers as AuthUserRow[]).map((user) => [user.id, user]),
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

  const studentCount = typedStudentProfiles.length;
  const facultyCount = typedFacultyProfiles.length;
  const currentProfiles = showFaculty
    ? typedFacultyProfiles
    : typedStudentProfiles;
  const activeCurrentCount = currentProfiles.filter(
    (user) => !isUserDeactivated(authMap.get(user.id)),
  ).length;
  const totalCurrentCount = currentProfiles.length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">
            {showFaculty ? "Total faculty active" : "Total students active"}
          </p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {activeCurrentCount}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-[var(--ink-soft)]">
            {showFaculty ? "Total Faculty" : "Total Students"}
          </p>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {totalCurrentCount}
          </p>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <form
          method="get"
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="hidden"
            name="filter"
            value={showFaculty ? "faculty" : "student"}
          />
          <Input
            name="query"
            defaultValue={query}
            placeholder="Search by name"
            className="max-w-sm"
          />
          <Button
            type="submit"
            variant="secondary"
            className="whitespace-nowrap"
          >
            Search
          </Button>
        </form>
      </div>

      {showStudents && (
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Students
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Manage student accounts.
            </p>
          </div>

          <div className="overflow-x-auto" suppressHydrationWarning>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                    Name
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
                {typedStudentProfiles.length > 0 ? (
                  typedStudentProfiles.map((user) => {
                    const authUser = authMap.get(user.id);
                    const disabled = isUserDeactivated(authUser);
                    const isSuperAdminAccount = user.role === "superadmin";
                    const canManageAccount =
                      !isSuperAdminAccount &&
                      (user.role !== "admin" || profile.role === "superadmin");

                    return (
                      <tr key={user.id}>
                        <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink)]">
                          {user.full_name}
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                          {authUser?.email ?? "-"}
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              disabled
                                ? "bg-[var(--surface-2)] text-[var(--pup-maroon)]"
                                : "bg-[var(--surface-2)] text-[var(--ink)]"
                            }`}
                          >
                            {disabled ? "Deactivated" : "Active"}
                          </span>
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <AccountStatusToggle
                              userId={user.id}
                              initialDisabled={disabled}
                              canManageAccount={canManageAccount}
                              toggleAction={toggleUserStatusAction}
                            />
                            <form action={deleteUserAction} className="inline">
                              <input
                                type="hidden"
                                name="user_id"
                                value={user.id}
                              />
                              <Button
                                type="submit"
                                variant="ghost"
                                disabled={!canManageAccount}
                                className="text-[var(--pup-maroon)] hover:bg-[var(--surface-2)]"
                              >
                                Delete
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-sm text-[var(--ink-soft)]"
                    >
                      No students found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showFaculty && (
        <Card>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Faculty
              </h2>
              <p className="text-sm text-[var(--ink-soft)]">
                Manage faculty accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto" suppressHydrationWarning>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                    Name
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
                {typedFacultyProfiles.length > 0 ? (
                  typedFacultyProfiles.map((user) => {
                    const authUser = authMap.get(user.id);
                    const disabled = isUserDeactivated(authUser);
                    const canManageAccount = true;

                    return (
                      <tr key={user.id}>
                        <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink)]">
                          {user.full_name}
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3 text-[var(--ink-soft)]">
                          {authUser?.email ?? "-"}
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              disabled
                                ? "bg-[var(--surface-2)] text-[var(--pup-maroon)]"
                                : "bg-[var(--surface-2)] text-[var(--ink)]"
                            }`}
                          >
                            {disabled ? "Deactivated" : "Active"}
                          </span>
                        </td>
                        <td className="border-b border-[var(--line)] px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <AccountStatusToggle
                              userId={user.id}
                              initialDisabled={disabled}
                              canManageAccount={canManageAccount}
                              toggleAction={toggleUserStatusAction}
                            />
                            <form action={deleteUserAction} className="inline">
                              <input
                                type="hidden"
                                name="user_id"
                                value={user.id}
                              />
                              <Button
                                type="submit"
                                variant="ghost"
                                disabled={!canManageAccount}
                                className="text-[var(--pup-maroon)] hover:bg-[var(--surface-2)]"
                              >
                                Delete
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-sm text-[var(--ink-soft)]"
                    >
                      No faculty found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
