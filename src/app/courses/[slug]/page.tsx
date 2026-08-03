import type { LessonType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container } from "@/components/ui";
import {
  deliveryLabel,
  formatPrice,
  getCourseBySlug,
  getPublishedCourseSlugs,
  levelLabel,
  type CourseDetail,
} from "@/lib/courses";
import { site } from "@/lib/site";

/**
 * Course pages change rarely, so they are prerendered and refreshed hourly
 * rather than rebuilt on every request.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const courses = await getPublishedCourseSlugs();
    return courses.map((course) => ({ slug: course.slug }));
  } catch {
    // No database reachable at build time (a CI job without Postgres, say).
    // Returning nothing is safe: pages are then rendered on first request.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) return { title: "Course not found" };

  const title = course.seoTitle ?? course.title;
  const description =
    course.seoDescription ?? course.subtitle ?? site.description;

  return {
    title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${site.url}/courses/${course.slug}`,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <>
      <StructuredData course={course} />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface-alt py-12 sm:py-16">
        <Container>
          <Breadcrumbs title={course.title} />

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {course.category ? (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                  {course.category.name}
                </span>
              ) : null}
              {course.certificationTarget ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted ring-1 ring-line">
                  Prepares for {course.certificationTarget}
                </span>
              ) : null}
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-display">
              {course.title}
            </h1>

            {course.subtitle ? (
              <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted">
                {course.subtitle}
              </p>
            ) : null}

            <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4">
              <Fact label="Duration" value={`${course.durationHours} hours`} />
              <Fact label="Level" value={levelLabel(course.level)} />
              <Fact
                label="Format"
                value={deliveryLabel(course.deliveryMode)}
              />
              {course.contactHours ? (
                <Fact
                  label="Contact hours"
                  value={`${course.contactHours} claimable`}
                />
              ) : null}
            </dl>
          </div>
        </Container>
      </section>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-14">
              {course.description ? (
                <Block title="About this course">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">
                    {course.description}
                  </p>
                </Block>
              ) : null}

              {course.learningOutcomes.length > 0 ? (
                <Block title="What you will be able to do">
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {course.learningOutcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3">
                        <CheckIcon />
                        <span className="text-[15px] leading-relaxed text-muted">
                          {outcome}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              <Block
                title="Curriculum"
                aside={
                  lessonCount > 0
                    ? `${course.modules.length} modules · ${lessonCount} lessons`
                    : undefined
                }
              >
                {course.modules.length > 0 ? (
                  <ol className="flex flex-col gap-4">
                    {course.modules.map((module, index) => (
                      <li
                        key={module.id}
                        className="rounded-2xl bg-white p-6 ring-1 ring-line"
                      >
                        <div className="flex items-start gap-4">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-700">
                            {index + 1}
                          </span>
                          <div className="flex flex-1 flex-col gap-1">
                            <h3 className="font-bold tracking-tight text-ink">
                              {module.title}
                            </h3>
                            {module.description ? (
                              <p className="text-sm leading-relaxed text-muted">
                                {module.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {module.lessons.length > 0 ? (
                          <ul className="mt-5 flex flex-col divide-y divide-line border-t border-line">
                            {module.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm"
                              >
                                <span className="text-muted">
                                  {lessonTypeLabel(lesson.type)}
                                </span>
                                <span className="flex-1 text-ink">
                                  {lesson.title}
                                </span>
                                {lesson.isPreview ? (
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                    Free preview
                                  </span>
                                ) : null}
                                {lesson.durationMinutes ? (
                                  <span className="text-xs text-muted">
                                    {lesson.durationMinutes} min
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-2xl bg-surface-alt px-6 py-8 text-center text-[15px] leading-relaxed text-muted ring-1 ring-line">
                    The detailed module breakdown for this course is being
                    finalised.{" "}
                    <Link
                      href="/contact"
                      className="font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Ask us for the full syllabus
                    </Link>{" "}
                    and we will send it over.
                  </p>
                )}
              </Block>

              {course.prerequisites ? (
                <Block title="Prerequisites">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">
                    {course.prerequisites}
                  </p>
                </Block>
              ) : null}

              {course.instructors.length > 0 ? (
                <Block title="Who teaches it">
                  <div className="flex flex-col gap-6">
                    {course.instructors.map((entry) => (
                      <div
                        key={entry.user.id}
                        className="flex flex-col gap-2 rounded-2xl bg-white p-6 ring-1 ring-line"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold tracking-tight text-ink">
                            {entry.user.name}
                          </h3>
                          {entry.isLead ? (
                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                              Lead instructor
                            </span>
                          ) : null}
                        </div>
                        {entry.user.instructorProfile?.headline ? (
                          <p className="text-sm font-medium text-brand-600">
                            {entry.user.instructorProfile.headline}
                          </p>
                        ) : null}
                        {entry.user.instructorProfile?.bio ? (
                          <p className="text-[15px] leading-relaxed text-muted">
                            {entry.user.instructorProfile.bio}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Block>
              ) : null}
            </div>

            {/* ── Enrollment card ──────────────────────────────────── */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="flex flex-col gap-6 rounded-2xl bg-white p-7 ring-1 ring-line">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Programme fee
                  </span>
                  <span className="font-display text-4xl font-extrabold tracking-tight text-ink">
                    {formatPrice(course)}
                  </span>
                  <span className="text-sm text-muted">
                    {course.durationHours} hours ·{" "}
                    {deliveryLabel(course.deliveryMode)}
                  </span>
                </div>

                {/* Requesting a place is Track B's server action. Until it
                    lands, the CTA sends visitors through sign-up, which is
                    where the request flow will start anyway. */}
                <ButtonLink href="/signup" className="w-full py-3.5">
                  Request enrollment
                </ButtonLink>

                <p className="text-center text-xs leading-relaxed text-muted">
                  No payment is taken online. Submit a request and our team
                  confirms your place and arranges payment with you directly.
                </p>

                <ul className="flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted">
                  <Perk>Materials stay in your dashboard after the course</Perk>
                  <Perk>Certificate with a public verification code</Perk>
                  {course.certificationTarget ? (
                    <Perk>Mapped to the {course.certificationTarget} exam</Perk>
                  ) : null}
                </ul>

                <Link
                  href={`/contact?course=${course.slug}`}
                  className="text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Talk to an advisor first
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <li>
          <Link href="/" className="hover:text-brand-700">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/courses" className="hover:text-brand-700">
            Courses
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-medium text-ink">{title}</li>
      </ol>
    </nav>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Block({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {aside ? <span className="text-sm text-muted">{aside}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Perk({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  TEXT: "Reading",
  QUIZ: "Quiz",
};

function lessonTypeLabel(type: LessonType) {
  return LESSON_TYPE_LABELS[type];
}

/* ── Structured data ──────────────────────────────────────────────────── */

const COURSE_MODE: Record<CourseDetail["deliveryMode"], string> = {
  SELF_PACED: "online",
  LIVE_ONLINE: "online",
  IN_PERSON: "onsite",
  HYBRID: "blended",
};

function StructuredData({ course }: { course: CourseDetail }) {
  const url = `${site.url}/courses/${course.slug}`;
  const description = course.seoDescription ?? course.subtitle ?? undefined;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description,
      url,
      provider: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
      offers: {
        "@type": "Offer",
        price: course.price,
        priceCurrency: course.currency,
        category: "Paid",
        availability: "https://schema.org/InStock",
        url,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: COURSE_MODE[course.deliveryMode],
        // ISO 8601 duration, e.g. 40 hours -> PT40H
        courseWorkload: `PT${course.durationHours}H`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Courses",
          item: `${site.url}/courses`,
        },
        { "@type": "ListItem", position: 3, name: course.title, item: url },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
