import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { cn, Container, Eyebrow } from "@/components/ui";
import {
  COURSE_LEVELS,
  DELIVERY_MODES,
  deliveryLabel,
  getCatalogCategories,
  getPublishedCourses,
  levelLabel,
  parseDelivery,
  parseLevel,
} from "@/lib/courses";
import { site } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Query strings only ever carry one value per filter here. */
function single(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const isFiltered = ["category", "level", "delivery", "q"].some((key) =>
    single(params[key]),
  );

  return {
    title: "Courses",
    description: `Browse every ${site.name} certification program — syllabus, duration, delivery mode and pricing for each track.`,
    alternates: { canonical: "/courses" },
    // Filtered views are the same catalog sliced differently. Keep them out of
    // the index so they do not compete with /courses, but let crawlers follow
    // through to the course pages.
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const filters = {
    category: single(params.category),
    level: parseLevel(single(params.level)),
    delivery: parseDelivery(single(params.delivery)),
    q: single(params.q),
  };

  const [courses, categories] = await Promise.all([
    getPublishedCourses(filters),
    getCatalogCategories(),
  ]);

  const active = new URLSearchParams();
  if (filters.category) active.set("category", filters.category);
  if (filters.level) active.set("level", filters.level);
  if (filters.delivery) active.set("delivery", filters.delivery);
  if (filters.q) active.set("q", filters.q);
  const hasFilters = active.size > 0;

  /** Builds a href that toggles one filter and leaves the others alone. */
  function hrefWith(key: string, value?: string) {
    const next = new URLSearchParams(active);
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    return query ? `/courses?${query}` : "/courses";
  }

  const one = courses.length === 1;
  const countLabel = `${courses.length} ${one ? "course" : "courses"} ${
    hasFilters ? (one ? "matches your filters" : "match your filters") : "available"
  }`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} course catalog`,
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/courses/${course.slug}`,
      name: course.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-line bg-surface-alt py-16 sm:py-20">
        <Container>
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>Catalog</Eyebrow>
            <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-display">
              Every program we run, in full detail.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted">
              Syllabus, duration, delivery mode and pricing for each track.
              Request a place and our team confirms it with you directly —
              payment is arranged offline.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-8">
            {/* GET form: filters live in the URL, so a filtered catalog is
                shareable, bookmarkable and works without JavaScript. */}
            <Form action="/courses" className="flex flex-col gap-6">
              {/* Chip selections travel with the search box on submit. */}
              {filters.category ? (
                <input type="hidden" name="category" value={filters.category} />
              ) : null}
              {filters.level ? (
                <input type="hidden" name="level" value={filters.level} />
              ) : null}
              {filters.delivery ? (
                <input type="hidden" name="delivery" value={filters.delivery} />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="q" className="sr-only">
                    Search courses
                  </label>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={filters.q ?? ""}
                    placeholder="Search by title or certification…"
                    className="w-full rounded-full border border-line bg-white px-5 py-3 text-[15px] text-ink transition-colors placeholder:text-muted/60 hover:border-brand-300"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition duration-200 hover:bg-brand-700"
                >
                  Search
                </button>
              </div>
            </Form>

            <div className="flex flex-col gap-4">
              <FilterRow label="Category">
                <FilterChip href={hrefWith("category")} active={!filters.category}>
                  All
                </FilterChip>
                {categories.map((category) => (
                  <FilterChip
                    key={category.slug}
                    href={hrefWith("category", category.slug)}
                    active={filters.category === category.slug}
                  >
                    {category.name}
                  </FilterChip>
                ))}
              </FilterRow>

              <FilterRow label="Level">
                <FilterChip href={hrefWith("level")} active={!filters.level}>
                  All
                </FilterChip>
                {COURSE_LEVELS.map((level) => (
                  <FilterChip
                    key={level}
                    href={hrefWith("level", level)}
                    active={filters.level === level}
                  >
                    {levelLabel(level)}
                  </FilterChip>
                ))}
              </FilterRow>

              <FilterRow label="Format">
                <FilterChip
                  href={hrefWith("delivery")}
                  active={!filters.delivery}
                >
                  All
                </FilterChip>
                {DELIVERY_MODES.map((mode) => (
                  <FilterChip
                    key={mode}
                    href={hrefWith("delivery", mode)}
                    active={filters.delivery === mode}
                  >
                    {deliveryLabel(mode)}
                  </FilterChip>
                ))}
              </FilterRow>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <p aria-live="polite" className="text-sm text-muted">
                {countLabel}
              </p>
              {hasFilters ? (
                <Link
                  href="/courses"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Clear all filters
                </Link>
              ) : null}
            </div>

            {courses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {courses.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-alt px-8 py-16 text-center ring-1 ring-line">
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Nothing matches that combination
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                  Try removing a filter, or tell us what you are looking for —
                  we run private cohorts for teams as well.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-brand-700"
                  >
                    Show all courses
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink ring-1 ring-line transition duration-200 hover:text-brand-700 hover:ring-brand-300"
                  >
                    Ask about a course
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:w-20 sm:shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition duration-200",
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-muted ring-1 ring-line hover:text-brand-700 hover:ring-brand-300",
      )}
    >
      {children}
    </Link>
  );
}
