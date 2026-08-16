import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardShell,
  EmptyState,
  StatCard,
} from "@/components/dashboard-shell";
import { Badge, ButtonLink, type BadgeTone } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "My learning" };

const statusTones: Record<string, BadgeTone> = {
  PENDING: "amber",
  ACTIVE: "emerald",
  COMPLETED: "brand",
  REJECTED: "red",
  CANCELLED: "neutral",
};

const statusLabels: Record<string, string> = {
  PENDING: "Awaiting approval",
  ACTIVE: "In progress",
  COMPLETED: "Completed",
  REJECTED: "Not approved",
  CANCELLED: "Cancelled",
};

export default async function StudentDashboardPage() {
  // ADMIN deliberately excluded: an admin account has no enrollments, so
  // this page renders correctly but empty — the fix is to never let an
  // admin land here, not to make an empty page look less empty. requireRole
  // already redirects anyone outside this list to their own home.
  const user = await requireRole("STUDENT", "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      status: true,
      progressPercent: true,
      requestedAt: true,
      reviewNote: true,
      course: { select: { slug: true, title: true, durationHours: true } },
    },
  });

  const active = enrollments.filter((item) => item.status === "ACTIVE").length;
  const completed = enrollments.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const pending = enrollments.filter((item) => item.status === "PENDING").length;

  return (
    <DashboardShell
      user={user}
      title="My learning"
      description="Your enrollment requests, active courses and progress."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="In progress" value={active} />
        <StatCard label="Awaiting approval" value={pending} />
        <StatCard label="Completed" value={completed} />
      </div>

      <div className="mt-10">
        {enrollments.length === 0 ? (
          <EmptyState
            title="You have not enrolled in anything yet"
            description="Browse the catalog and request a place on a program. An administrator reviews each request and unlocks the course for you."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <Link
                    href={`/courses/${enrollment.course.slug}`}
                    className="text-lg font-bold tracking-tight text-ink hover:text-brand-700"
                  >
                    {enrollment.course.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {enrollment.status === "PENDING"
                      ? "Awaiting admin review — usually within 24 hours"
                      : `${enrollment.course.durationHours} hours · ${enrollment.progressPercent}% complete`}
                  </span>
                  {enrollment.reviewNote ? (
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                      <span className="font-semibold text-ink">
                        Note from our team:
                      </span>{" "}
                      {enrollment.reviewNote}
                    </p>
                  ) : null}
                </div>
                <Badge tone={statusTones[enrollment.status] ?? "neutral"}>
                  {statusLabels[enrollment.status] ?? enrollment.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <ButtonLink href="/courses" variant="secondary">
          Browse the catalog
        </ButtonLink>
      </div>
    </DashboardShell>
  );
}
