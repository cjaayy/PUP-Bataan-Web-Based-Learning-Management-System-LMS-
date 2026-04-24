import Link from "next/link";
import {
  commentOnAnnouncementAction,
  createAnnouncementAction,
  createAssignmentAction,
  getSignedFileUrl,
} from "@/app/(lms)/actions";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
};

type CourseRow = {
  id: string;
  code: string;
  title: string;
  section: string | null;
  description: string | null;
};

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  profiles: Array<{ full_name: string }> | null;
};

type CommentRow = {
  id: string;
  announcement_id: string;
  body: string;
  created_at: string;
  profiles: Array<{ full_name: string }> | null;
};

type AssignmentRow = {
  id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  max_points: number | null;
  attachment_path: string | null;
};

type PersonRow = {
  user_id: string;
  role: "student" | "faculty";
  profiles: Array<{ full_name: string }> | null;
};

const tabs = [
  { id: "stream", label: "Stream" },
  { id: "classwork", label: "Classwork" },
  { id: "people", label: "People" },
];

export default async function CourseDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;
  const tab = query.tab || "stream";
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("course_members")
    .select("role")
    .eq("course_id", id)
    .eq("user_id", profile.id)
    .single();

  if (!membership) {
    return (
      <Card>
        <p className="text-sm text-[var(--ink-soft)]">
          You are not enrolled in this course.
        </p>
      </Card>
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title, section, description")
    .eq("id", id)
    .single();
  const typedCourse = course as CourseRow | null;

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, created_at, author_id, profiles(full_name)")
    .eq("course_id", id)
    .order("created_at", { ascending: false });
  const typedAnnouncements = (announcements || []) as AnnouncementRow[];

  const announcementIds = typedAnnouncements.map((a) => a.id);

  const { data: comments } = await supabase
    .from("announcement_comments")
    .select("id, announcement_id, body, created_at, profiles(full_name)")
    .in(
      "announcement_id",
      announcementIds.length
        ? announcementIds
        : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("created_at", { ascending: true });
  const typedComments = (comments || []) as CommentRow[];

  const commentsByAnnouncement = typedComments.reduce(
    (acc: Record<string, CommentRow[]>, c) => {
      if (!acc[c.announcement_id]) {
        acc[c.announcement_id] = [];
      }
      acc[c.announcement_id].push(c);
      return acc;
    },
    {},
  );

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, instructions, due_at, max_points, attachment_path")
    .eq("course_id", id)
    .order("created_at", { ascending: false });
  const typedAssignments = (assignments || []) as AssignmentRow[];

  const assignmentsWithLinks = await Promise.all(
    typedAssignments.map(async (a) => ({
      ...a,
      attachment_url: a.attachment_path
        ? await getSignedFileUrl(a.attachment_path)
        : null,
    })),
  );

  const { data: people } = await supabase
    .from("course_members")
    .select("user_id, role, profiles(full_name)")
    .eq("course_id", id)
    .order("joined_at", { ascending: true });
  const typedPeople = (people || []) as PersonRow[];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-[var(--pup-maroon)]">
          {typedCourse?.code}
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {typedCourse?.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {typedCourse?.section || "No section"} •{" "}
          {typedCourse?.description || "No description yet"}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <Link
              key={item.id}
              href={`/courses/${id}?tab=${item.id}`}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-[var(--pup-maroon)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {query.error ? (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--pup-maroon)]">
          {query.error}
        </div>
      ) : null}

      {tab === "stream" ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {typedAnnouncements.length > 0 ? (
              typedAnnouncements.map((announcement, i: number) => (
                <Card
                  key={announcement.id}
                  className={i % 2 ? "ml-[3px]" : "ml-0"}
                >
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    {announcement.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink-soft)]">
                    {announcement.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ink-soft)]">
                    {announcement.profiles?.[0]?.full_name || "Faculty"} •{" "}
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>

                  <div className="mt-3 space-y-2 border-t border-[var(--line)] pt-3">
                    {(commentsByAnnouncement[announcement.id] || []).map(
                      (comment) => (
                        <div
                          key={comment.id}
                          className="rounded-lg bg-[var(--surface-2)] px-3 py-2"
                        >
                          <p className="text-sm text-[var(--ink)]">
                            {comment.body}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)]">
                            {comment.profiles?.[0]?.full_name || "Class member"}
                          </p>
                        </div>
                      ),
                    )}

                    <form
                      action={commentOnAnnouncementAction}
                      className="flex gap-2"
                    >
                      <input
                        type="hidden"
                        name="announcement_id"
                        value={announcement.id}
                      />
                      <input type="hidden" name="course_id" value={id} />
                      <Input
                        name="body"
                        placeholder="Write a comment..."
                        required
                      />
                      <Button type="submit" variant="secondary">
                        Post
                      </Button>
                    </form>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-[var(--ink-soft)]">
                  No announcements yet. Faculty may still be preparing
                  materials.
                </p>
              </Card>
            )}
          </div>

          {membership.role === "faculty" ? (
            <Card tone="soft" className="h-fit">
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                Post announcement
              </h3>
              <form
                action={createAnnouncementAction}
                className="mt-3 space-y-2"
              >
                <input type="hidden" name="course_id" value={id} />
                <Input
                  name="title"
                  placeholder="Quiz moved to Monday"
                  required
                />
                <Textarea
                  name="body"
                  rows={5}
                  placeholder="Share updates with the class..."
                  required
                />
                <Button type="submit">Post update</Button>
              </form>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "classwork" ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {assignmentsWithLinks.length > 0 ? (
              assignmentsWithLinks.map((assignment) => (
                <Card key={assignment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">
                        {assignment.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        {assignment.instructions ||
                          "No additional instructions"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--ink-soft)]">
                        Due:{" "}
                        {assignment.due_at
                          ? new Date(assignment.due_at).toLocaleString()
                          : "No due date"}{" "}
                        • {assignment.max_points} pts
                      </p>
                    </div>
                    <Link
                      href={`/assignments/${assignment.id}`}
                      className="text-sm font-medium text-[var(--pup-maroon)] hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                  {assignment.attachment_url ? (
                    <a
                      href={assignment.attachment_url}
                      className="mt-3 inline-block text-sm text-[var(--pup-maroon)] hover:underline"
                      target="_blank"
                    >
                      Download attachment
                    </a>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-[var(--ink-soft)]">
                  No assignments yet, relax for now 👀
                </p>
              </Card>
            )}
          </div>

          {membership.role === "faculty" ? (
            <Card tone="soft" className="h-fit">
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                Create assignment
              </h3>
              <form
                action={createAssignmentAction}
                className="mt-3 space-y-2"
                encType="multipart/form-data"
              >
                <input type="hidden" name="course_id" value={id} />
                <Input
                  name="title"
                  placeholder="Module 2 Reflection"
                  required
                />
                <Textarea
                  name="instructions"
                  rows={4}
                  placeholder="Instructions..."
                />
                <Input type="datetime-local" name="due_at" />
                <Input
                  type="number"
                  name="max_points"
                  min={1}
                  defaultValue={100}
                />
                <input
                  type="file"
                  name="attachment"
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
                />
                <Button type="submit">Publish assignment</Button>
              </form>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "people" ? (
        <Card>
          <h3 className="text-lg font-semibold text-[var(--ink)]">People</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {typedPeople.map((person, i: number) => (
              <div
                key={person.user_id}
                className={`rounded-lg border border-[var(--line)] px-3 py-2 ${i % 2 ? "ml-[2px]" : "ml-0"}`}
              >
                <p className="text-sm font-medium text-[var(--ink)]">
                  {person.profiles?.[0]?.full_name || "Member"}
                </p>
                <p className="text-xs capitalize text-[var(--ink-soft)]">
                  {person.role}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
