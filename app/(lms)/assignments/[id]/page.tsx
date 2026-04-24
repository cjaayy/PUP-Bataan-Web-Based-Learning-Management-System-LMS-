import {
  gradeSubmissionAction,
  submitAssignmentAction,
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
  searchParams: Promise<{ error?: string; saved?: string }>;
};

type AssignmentRow = {
  id: string;
  course_id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  max_points: number | null;
  attachment_path: string | null;
  courses: { title: string } | null;
};

type SubmissionRow = {
  id: string;
  submission_text: string | null;
  attachment_path: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
};

type FullSubmissionRow = SubmissionRow & {
  student_id: string;
  profiles: Array<{ full_name: string }> | null;
};

export default async function AssignmentDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select(
      "id, course_id, title, instructions, due_at, max_points, attachment_path, courses(title)",
    )
    .eq("id", id)
    .single();
  const typedAssignment = assignment as AssignmentRow | null;

  if (!typedAssignment) {
    return <Card>Assignment not found.</Card>;
  }

  const attachmentUrl = typedAssignment.attachment_path
    ? await getSignedFileUrl(typedAssignment.attachment_path)
    : null;

  const { data: mySubmission } = await supabase
    .from("submissions")
    .select(
      "id, submission_text, attachment_path, score, feedback, submitted_at",
    )
    .eq("assignment_id", id)
    .eq("student_id", profile.id)
    .maybeSingle();
  const typedMySubmission = mySubmission as SubmissionRow | null;

  const mySubmissionFileUrl = typedMySubmission?.attachment_path
    ? await getSignedFileUrl(typedMySubmission.attachment_path)
    : null;

  const { data: allSubmissions } = await supabase
    .from("submissions")
    .select(
      "id, student_id, submission_text, attachment_path, score, feedback, submitted_at, profiles(full_name)",
    )
    .eq("assignment_id", id)
    .order("submitted_at", { ascending: false });
  const typedAllSubmissions = (allSubmissions || []) as FullSubmissionRow[];

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-[var(--ink-soft)]">
          {typedAssignment.courses?.title || "Course"}
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {typedAssignment.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {typedAssignment.instructions || "No additional instructions."}
        </p>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          Due:{" "}
          {typedAssignment.due_at
            ? new Date(typedAssignment.due_at).toLocaleString()
            : "No due date"}{" "}
          • {typedAssignment.max_points} pts
        </p>
        {attachmentUrl ? (
          <a
            href={attachmentUrl}
            target="_blank"
            className="mt-3 inline-block text-sm text-[var(--pup-maroon)] hover:underline"
          >
            Download assignment file
          </a>
        ) : null}
      </Card>

      {query.error ? (
        <div className="rounded-lg border border-[#d7b9c2] bg-[#fff5f8] px-3 py-2 text-sm text-[#7f233f]">
          {query.error}
        </div>
      ) : null}

      {query.saved ? (
        <div className="rounded-lg border border-[#c7ddcc] bg-[#f3fbf5] px-3 py-2 text-sm text-[#305d3c]">
          Submission saved.
        </div>
      ) : null}

      {profile.role === "student" ? (
        <Card tone="soft" className="max-w-2xl">
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            Your submission
          </h3>
          <form
            action={submitAssignmentAction}
            className="mt-3 space-y-2"
            encType="multipart/form-data"
          >
            <input type="hidden" name="assignment_id" value={id} />
            <input
              type="hidden"
              name="course_id"
              value={typedAssignment.course_id}
            />
            <Textarea
              name="submission_text"
              rows={5}
              placeholder="Write your response..."
              defaultValue={typedMySubmission?.submission_text || ""}
            />
            <input
              type="file"
              name="attachment"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            />
            <Button type="submit">Submit work</Button>
          </form>

          {typedMySubmission ? (
            <div className="mt-4 rounded-lg border border-[var(--line)] bg-white px-3 py-3">
              <p className="text-xs text-[var(--ink-soft)]">
                Last submitted:{" "}
                {new Date(typedMySubmission.submitted_at).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-[var(--ink)]">
                Score: {typedMySubmission.score ?? "Not graded yet"}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Feedback: {typedMySubmission.feedback || "No feedback yet"}
              </p>
              {mySubmissionFileUrl ? (
                <a
                  href={mySubmissionFileUrl}
                  target="_blank"
                  className="mt-2 inline-block text-sm text-[var(--pup-maroon)] hover:underline"
                >
                  Download your uploaded file
                </a>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : (
        <Card>
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            Submissions
          </h3>
          <div className="mt-3 space-y-3">
            {typedAllSubmissions.length > 0 ? (
              typedAllSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg border border-[var(--line)] px-3 py-3"
                >
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {submission.profiles?.[0]?.full_name || "Student"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {submission.submission_text || "No text response"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    Submitted{" "}
                    {new Date(submission.submitted_at).toLocaleString()}
                  </p>

                  <form
                    action={gradeSubmissionAction}
                    className="mt-2 grid gap-2 sm:grid-cols-[120px_1fr_auto]"
                  >
                    <input
                      type="hidden"
                      name="submission_id"
                      value={submission.id}
                    />
                    <input type="hidden" name="assignment_id" value={id} />
                    <Input
                      type="number"
                      name="score"
                      min={0}
                      max={typedAssignment.max_points || 100}
                      defaultValue={submission.score ?? ""}
                      placeholder="Score"
                    />
                    <Input
                      name="feedback"
                      defaultValue={submission.feedback || ""}
                      placeholder="Feedback"
                    />
                    <Button type="submit" variant="secondary">
                      Save
                    </Button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                No submissions yet.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
