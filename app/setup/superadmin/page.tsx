import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviceRoleKey || !supabaseUrl) {
  redirect("/setup");
}

const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

async function requireSuperAdminAfterBootstrap() {
  const { count } = await adminClient
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "superadmin");

  if ((count ?? 0) > 0) {
    await requireRole(["superadmin"]);
  }
}

function normalizeAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered") ||
    normalized.includes("duplicate")
  ) {
    return "This email is already registered. Please log in or reset your password.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("too many email requests")
  ) {
    return "Too many signup attempts. Please wait a few minutes and try again.";
  }

  return message;
}

export async function createSuperAdminAction(formData: FormData) {
  "use server";

  await requireSuperAdminAfterBootstrap();

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    throw new Error(
      "Email and password are required to create a super admin user.",
    );
  }

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      role: "superadmin",
    },
    email_confirm: true,
  });

  if (error) {
    throw new Error(normalizeAuthErrorMessage(error.message));
  }

  redirect(
    "/auth/login?message=Super%20admin%20account%20created%20successfully.%20Please%20log%20in.",
  );
}

export default async function CreateSuperAdminPage() {
  await requireSuperAdminAfterBootstrap();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fff_0,#f4f2f3_45%,#eee8eb_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center">
        <section className="w-full rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--pup-maroon)]">
            Bootstrap setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Create a super admin account
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
            This account can create admin accounts and manage admin access.
          </p>

          <form action={createSuperAdminAction} className="mt-8 space-y-5">
            <div>
              <label
                className="text-sm font-medium text-[var(--ink)]"
                htmlFor="email"
              >
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="superadmin@example.com"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-[var(--ink)]"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter a secure password"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">Create super admin</Button>
              <Link
                href="/setup"
                className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]"
              >
                Back to setup
              </Link>
            </div>
          </form>

          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <p className="text-sm font-medium text-[var(--ink)]">
              Need to manage your own super admin settings?
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Update your display name and password from your settings page.
            </p>
            <Link
              href="/settings/superadmin"
              className="mt-3 inline-flex rounded-lg bg-[var(--pup-maroon)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--pup-maroon-deep)]"
            >
              Open super admin settings
            </Link>
          </div>

          <Card tone="soft" className="mt-6">
            <p className="text-sm text-[var(--ink-soft)]">
              The super admin account will be created with the role{" "}
              <span className="font-medium text-[var(--ink)]">superadmin</span>.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
