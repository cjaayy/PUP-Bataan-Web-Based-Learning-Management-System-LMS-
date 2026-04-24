import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

type AssignmentRow = {
  id: string;
  title: string;
  due_at: string | null;
  courses: Array<{ title: string; code: string }>;
};

export default async function CalendarPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const today = new Date();

  const { data: memberships } = await supabase
    .from("course_members")
    .select("course_id")
    .eq("user_id", profile.id);

  const courseIds = (memberships || []).map(
    (membership) => membership.course_id,
  );

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_at, courses(title, code)")
    .in(
      "course_id",
      courseIds.length ? courseIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("due_at", { ascending: true });

  const typedAssignments = (assignments || []) as AssignmentRow[];
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const totalDays = monthEnd.getDate();
  const firstWeekday = monthStart.getDay();
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  function assignmentsForDay(day: number) {
    return typedAssignments.filter((assignment) => {
      if (!assignment.due_at) {
        return false;
      }

      const dueDate = new Date(assignment.due_at);
      return (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === day
      );
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Calendar
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          A simple month view for assignment deadlines.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <div
              key={`pad-${index}`}
              className="min-h-[96px] rounded-lg border border-dashed border-transparent"
            />
          ))}

          {days.map((day) => {
            const items = assignmentsForDay(day);
            const isToday =
              today.getFullYear() === today.getFullYear() &&
              today.getMonth() === today.getMonth() &&
              today.getDate() === day;

            return (
              <div
                key={day}
                className={`min-h-[96px] rounded-lg border px-2 py-2 ${
                  isToday
                    ? "border-[var(--pup-maroon)] bg-[#fdf7f9]"
                    : "border-[var(--line)] bg-white"
                }`}
              >
                <p className="text-sm font-medium text-[var(--ink)]">{day}</p>
                <div className="mt-2 space-y-1">
                  {items.length > 0 ? (
                    items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-[11px] text-[var(--ink)]"
                      >
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="truncate text-[var(--ink-soft)]">
                          {item.courses?.[0]?.title || "Course"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[var(--ink-soft)]">
                      Nothing due
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card tone="soft">
        <h3 className="text-lg font-semibold text-[var(--ink)]">
          Upcoming deadlines
        </h3>
        <div className="mt-3 space-y-2">
          {typedAssignments.length > 0 ? (
            typedAssignments
              .filter((assignment) => assignment.due_at)
              .slice(0, 6)
              .map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {assignment.courses?.[0]?.title || "Course"} •{" "}
                    {new Date(assignment.due_at as string).toLocaleString()}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">
              No deadlines on the board yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
