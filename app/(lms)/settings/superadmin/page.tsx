import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function updateSuperAdminSettingsAction(formData: FormData) {
  "use server";

  const { user, profile } = await requireRole(["superadmin"]);
  const supabase = await createClient();

  const displayName = getText(formData, "display_name");
  const password = getText(formData, "password");

  if (displayName) {
    await supabase
      .from("profiles")
      .update({ full_name: displayName })
      .eq("id", user.id);

    await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        role: profile.role,
      },
    });
  }

  if (password) {
    await supabase.auth.updateUser({ password });
  }

  revalidatePath("/settings/superadmin");
  revalidatePath("/dashboard");
  redirect("/settings/superadmin?message=Settings%20updated");
}

export default async function SuperAdminSettingsPage() {
  const { profile } = await requireRole(["superadmin"]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center">
        <Card className="w-full p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--pup-maroon)]">
            Super admin settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Update your account
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
            Change your display name and password here.
          </p>

          <form
            action={updateSuperAdminSettingsAction}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                className="text-sm font-medium text-[var(--ink)]"
                htmlFor="display_name"
              >
                Username / display name
              </label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={profile.full_name}
                placeholder="Super Admin"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-[var(--ink)]"
                htmlFor="password"
              >
                New password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">Save changes</Button>
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-200 hover:bg-[var(--surface-2)]"
              >
                Back to admin dashboard
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
