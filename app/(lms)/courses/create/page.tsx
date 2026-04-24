import { createCourseAction } from "@/app/(lms)/actions";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CreateCoursePage({ searchParams }: Props) {
  await requireRole(["faculty", "admin"]);
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Create Course
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Set class info and generate a shareable course code.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-lg border border-[#d7b9c2] bg-[#fff5f8] px-3 py-2 text-sm text-[#7f233f]">
          {params.error}
        </div>
      ) : null}

      <form
        action={createCourseAction}
        className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-[var(--ink)]"
          >
            Course Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Introduction to Information Systems"
            required
          />
        </div>

        <div>
          <label
            htmlFor="section"
            className="mb-1 block text-sm font-medium text-[var(--ink)]"
          >
            Section
          </label>
          <Input id="section" name="section" placeholder="BSIT-2A" />
        </div>

        <div>
          <label
            htmlFor="code"
            className="mb-1 block text-sm font-medium text-[var(--ink)]"
          >
            Course Code (optional)
          </label>
          <Input id="code" name="code" placeholder="ITIS-X4K9" />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-[var(--ink)]"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Short class description..."
          />
        </div>

        <Button type="submit">Create course</Button>
      </form>
    </div>
  );
}
