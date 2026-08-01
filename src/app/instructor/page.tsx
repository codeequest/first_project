import type { Metadata } from "next";
import {
  DashboardShell,
  EmptyState,
  StatCard,
} from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Instructor" };

export default async function InstructorDashboardPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const assignments = await prisma.courseInstructor.findMany({
    where: { userId: user.id },
    select: {
      isLead: true,
      course: {
        select: {
          id: true,
          title: true,
          status: true,
          durationHours: true,
          _count: {
            select: { enrollments: { where: { status: "ACTIVE" } } },
          },
        },
      },
    },
  });

  const totalStudents = assignments.reduce(
    (sum, item) => sum + item.course._count.enrollments,
    0,
  );

  return (
    <DashboardShell
      user={user}
      title="Instructor area"
      description="The courses assigned to you and the students currently enrolled on them."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Assigned courses" value={assignments.length} />
        <StatCard label="Active students" value={totalStudents} />
      </div>

      <div className="mt-10">
        {assignments.length === 0 ? (
          <EmptyState
            title="No courses assigned yet"
            description="An administrator assigns you to a course. Once that happens, it appears here along with its roster."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {assignments.map((assignment) => (
              <li
                key={assignment.course.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-ink">
                    {assignment.course.title}
                  </span>
                  <span className="text-sm text-muted">
                    {assignment.course.durationHours} hours ·{" "}
                    {assignment.course._count.enrollments} active student
                    {assignment.course._count.enrollments === 1 ? "" : "s"}
                    {assignment.isLead ? " · lead instructor" : ""}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">
                  {assignment.course.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
