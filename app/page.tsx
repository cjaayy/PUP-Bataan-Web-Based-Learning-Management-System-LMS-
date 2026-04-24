import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-white/90 px-7 py-8 shadow-sm backdrop-blur-sm sm:px-10 sm:py-10">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/pngkey.com-phillies-logo-png-528919.png"
              alt="PUP Bataan logo"
              width={52}
              height={52}
              className="h-12 w-12 rounded-full border border-[var(--line)] bg-white object-cover p-1 shadow-sm"
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

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg bg-[var(--pup-maroon)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:translate-y-[-1px] hover:bg-[var(--pup-maroon-deep)]"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-all duration-200 hover:bg-[var(--surface-2)]"
            >
              Register
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--surface-2)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--ink)]">
                Role-based dashboards
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Student, Faculty, and Admin access
              </p>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] px-4 py-3 sm:mt-[6px]">
              <p className="text-sm font-medium text-[var(--ink)]">
                Supabase-powered backend
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Auth, database, and file storage
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white/90 px-6 py-7 shadow-sm backdrop-blur-sm sm:px-7">
          <p className="text-sm font-medium text-[var(--ink)]">Live snapshot</p>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-[var(--line)] px-3 py-2">
              <p className="text-xs text-[var(--ink-soft)]">
                Recent stream update
              </p>
              <p className="text-sm text-[var(--ink)]">
                Midterm review session moved to Friday, 3 PM.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--line)] px-3 py-2 sm:ml-[7px]">
              <p className="text-xs text-[var(--ink-soft)]">
                Upcoming classwork
              </p>
              <p className="text-sm text-[var(--ink)]">
                Case Study 2 due Apr 30, 11:59 PM.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--line)] px-3 py-2">
              <p className="text-xs text-[var(--ink-soft)]">
                Friendly reminder
              </p>
              <p className="text-sm text-[var(--ink)]">
                No assignments yet? Nice. Use the breathing room.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
