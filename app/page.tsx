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
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl items-center justify-center">
        <section className="relative flex w-full max-w-3xl flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 px-7 py-8 text-center shadow-sm backdrop-blur-sm sm:px-10 sm:py-10">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/icons/pngkey.com-phillies-logo-png-528919.png"
              alt="PUP Bataan logo"
              width={60}
              height={60}
              className="h-14 w-14 rounded-full border border-[var(--line)] bg-[var(--surface)] object-cover p-1.5 shadow-sm"
              priority
            />
            <p className="text-sm uppercase tracking-[0.17em] text-[var(--pup-maroon)]">
              PUP Bataan
            </p>
          </div>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-[var(--ink)] [font-family:'Trajan_Pro',var(--font-main),serif] sm:text-5xl">
            PUP Bataan Ugnay
          </h1>
          <p className="mt-4 max-w-lg text-base text-[var(--ink-soft)] [font-family:'Trajan_Pro',var(--font-main),serif]">
            PUP Bataan Integrated Learning Management System.
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
