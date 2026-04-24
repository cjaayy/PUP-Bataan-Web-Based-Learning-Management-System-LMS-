import Image from "next/image";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type TopbarProps = {
  fullName: string;
  notifications: Array<{
    id: string;
    title: string;
    created_at: string;
    course: string | null;
  }>;
};

export function Topbar({ fullName, notifications }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-white/85 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Image
          src="/icons/pngkey.com-phillies-logo-png-528919.png"
          alt="PUP Bataan logo"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full border border-[var(--line)] bg-white object-cover p-1 shadow-sm"
        />
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            PUP Bataan LMS
          </p>
          <p className="text-base font-semibold text-[var(--ink)]">
            {fullName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <details className="group relative">
          <summary className="cursor-pointer list-none rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] hover:bg-[var(--surface-2)]">
            Notifications ({notifications.length})
          </summary>
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--line)] bg-white p-3 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-[var(--ink)]">
              Recent updates
            </p>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-[var(--surface-2)] px-3 py-2"
                  >
                    <p className="text-sm text-[var(--ink)]">{note.title}</p>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {note.course || "General"} •{" "}
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--ink-soft)]">
                  Nothing urgent right now.
                </p>
              )}
            </div>
          </div>
        </details>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="text-sm">
            Logout
          </Button>
        </form>
      </div>
    </header>
  );
}
