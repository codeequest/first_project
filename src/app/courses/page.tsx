import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CourseCard } from "@/components/course-card";
import { Container, Eyebrow, SectionHeading, cn } from "@/components/ui";
import {
  getCatalogFilterOptions,
  getPublishedCourses,
} from "@/lib/course-catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Course catalog",
  description:
    "Browse certification training in Power BI, Generative AI, PMP and Scrum Master — filter by category, level and delivery mode.",
  alternates: { canonical: "/courses" },
};

type SearchParams = { category?: string; level?: string; mode?: string };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const [courses, options] = await Promise.all([
    getPublishedCourses(filters),
    getCatalogFilterOptions(),
  ]);

  return (
    <section className="py-20 sm:py-28">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseCatalogJsonLd(courses)),
        }}
      />
      <Container>
        <div className="flex flex-col items-center text-center">
          <Eyebrow>Catalog</Eyebrow>
          <SectionHeading
            title="Find your certification track"
            description="Every program lists its price and duration up front. Request a place and our team confirms it directly with you."
          />
        </div>

        <FilterBar filters={filters} options={options} />

        {courses.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl bg-surface-alt py-16 text-center ring-1 ring-line">
            <p className="text-lg font-semibold text-ink">
              No courses match these filters.
            </p>
            <p className="max-w-sm text-sm text-muted">
              Try clearing a filter, or{" "}
              <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                get in touch
              </Link>{" "}
              and we&apos;ll point you to the right program.
            </p>
            <Link
              href="/courses"
              className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}

type FilterOptions = Awaited<ReturnType<typeof getCatalogFilterOptions>>;

function FilterBar({
  filters,
  options,
}: {
  filters: SearchParams;
  options: FilterOptions;
}) {
  const hasActiveFilter = Boolean(
    filters.category || filters.level || filters.mode,
  );

  return (
    <div className="mt-12 flex flex-col gap-4 border-y border-line py-6">
      <FilterGroup
        label="Category"
        options={options.categories.map((c) => ({ value: c.slug, label: c.name }))}
        paramKey="category"
        activeValue={filters.category}
        filters={filters}
      />
      <FilterGroup
        label="Level"
        options={options.levels.map(([value, label]) => ({ value, label }))}
        paramKey="level"
        activeValue={filters.level}
        filters={filters}
      />
      <FilterGroup
        label="Delivery"
        options={options.deliveryModes.map(([value, label]) => ({
          value,
          label,
        }))}
        paramKey="mode"
        activeValue={filters.mode}
        filters={filters}
      />
      {hasActiveFilter ? (
        <Link
          href="/courses"
          className="self-start text-xs font-semibold text-brand-600 hover:underline"
        >
          Clear all filters
        </Link>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  paramKey,
  activeValue,
  filters,
}: {
  label: string;
  options: { value: string; label: string }[];
  paramKey: keyof SearchParams;
  activeValue?: string;
  filters: SearchParams;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <FilterPill
        href={buildFilterHref(filters, paramKey, undefined)}
        active={!activeValue}
      >
        All
      </FilterPill>
      {options.map((option) => (
        <FilterPill
          key={option.value}
          href={buildFilterHref(filters, paramKey, option.value)}
          active={activeValue === option.value}
        >
          {option.label}
        </FilterPill>
      ))}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
        active
          ? "bg-brand-600 text-white ring-brand-600"
          : "bg-white text-ink ring-line hover:ring-brand-300 hover:text-brand-700",
      )}
    >
      {children}
    </Link>
  );
}

function buildFilterHref(
  filters: SearchParams,
  key: keyof SearchParams,
  value: string | undefined,
) {
  const params = new URLSearchParams();
  const next = { ...filters, [key]: value };

  for (const [paramKey, paramValue] of Object.entries(next)) {
    if (paramValue) params.set(paramKey, paramValue);
  }

  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}

function courseCatalogJsonLd(
  courses: Awaited<ReturnType<typeof getPublishedCourses>>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/courses/${course.slug}`,
      name: course.title,
    })),
  };
}
