"use client";

import { useSession } from "next-auth/react";
import { ButtonLink } from "./ui";

/**
 * Track B owns the actual enrollment-request server action
 * (src/lib/actions/enrollment.ts, not built yet). This CTA is intentionally
 * inert so Track A does not have to touch that file: it only routes the
 * visitor to auth, or shows a disabled placeholder once logged in.
 */
export function EnrollCta() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-[52px] w-full animate-pulse rounded-full bg-surface-alt" />
    );
  }

  if (!session?.user) {
    return (
      <ButtonLink
        href="/login"
        className="w-full justify-center px-8 py-3.5 text-base"
      >
        Request enrollment
      </ButtonLink>
    );
  }

  if (session.user.role !== "STUDENT") {
    return null;
  }

  return (
    <button
      type="button"
      disabled
      title="Enrollment requests are coming soon"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white opacity-60 shadow-sm shadow-brand-600/25"
    >
      Request enrollment — coming soon
    </button>
  );
}
