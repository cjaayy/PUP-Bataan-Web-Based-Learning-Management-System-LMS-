import Link from "next/link";
import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  children: ReactNode;
  error?: string;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerHref,
  children,
  error,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md p-7 sm:p-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--pup-maroon)]">
          PUP Bataan LMS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{subtitle}</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-[#d7b9c2] bg-[#fff5f8] px-3 py-2 text-sm text-[#7f233f]">
          {error}
        </div>
      ) : null}

      {children}

      <p className="mt-5 text-sm text-[var(--ink-soft)]">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-medium text-[var(--pup-maroon)] hover:underline"
        >
          {footerLinkText}
        </Link>
      </p>
    </Card>
  );
}
