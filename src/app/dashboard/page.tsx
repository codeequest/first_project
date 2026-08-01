import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardShell,
  EmptyState,
  StatCard,
} from "@/components/dashboard-shell";
import { ButtonLink } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "My learning" };

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  COMPLETED: "bg-brand-50 text-brand-700 ring-brand-100",
  REJECTED: "bg-red-50 text-red-700 ring-red-100",
  CANCELLED: "bg-surface-alt text-muted ring-line",
};

const statusLabels: Record<string, string> = {
  PENDING: "Awaiting approval",
  ACTIVE: "In progress",
  COMPLETED: "Completed",
  REJECTED: "Not approved",
  CANCELLED: "Cancelled",
};

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT", "INSTRUCTOR", "ADMIN");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      status: true,
      progressPercent: true,
      requestedAt: true,
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
                    {enrollment.course.durationHours} hours ·{" "}
                    {enrollment.progressPercent}% complete
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                    statusStyles[enrollment.status] ?? statusStyles.CANCELLED
                  }`}
                >
                  {statusLabels[enrollment.status] ?? enrollment.status}
                </span>
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
