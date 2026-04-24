import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
};

export function Modal({ open, title, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div
        className={cn(
          "w-full max-w-lg rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm",
          "animate-[fadeIn_.22s_ease-out]",
        )}
      >
        <h3 className="mb-3 text-lg font-semibold text-[var(--ink)]">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
