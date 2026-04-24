import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { greetingByTime } from "@/lib/utils";

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

export default async function StudentDashboardPage() {
  const { profile } = await requireRole(["student"]);
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
  const typedAnnouncements = (announcements || []) as AnnouncementRow[];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[var(--ink-soft)]">Student dashboard</p>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
                {greetingByTime(profile.full_name.split(" ")[0])}
              </h1>
              <span className="rounded-full border border-[var(--pup-maroon)] bg-[var(--pup-maroon-soft)] px-3 py-1 text-xs font-semibold text-[var(--pup-maroon)]">
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              Your deadlines and recent announcements.
            </p>
          </div>
        </div>
      </section>

      <Card tone="soft" className="min-h-[216px]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Upcoming deadlines
        </h2>
        <div className="mt-3 space-y-3">
          {typedDeadlines.length > 0 ? (
            typedDeadlines.map((deadline) => (
              <div key={deadline.id} className="rounded-lg bg-white px-3 py-2">
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
              No upcoming deadlines yet.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Recent announcements
        </h2>
        <div className="mt-3 space-y-3">
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
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">
              No announcements yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
