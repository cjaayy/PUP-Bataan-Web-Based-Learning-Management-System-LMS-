import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--pup-maroon)] text-white shadow-sm hover:translate-y-[-1px] hover:bg-[var(--pup-maroon-deep)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
        variant === "ghost" &&
          "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
        className,
      )}
      {...props}
    />
  );
}
