import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const hasValueProp = Object.prototype.hasOwnProperty.call(props, "value");
  const normalizedProps =
    hasValueProp && props.value === undefined ? { ...props, value: "" } : props;

  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-all duration-150 placeholder:text-[var(--ink-soft)] focus:border-[var(--pup-maroon)] focus:ring-2 focus:ring-[#7f233f24]",
        className,
      )}
      {...normalizedProps}
    />
  );
}
