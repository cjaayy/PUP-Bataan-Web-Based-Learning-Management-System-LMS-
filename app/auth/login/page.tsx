import Image from "next/image";
import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10">
        <section className="hidden w-[52%] flex-col lg:flex">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/pngkey.com-phillies-logo-png-528919.png"
              alt="PUP Bataan logo"
              width={54}
              height={54}
              className="h-12 w-12 rounded-full border border-[var(--line)] bg-white object-cover p-1 shadow-sm"
              priority
            />
            <p className="inline-block w-fit rounded-full border border-[#e5d9dd] bg-white/90 px-3 py-1 text-xs font-medium text-[var(--ink-soft)] backdrop-blur-sm">
              PUP Bataan Integrated LMS
            </p>
          </div>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight text-[var(--ink)]">
            Keep classes moving, submissions clear, and announcements in one
            quiet place.
          </h2>
          <p className="mt-4 max-w-md text-[15px] text-[var(--ink-soft)]">
            Built with familiar school-system flow: simple tabs, practical
            cards, and less clutter.
          </p>
        </section>

        <AuthCard
          title="Welcome back"
          subtitle="Sign in with your school account to continue."
          footerText="No account yet?"
          footerLinkText="Create one"
          footerHref="/auth/register"
          error={params.error}
        >
          <form action={loginAction} className="space-y-3">
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
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="mt-2 w-full">
              Login
            </Button>
          </form>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            Back to home
          </Link>
        </AuthCard>
      </div>
    </main>
  );
}
