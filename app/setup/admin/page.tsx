import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

export async function createAdminAction(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    throw new Error("Email and password are required to create an admin user.");
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      role: "admin",
    },
    email_confirm: true,
  });

  if (error) {
    throw new Error(normalizeAuthErrorMessage(error.message));
  }

  redirect(
    "/auth/login?message=Admin account created successfully. Please log in.",
  );
}

export default function CreateAdminPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fff_0,#f4f2f3_45%,#eee8eb_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center">
        <section className="w-full rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--pup-maroon)]">
            Admin only
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Create an administrator account
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
            Use the service role key to create a protected admin user. This
            account can sign in to the admin dashboard.
          </p>

          <form action={createAdminAction} className="mt-8 space-y-5">
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
                placeholder="admin@example.com"
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
              <Button type="submit">Create admin</Button>
              <Link
                href="/setup"
                className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]"
              >
                Back to setup
              </Link>
            </div>
          </form>

          <Card tone="soft" className="mt-6">
            <p className="text-sm text-[var(--ink-soft)]">
              The admin account will be created with the role{" "}
              <span className="font-medium text-[var(--ink)]">admin</span> and
              can access the admin dashboard once signed in.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
