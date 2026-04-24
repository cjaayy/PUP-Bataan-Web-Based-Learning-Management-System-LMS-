import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "plain" | "soft";
};

export function Card({ className, tone = "plain", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-200 hover:shadow-[0_4px_16px_rgba(65,20,31,0.08)]",
        tone === "soft" && "bg-[var(--surface-2)]",
        className,
      )}
      {...props}
    />
  );
}
