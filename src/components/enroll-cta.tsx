"use client";

import { useSession } from "next-auth/react";
import { ButtonLink } from "./ui";

/**
 * The course page is statically rendered with ISR, so it cannot know who is
 * reading it. This CTA only routes: /courses/[slug]/enroll is a dynamic route
 * and decides there what to show — the request form, or the status of a
 * request already made.
 */
export function EnrollCta({ courseSlug }: { courseSlug: string }) {
  const { data: session, status } = useSession();
  const enrollHref = `/courses/${courseSlug}/enroll`;

  if (status === "loading") {
    return (
      <div className="h-[52px] w-full animate-pulse rounded-full bg-surface-alt" />
    );
  }

  if (!session?.user) {
    return (
      <ButtonLink
        href={`/login?callbackUrl=${encodeURIComponent(enrollHref)}`}
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
    <ButtonLink
      href={enrollHref}
      className="w-full justify-center px-8 py-3.5 text-base"
    >
      Request enrollment
    </ButtonLink>
  );
}
