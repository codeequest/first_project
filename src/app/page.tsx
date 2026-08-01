import { CourseCard } from "@/components/course-card";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { featuredCourses } from "@/lib/courses";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCourses />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <FinalCta />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative -mt-18 overflow-hidden pt-18">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(to_right,var(--color-brand-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-100)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-[120px]"
      />

      <Container className="py-20 sm:py-28 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow>Power BI · Generative AI · PMP · Scrum</Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-extrabold tracking-tight text-balance text-ink sm:text-display-lg lg:text-display-xl">
              Build the skills that
              <span className="relative mx-3 inline-block whitespace-nowrap text-brand-600">
                get certified
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-3 w-full text-accent-400"
                >
                  <path
                    d="M2 9c60-6 130-8 296-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              and get hired.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
              Instructor-led and self-paced training in data, AI and project
              management — designed and delivered by certified practitioners,
              not career trainers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/courses" className="px-8 py-3.5 text-base">
                Explore courses
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="secondary"
                className="px-8 py-3.5 text-base"
              >
                Talk to an advisor
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-12 sm:grid-cols-4">
              <Stat value="1 200+" label="Professionals trained" />
              <Stat value="4" label="Certification tracks" />
              <Stat value="94%" label="Exam pass rate" />
              <Stat value="4.8/5" label="Average rating" />
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {value}
      </dd>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

/* ── Trust bar ────────────────────────────────────────────────────────── */

const partners = [
  "Microsoft",
  "PMI",
  "Scrum.org",
  "Scrum Alliance",
  "Google Cloud",
];

function TrustBar() {
  return (
    <section className="border-y border-line bg-surface-alt py-10">
      <Container>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Preparing candidates for certifications from
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partners.map((partner) => (
            <span
              key={partner}
              className="font-display text-xl font-bold tracking-tight text-ink/35 transition-colors duration-300 hover:text-ink/60"
            >
              {partner}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── Featured courses ─────────────────────────────────────────────────── */

function FeaturedCourses() {
  return (
    <section id="courses" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Our programs"
            title={
              <span className="font-display">
                Four tracks. One measurable outcome.
              </span>
            }
            description="Every program ends with a recognised certification, a portfolio piece, or both. Choose the track that matches where you want to be in six months."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {featuredCourses.map((course, index) => (
            <Reveal key={course.slug} delay={index * 90}>
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <ButtonLink href="/courses" variant="secondary">
              See the full catalog
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── Why us ───────────────────────────────────────────────────────────── */

const advantages = [
  {
    title: "Practitioners, not lecturers",
    body: "Every instructor is certified and still working in the field. You learn the workflow they use on Monday morning, not a textbook abstraction.",
  },
  {
    title: "Built around the exam",
    body: "Course structure maps directly to the official exam domains — PL-300, PMP, PSM I — so nothing you study is wasted effort.",
  },
  {
    title: "Small, attentive cohorts",
    body: "Groups stay small enough that your questions get answered the same day, and your instructor knows where you are struggling.",
  },
  {
    title: "Materials you keep",
    body: "Slides, datasets, recorded sessions, quiz banks and cheat sheets stay available in your dashboard after the course ends.",
  },
];

function WhyUs() {
  return (
    <section
      id="why-us"
      className="border-y border-line bg-surface-alt py-24 sm:py-32"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                align="left"
                eyebrow="Why us"
                title={
                  <span className="font-display">
                    Training that survives contact with a real job.
                  </span>
                }
                description="We run a small number of programs and run them properly. That is the whole strategy."
              />
              <ButtonLink href="/contact" className="mt-8">
                Book a free consultation
              </ButtonLink>
            </div>
          </Reveal>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {advantages.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="flex flex-col gap-3">
                  <span className="font-display text-sm font-bold text-brand-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────── */

const steps = [
  {
    title: "Create your account",
    body: "Sign up in under a minute and browse the full catalog, including syllabus, duration and pricing for every program.",
  },
  {
    title: "Request enrollment",
    body: "Pick your course and submit an enrollment request. Our team confirms your place and arranges payment with you directly.",
  },
  {
    title: "Learn and certify",
    body: "Once approved, your course unlocks — lessons, materials and quizzes. Finish it and your certificate is issued automatically.",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title={
              <span className="font-display">From sign-up to certificate</span>
            }
            description="Three steps, no bureaucracy. Most students are inside their course within 24 hours of applying."
          />
        </Reveal>

        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100} as="li">
              <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-8 ring-1 ring-line">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────────────── */

const testimonials = [
  {
    quote:
      "I had been putting off the PMP for three years. The cohort format and the mock exams made the difference — I passed on the first attempt.",
    name: "Placeholder Name",
    role: "Project Manager, Placeholder Company",
  },
  {
    quote:
      "The Power BI track was ruthlessly practical. I rebuilt our entire monthly reporting pack during the course and presented it in week five.",
    name: "Placeholder Name",
    role: "Data Analyst, Placeholder Company",
  },
  {
    quote:
      "Genuinely the first Generative AI course I have taken that went past the demo stage and into what you actually ship.",
    name: "Placeholder Name",
    role: "Software Engineer, Placeholder Company",
  },
];

function Testimonials() {
  return (
    <section className="border-y border-line bg-surface-alt py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title={<span className="font-display">What our graduates say</span>}
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.quote} delay={index * 90}>
              <figure className="flex h-full flex-col gap-6 rounded-2xl bg-white p-8 ring-1 ring-line">
                <Stars />
                <blockquote className="flex-1 text-[15px] leading-relaxed text-ink/80">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-line pt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700">
                    {item.name.charAt(0)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent-500" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8L10 1.6Z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Final CTA ────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div
              aria-hidden="true"
              className="absolute -top-32 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[100px]"
            />
            <div className="relative flex flex-col items-center">
              <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight text-balance text-white sm:text-display">
                Your next certification starts here.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-white/70">
                Create your account, request a place on the program you want,
                and we will take it from there.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/signup"
                  variant="secondary"
                  className="px-8 py-3.5 text-base"
                >
                  Create free account
                </ButtonLink>
                <ButtonLink
                  href="/courses"
                  className="bg-white/10 px-8 py-3.5 text-base text-white shadow-none ring-1 ring-white/20 hover:bg-white/15 hover:shadow-none"
                >
                  Browse courses
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
