import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { greetingByTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type MembershipRow = {
  course_id: string;
  courses: Array<{ id: string; title: string; code: string }>;
};

type DeadlineRow = {
  id: string;
  title: string;
  due_at: string | null;
  courses: Array<{ title: string }>;
};

type AnnouncementRow = {
  id: string;
  title: string;
  created_at: string;
  courses: Array<{ title: string }>;
};

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("course_members")
    .select("course_id, courses(id, title, code)")
    .eq("user_id", profile.id)
    .limit(6);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, created_at, courses(title)")
    .order("created_at", { ascending: false })
    .limit(5);

  const typedMemberships = (memberships || []) as MembershipRow[];
  const courseIds = typedMemberships.map((m) => m.course_id);
  const typedAnnouncements = (announcements || []) as AnnouncementRow[];
  const { data: deadlines } = await supabase
    .from("assignments")
    .select("id, title, due_at, courses(title)")
    .in(
      "course_id",
      courseIds.length ? courseIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .gte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(6);
  const typedDeadlines = (deadlines || []) as DeadlineRow[];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
        <p className="text-sm text-[var(--ink-soft)]">Dashboard</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {greetingByTime(profile.full_name.split(" ")[0])}
        </h2>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--ink)]">
              Active courses
            </h3>
            <Link
              href="/courses"
              className="text-sm text-[var(--pup-maroon)] hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="space-y-2">
            {typedMemberships.length > 0 ? (
              typedMemberships.map((item, i: number) => (
                <div
                  key={item.course_id}
                  className={`rounded-lg border border-[var(--line)] px-3 py-2 ${i % 2 ? "ml-[2px]" : "ml-0"}`}
                >
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {item.courses?.[0]?.title || "Course"}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {item.courses?.[0]?.code || "NO-CODE"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                No classes yet. Join one from a class code.
              </p>
            )}
          </div>
        </Card>

        <Card tone="soft" className="min-h-[216px]">
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            Upcoming deadlines
          </h3>
          <div className="mt-3 space-y-2">
            {typedDeadlines.length > 0 ? (
              typedDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="rounded-lg bg-white px-3 py-2"
                >
                  <p className="text-sm text-[var(--ink)]">{deadline.title}</p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {deadline.courses?.[0]?.title || "Course"} •{" "}
                    {deadline.due_at
                      ? new Date(deadline.due_at).toLocaleString()
                      : "No due date"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                No assignments yet, relax for now 👀
              </p>
            )}
          </div>
        </Card>
      </section>

      <Card className="min-h-[190px]">
        <h3 className="mb-3 text-lg font-semibold text-[var(--ink)]">
          Recent announcements
        </h3>
        <div className="space-y-2">
          {typedAnnouncements.length > 0 ? (
            typedAnnouncements.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[var(--line)] px-3 py-2"
              >
                <p className="text-sm font-medium text-[var(--ink)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--ink-soft)]">
                  {item.courses?.[0]?.title || "Course"} •{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">
              Announcements will appear here once your classes post updates.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
