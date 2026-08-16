import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { formatPrice, getEnrollableCourse, levelLabels } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { EnrollmentForm } from "./enrollment-form";

export const metadata: Metadata = { title: "Request enrollment" };

/**
 * Deliberately a route of its own rather than a panel on the course page:
 * /courses/[slug] is statically rendered with ISR, and this view depends on
 * who is asking.
 */

const statusPanels: Record<
  string,
  { tone: string; title: string; body: string }
> = {
  PENDING: {
    tone: "bg-amber-50 text-amber-900 ring-amber-100",
    title: "Your request is with our team",
    body: "An administrator reviews each request by hand — usually within 24 hours. You will see the course unlock in your dashboard as soon as it is approved.",
  },
  ACTIVE: {
    tone: "bg-emerald-50 text-emerald-900 ring-emerald-100",
    title: "You are enrolled on this course",
    body: "Your place is confirmed. Head to your dashboard to pick up where you left off.",
  },
  COMPLETED: {
    tone: "bg-brand-50 text-brand-900 ring-brand-100",
    title: "You have completed this course",
    body: "Your certificate and final score are available from your dashboard.",
  },
};

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const course = await getEnrollableCourse(slug);

  if (!course) notFound();

  const [enrollment, profile] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: {
        status: true,
        reviewNote: true,
        requestedAt: true,
        contactEmail: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        phone: true,
        studentProfile: { select: { company: true, jobTitle: true } },
      },
    }),
  ]);

  const panel = enrollment ? statusPanels[enrollment.status] : undefined;

  // Instructors and admins have no enrollment of their own to request.
  const canRequest = user.role === "STUDENT";

  return (
    <section className="bg-surface-alt py-14 sm:py-20">
      <Container className="max-w-3xl">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-muted transition-colors hover:text-brand-700"
        >
          ← Back to {course.title}
        </Link>

        <div className="mt-6 flex flex-col gap-4">
          <Eyebrow>Enrollment request</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {course.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            {course.durationHours} hours · {levelLabels[course.level]} ·{" "}
            {formatPrice(course)}
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-7 ring-1 ring-line sm:p-9">
          {panel ? (
            <div className="flex flex-col gap-5">
              <div className={`rounded-xl px-5 py-4 ring-1 ${panel.tone}`}>
                <h2 className="text-base font-bold">{panel.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed opacity-90">
                  {panel.body}
                </p>
              </div>
              <ButtonLink href="/dashboard" variant="secondary">
                Go to my dashboard
              </ButtonLink>
            </div>
          ) : !canRequest ? (
            <p className="text-[15px] leading-relaxed text-muted">
              Enrollment requests are made from a student account. You are
              signed in as{" "}
              <span className="font-semibold text-ink">
                {user.role.toLowerCase()}
              </span>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                  Tell us about you
                </h2>
                <p className="text-[15px] leading-relaxed text-muted">
                  {enrollment
                    ? "Your previous request was not approved. You are welcome to ask again."
                    : "An administrator reviews every request. Payment is arranged directly with our team once you are approved."}
                </p>
              </div>

              {enrollment?.reviewNote ? (
                <p className="rounded-xl bg-surface-alt px-4 py-3 text-sm text-muted ring-1 ring-line">
                  <span className="font-semibold text-ink">
                    Note from the last review:
                  </span>{" "}
                  {enrollment.reviewNote}
                </p>
              ) : null}

              <EnrollmentForm
                courseSlug={course.slug}
                defaults={{
                  contactEmail:
                    enrollment?.contactEmail ?? user.email ?? undefined,
                  phone: profile?.phone ?? undefined,
                  company: profile?.studentProfile?.company ?? undefined,
                  jobTitle: profile?.studentProfile?.jobTitle ?? undefined,
                }}
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
