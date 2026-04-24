import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-9">
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl items-center justify-center">
        <section className="relative flex w-full max-w-3xl flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 px-7 py-8 text-center shadow-sm backdrop-blur-sm sm:px-10 sm:py-10">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <ThemeToggle />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/icons/pngkey.com-phillies-logo-png-528919.png"
              alt="PUP Bataan logo"
              width={52}
              height={52}
              className="h-12 w-12 rounded-full border border-[var(--line)] bg-[var(--surface)] object-cover p-1 shadow-sm"
              priority
            />
            <p className="text-xs uppercase tracking-[0.17em] text-[var(--pup-maroon)]">
              PUP Bataan
            </p>
          </div>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
            Web-Based Learning Management System
          </h1>
          <p className="mt-4 max-w-lg text-base text-[var(--ink-soft)]">
            Built for classes that need structure without extra friction.
            Courses, classwork, stream, submissions, and feedback in one place.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg bg-[var(--pup-maroon)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:translate-y-[-1px] hover:bg-[var(--pup-maroon-deep)]"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-all duration-200 hover:bg-[var(--surface-2)]"
            >
              Register
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
