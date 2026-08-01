import type { Metadata } from "next";
import {
  DashboardShell,
  EmptyState,
  StatCard,
} from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");

  const [
    pendingCount,
    activeCount,
    studentCount,
    publishedCourses,
    newMessages,
    pendingRequests,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.enrollment.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
      take: 10,
      select: {
        id: true,
        requestedAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Administration"
      description="Approve enrollment requests, manage the catalog and keep an eye on the inbox."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Pending requests"
          value={pendingCount}
          hint="Waiting for your approval"
        />
        <StatCard label="Active enrollments" value={activeCount} />
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Published courses" value={publishedCourses} />
        <StatCard label="New messages" value={newMessages} />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          Enrollment requests
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Oldest first. Approving a request unlocks the course content for that
          student.
        </p>

        <div className="mt-6">
          {pendingRequests.length === 0 ? (
            <EmptyState
              title="Nothing waiting"
              description="New enrollment requests will appear here as soon as students submit them."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-ink">
                      {request.user.name ?? request.user.email}
                    </span>
                    <span className="text-sm text-muted">
                      {request.course.title} · requested{" "}
                      {request.requestedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {/* Approve/reject actions land here with the admin dashboard. */}
                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
