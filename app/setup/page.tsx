import Link from "next/link";

function envState() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    hasUrl,
    hasKey,
    hasServiceRoleKey,
    ready: hasUrl && hasKey,
  };
}

export default function SetupPage() {
  const state = envState();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fff_0,#f4f2f3_45%,#eee8eb_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center">
        <section className="w-full rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--pup-maroon)]">
            Setup required
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Supabase configuration is missing
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
            The LMS needs your Supabase project URL and anonymous key before it
            can start routing into authenticated pages.
          </p>

          <div className="mt-5 grid gap-3 rounded-xl bg-[var(--surface-2)] p-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-3 shadow-sm">
              <p className="text-xs text-[var(--ink-soft)]">
                NEXT_PUBLIC_SUPABASE_URL
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {state.hasUrl ? "Found" : "Missing"}
              </p>
            </div>
            <div className="rounded-lg bg-white px-3 py-3 shadow-sm">
              <p className="text-xs text-[var(--ink-soft)]">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {state.hasKey ? "Found" : "Missing"}
              </p>
            </div>
            <div className="rounded-lg bg-white px-3 py-3 shadow-sm">
              <p className="text-xs text-[var(--ink-soft)]">App status</p>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {state.ready ? "Ready" : "Blocked until env is set"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 rounded-xl bg-[var(--surface-2)] p-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-3 shadow-sm">
              <p className="text-xs text-[var(--ink-soft)]">
                SUPABASE_SERVICE_ROLE_KEY
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {state.hasServiceRoleKey
                  ? "Found"
                  : "Optional for direct signup"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-[var(--ink-soft)]">
            <p>
              Create a{" "}
              <span className="font-medium text-[var(--ink)]">.env.local</span>{" "}
              file in the project root and copy the values from Supabase
              dashboard: Project Settings &gt; API.
            </p>
            <p>
              For direct signup without email confirmation, also add the service
              role key from Supabase Project Settings &gt; API.
            </p>
            <p>Example:</p>
            <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[#faf7f8] px-4 py-3 text-xs text-[var(--ink)]">
              {`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
            </pre>
            <p>
              After saving the file, restart the dev server with{" "}
              <span className="font-medium text-[var(--ink)]">npm run dev</span>
              .
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg bg-[var(--pup-maroon)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[var(--pup-maroon-deep)]"
            >
              Retry home
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-all duration-200 hover:bg-[var(--surface-2)]"
            >
              Go to login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
