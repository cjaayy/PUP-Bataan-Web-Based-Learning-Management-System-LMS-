"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  userId: string;
  initialDisabled: boolean;
  canManageAccount: boolean;
  toggleAction: (formData: FormData) => Promise<void>;
};

export function AccountStatusToggle({
  userId,
  initialDisabled,
  canManageAccount,
  toggleAction,
}: Props) {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(initialDisabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!canManageAccount || isPending) {
      return;
    }

    const previousValue = isDisabled;
    setIsDisabled(!previousValue);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("user_id", userId);
        formData.set("disabled", previousValue ? "true" : "false");
        await toggleAction(formData);
        router.refresh();
      } catch {
        setIsDisabled(previousValue);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={!canManageAccount || isPending}
      onClick={handleToggle}
      className={`relative h-8 w-20 rounded-full border px-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
        isDisabled
          ? "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)]"
          : "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
      }`}
      aria-pressed={!isDisabled}
      aria-label={isDisabled ? "Enable account" : "Disable account"}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
          isDisabled ? "left-1" : "left-[3.25rem]"
        }`}
      />
      <span className="relative z-10">{isDisabled ? "OFF" : "ON"}</span>
    </Button>
  );
}
