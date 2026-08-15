import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnrollCta } from "@/components/enroll-cta";
import { Container, Eyebrow } from "@/components/ui";
import {
  formatPrice,
  getCourseBySlug,
  getPublishedCourseSlugs,
  levelLabels,
} from "@/lib/courses";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.seoTitle ?? course.title,
    description: course.seoDescription ?? course.subtitle ?? undefined,
  };
}

const lessonTypeLabels = {
  VIDEO: "Video",
  PDF: "Reading",
  TEXT: "Lesson",
  QUIZ: "Quiz",
} as const;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  return (
    <>
      <section className="border-b border-line bg-surface-alt py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4">
            {course.category ? <Eyebrow>{course.category.name}</Eyebrow> : null}
            <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
              {course.title}
            </h1>
            {course.subtitle ? (
              <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted">
                {course.subtitle}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="flex flex-col gap-12">
            {course.description ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  About this course
                </h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">
                  {course.description}
                </p>
              </div>
            ) : null}

            {course.learningOutcomes.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  What you will learn
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.learningOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-[15px] text-muted"
                    >
                      <CheckIcon />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {course.modules.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  Syllabus
                </h2>
                <p className="text-sm text-muted">
                  {course.modules.length} modules · {totalLessons} lessons
                </p>
                <div className="flex flex-col gap-3">
                  {course.modules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-2xl bg-white p-6 ring-1 ring-line"
                    >
                      <h3 className="font-semibold text-ink">
                        {module.title}
                      </h3>
                      <ul className="mt-3 flex flex-col gap-2">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between gap-3 text-sm text-muted"
                          >
                            <span>
                              {lessonTypeLabels[lesson.type]} — {lesson.title}
                            </span>
                            <span className="flex items-center gap-2 whitespace-nowrap text-xs">
                              {lesson.isPreview ? (
                                <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
                                  Preview
                                </span>
                              ) : null}
                              {lesson.durationMinutes
                                ? `${lesson.durationMinutes} min`
                                : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {course.instructors.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  Instructors
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {course.instructors.map(({ user, isLead }) => (
                    <div
                      key={user.id}
                      className="rounded-2xl bg-white p-6 ring-1 ring-line"
                    >
                      <p className="font-semibold text-ink">
                        {user.name}
                        {isLead ? (
                          <span className="ml-2 text-xs font-medium text-brand-600">
                            Lead instructor
                          </span>
                        ) : null}
                      </p>
                      {user.instructorProfile?.headline ? (
                        <p className="mt-1 text-sm text-muted">
                          {user.instructorProfile.headline}
                        </p>
                      ) : null}
                      {user.instructorProfile?.bio ? (
                        <p className="mt-3 text-[15px] leading-relaxed text-muted">
                          {user.instructorProfile.bio}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {course.testimonials.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  What students say
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {course.testimonials.map((testimonial) => (
                    <figure
                      key={testimonial.id}
                      className="rounded-2xl bg-white p-6 ring-1 ring-line"
                    >
                      <blockquote className="text-[15px] leading-relaxed text-ink/80">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-4 text-sm font-semibold text-ink">
                        {testimonial.authorName}
                        {testimonial.authorTitle ? (
                          <span className="block text-xs font-normal text-muted">
                            {testimonial.authorTitle}
                          </span>
                        ) : null}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="flex flex-col gap-6 rounded-2xl bg-white p-7 ring-1 ring-line lg:sticky lg:top-28">
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-ink">
                {formatPrice(course)}
              </span>
              <p className="mt-1 text-sm text-muted">
                Payment is arranged directly with our team once your request
                is approved.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4 border-y border-line py-5 text-sm">
              <div>
                <dt className="text-muted">Duration</dt>
                <dd className="font-semibold text-ink">
                  {course.durationHours} hours
                </dd>
              </div>
              <div>
                <dt className="text-muted">Level</dt>
                <dd className="font-semibold text-ink">
                  {levelLabels[course.level]}
                </dd>
              </div>
              {course.contactHours ? (
                <div>
                  <dt className="text-muted">Contact hours</dt>
                  <dd className="font-semibold text-ink">
                    {course.contactHours}
                  </dd>
                </div>
              ) : null}
              {course.certificationTarget ? (
                <div>
                  <dt className="text-muted">Certification</dt>
                  <dd className="font-semibold text-ink">
                    {course.certificationTarget}
                  </dd>
                </div>
              ) : null}
            </dl>

            <EnrollCta courseSlug={course.slug} />
          </aside>
        </Container>
      </section>
    </>
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
