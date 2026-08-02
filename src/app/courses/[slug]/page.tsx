import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import {
  deliveryModeLabels,
  formatCoursePrice,
  getCourseBySlug,
  levelLabels,
} from "@/lib/course-catalog";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) return { title: "Course" };

  const title = course.seoTitle ?? course.title;
  const description =
    course.seoDescription ?? course.subtitle ?? course.description ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title,
      description,
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
  const price = formatCoursePrice({
    price: Number(course.price),
    currency: course.currency,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd(course)) }}
      />

      <section className="border-b border-line bg-surface-alt py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-center gap-2">
            {course.category ? <Eyebrow>{course.category.name}</Eyebrow> : null}
            {course.certificationTarget ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">
                {course.certificationTarget}
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-display">
            {course.title}
          </h1>
          {course.subtitle ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
              {course.subtitle}
            </p>
          ) : null}

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            <Stat label="Duration" value={`${course.durationHours}h`} />
            <Stat label="Level" value={levelLabels[course.level]} />
            <Stat
              label="Delivery"
              value={deliveryModeLabels[course.deliveryMode]}
            />
            <Stat label="Price" value={price} />
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/signup" className="px-8 py-3.5 text-base">
              Create account to enroll
            </ButtonLink>
            <ButtonLink
              href={`/contact?course=${course.slug}`}
              variant="secondary"
              className="px-8 py-3.5 text-base"
            >
              Ask about this course
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-14">
            {course.learningOutcomes.length > 0 ? (
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  What you&apos;ll learn
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {course.learningOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted"
                    >
                      <CheckIcon />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {course.description ? (
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  About this program
                </h2>
                <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                  {course.description}
                </p>
              </section>
            ) : null}

            {course.modules.length > 0 ? (
              <section>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-ink">
                    Syllabus
                  </h2>
                  <span className="text-sm text-muted">
                    {course.modules.length} modules · {lessonCount} lessons
                  </span>
                </div>
                <ol className="mt-6 flex flex-col gap-4">
                  {course.modules.map((module, index) => (
                    <li
                      key={module.id}
                      className="rounded-2xl bg-white p-6 ring-1 ring-line"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-sm font-bold text-brand-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-lg font-bold tracking-tight text-ink">
                          {module.title}
                        </h3>
                      </div>
                      {module.description ? (
                        <p className="mt-2 text-sm text-muted">
                          {module.description}
                        </p>
                      ) : null}
                      {module.lessons.length > 0 ? (
                        <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                          {module.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between gap-3 text-sm text-muted"
                            >
                              <span className="flex items-center gap-2.5">
                                <LessonTypeIcon type={lesson.type} />
                                {lesson.title}
                                {lesson.isPreview ? (
                                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                                    Free preview
                                  </span>
                                ) : null}
                              </span>
                              {lesson.durationMinutes ? (
                                <span className="shrink-0 text-xs">
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
              </section>
            ) : (
              <p className="rounded-2xl bg-surface-alt p-6 text-sm text-muted ring-1 ring-line">
                The detailed syllabus for this program is being finalized.
                Reach out and we&apos;ll share it directly.
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-8">
            {course.prerequisites ? (
              <div className="rounded-2xl bg-surface-alt p-6 ring-1 ring-line">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Prerequisites
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                  {course.prerequisites}
                </p>
              </div>
            ) : null}

            {course.instructors.length > 0 ? (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Instructors
                </h3>
                {course.instructors.map(({ userId, user }) => (
                  <div
                    key={userId}
                    className="rounded-2xl bg-white p-6 ring-1 ring-line"
                  >
                    <p className="font-bold tracking-tight text-ink">
                      {user.name ?? "Instructor"}
                    </p>
                    {user.instructorProfile?.headline ? (
                      <p className="mt-1 text-sm text-brand-600">
                        {user.instructorProfile.headline}
                      </p>
                    ) : null}
                    {user.instructorProfile?.bio ? (
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {user.instructorProfile.bio}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="text-lg font-bold tracking-tight text-ink">{value}</dd>
    </div>
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

const lessonTypeGlyph: Record<string, string> = {
  VIDEO: "▶",
  PDF: "▤",
  TEXT: "≡",
  QUIZ: "✓",
};

function LessonTypeIcon({ type }: { type: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs text-brand-600"
    >
      {lessonTypeGlyph[type] ?? "•"}
    </span>
  );
}

type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

function courseJsonLd(course: CourseDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle ?? course.description ?? undefined,
    url: `${site.url}/courses/${course.slug}`,
    provider: {
      "@type": "Organization",
      name: site.name,
      sameAs: site.url,
    },
    offers: {
      "@type": "Offer",
      price: Number(course.price),
      priceCurrency: course.currency,
      availability: "https://schema.org/InStock",
    },
  };
}
