import { registerAction } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f1f2_0%,#f9f8f8_35%,#f2eff0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <AuthCard
          title="Create account"
          subtitle="Use your campus details to get started."
          footerText="Already have an account?"
          footerLinkText="Login"
          footerHref="/auth/login"
          error={params.error}
        >
          <form action={registerAction} className="space-y-3">
            <div>
              <label
                htmlFor="full_name"
                className="mb-1 block text-sm font-medium text-[var(--ink)]"
              >
                Full Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[var(--ink)]"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@pup.edu.ph"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-[var(--ink)]"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-sm font-medium text-[var(--ink)]"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--pup-maroon)]"
                defaultValue="student"
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button type="submit" className="mt-2 w-full">
              Register
            </Button>
          </form>
        </AuthCard>
      </div>
    </main>
  );
}
