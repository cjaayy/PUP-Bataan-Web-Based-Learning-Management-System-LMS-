import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";

type MembershipRow = {
  course_id: string;
  courses: Array<{
    id: string;
    code: string;
    title: string;
    section: string | null;
  }>;
};

type MemberCountRow = {
  course_id: string;
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CoursesPage({ searchParams }: Props) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const params = await searchParams;

  const { data: memberships } = await supabase
    .from("course_members")
    .select("course_id, courses(id, code, title, section), user_id")
    .eq("user_id", profile.id)
    .order("joined_at", { ascending: false });

  const typedMemberships = (memberships || []) as MembershipRow[];
  const courseIds = typedMemberships.map((m) => m.course_id);
  const { data: allMembers } = await supabase
    .from("course_members")
    .select("course_id")
    .in(
      "course_id",
      courseIds.length ? courseIds : ["00000000-0000-0000-0000-000000000000"],
    );

  const countMap = ((allMembers || []) as MemberCountRow[]).reduce(
    (acc: Record<string, number>, row) => {
      acc[row.course_id] = (acc[row.course_id] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Courses
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Your current classes and sections.
          </p>
        </div>

        {profile.role !== "student" ? (
          <Link href="/courses/create">
            <Button>Create Course</Button>
          </Link>
        ) : null}
      </div>

      {params.error ? (
        <div className="rounded-lg border border-[#d7b9c2] bg-[#fff5f8] px-3 py-2 text-sm text-[#7f233f]">
          {params.error}
        </div>
      ) : null}

      {typedMemberships.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {typedMemberships.map((member, index: number) => (
            <CourseCard
              key={member.course_id}
              id={member.courses[0]?.id || member.course_id}
              code={member.courses[0]?.code || "NO-CODE"}
              title={member.courses[0]?.title || "Untitled Course"}
              section={member.courses[0]?.section || null}
              memberCount={countMap[member.course_id] || 1}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--line)] bg-white px-5 py-6 shadow-sm">
          <p className="text-lg font-medium text-[var(--ink)]">
            No courses yet.
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Try joining with a class code or ask faculty for one.
          </p>
          <Link
            href="/join"
            className="mt-3 inline-block text-sm font-medium text-[var(--pup-maroon)] hover:underline"
          >
            Join a course
          </Link>
        </div>
      )}
    </div>
  );
}
