import { joinCourseAction } from "@/app/(lms)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function JoinPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Join class
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Paste the class code provided by your faculty.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-lg border border-[#d7b9c2] bg-[#fff5f8] px-3 py-2 text-sm text-[#7f233f]">
          {params.error}
        </div>
      ) : null}

      <form
        action={joinCourseAction}
        className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        <div>
          <label
            htmlFor="code"
            className="mb-1 block text-sm font-medium text-[var(--ink)]"
          >
            Course code
          </label>
          <Input id="code" name="code" placeholder="EXAMPLE-1A2B" required />
        </div>

        <Button type="submit">Join class</Button>
      </form>
    </div>
  );
}
