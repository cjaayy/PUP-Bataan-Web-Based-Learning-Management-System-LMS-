import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-all duration-150 placeholder:text-[var(--ink-soft)] focus:border-[var(--pup-maroon)] focus:ring-2 focus:ring-[#7f233f24]",
        className,
      )}
      {...props}
    />
  );
}
