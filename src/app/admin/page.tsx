import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardShell,
  EmptyState,
  StatCard,
} from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { EnrollmentReview } from "./enrollment-review";

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
      take: 25,
      select: {
        id: true,
        requestedAt: true,
        requestMessage: true,
        contactEmail: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            studentProfile: { select: { company: true, jobTitle: true } },
          },
        },
        course: { select: { title: true, slug: true } },
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
          emphasize={pendingCount > 0}
        />
        <StatCard label="Active enrollments" value={activeCount} />
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Published courses" value={publishedCourses} />
        <StatCard
          label="New messages"
          value={newMessages}
          emphasize={newMessages > 0}
        />
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
              {pendingRequests.map((request) => {
                const role = [
                  request.user.studentProfile?.jobTitle,
                  request.user.studentProfile?.company,
                ]
                  .filter(Boolean)
                  .join(" · ");

                // Where the approval notice goes. Older rows predate the
                // field and fall back to the account email.
                const notifyEmail =
                  request.contactEmail ?? request.user.email;
                const usesOtherEmail = notifyEmail !== request.user.email;

                return (
                  <li
                    key={request.id}
                    className="grid gap-5 rounded-2xl bg-white p-6 ring-1 ring-line lg:grid-cols-[1.7fr_1fr] lg:items-start"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-ink">
                          {request.user.name ?? request.user.email}
                        </span>
                        <span className="text-sm text-muted">
                          <a
                            href={`mailto:${notifyEmail}`}
                            className="font-medium text-ink hover:text-brand-700"
                          >
                            {notifyEmail}
                          </a>
                          {request.user.phone ? ` · ${request.user.phone}` : ""}
                        </span>
                        {usesOtherEmail ? (
                          <span className="text-xs text-muted">
                            Account email: {request.user.email}
                          </span>
                        ) : null}
                        {role ? (
                          <span className="text-sm text-muted">{role}</span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Link
                          href={`/courses/${request.course.slug}`}
                          className="font-semibold text-ink hover:text-brand-700"
                        >
                          {request.course.title}
                        </Link>
                        <span className="text-muted">
                          · requested{" "}
                          {request.requestedAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {request.requestMessage ? (
                        <p className="rounded-xl bg-surface-alt px-4 py-3 text-[15px] leading-relaxed text-muted ring-1 ring-line">
                          {request.requestMessage}
                        </p>
                      ) : null}
                    </div>

                    <EnrollmentReview
                      enrollmentId={request.id}
                      studentName={request.user.name ?? request.user.email}
                      courseTitle={request.course.title}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
