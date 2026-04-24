import Link from "next/link";
import { Card } from "@/components/ui/Card";

type CourseCardProps = {
  id: string;
  code: string;
  title: string;
  section: string | null;
  memberCount: number;
  index: number;
};

export function CourseCard({
  id,
  code,
  title,
  section,
  memberCount,
  index,
}: CourseCardProps) {
  return (
    <Card className={index % 2 ? "min-h-[162px]" : "min-h-[178px]"}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--pup-maroon)]">
        {code}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        {section || "No section"}
      </p>
      <p className="mt-4 text-xs text-[var(--ink-soft)]">
        {memberCount} members
      </p>
      <Link
        href={`/courses/${id}`}
        className="mt-4 inline-block text-sm font-medium text-[var(--pup-maroon)] hover:underline"
      >
        Open class
      </Link>
    </Card>
  );
}
