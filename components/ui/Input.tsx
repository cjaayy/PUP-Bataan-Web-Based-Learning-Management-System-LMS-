import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition-all duration-150 placeholder:text-[#8A8386] focus:border-[var(--pup-maroon)] focus:ring-2 focus:ring-[#7f233f24]",
        className,
      )}
      {...props}
    />
  );
}
