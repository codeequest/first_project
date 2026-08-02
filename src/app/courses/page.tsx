import type { Metadata } from "next";
import type { CourseLevel } from "@prisma/client";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Container, Eyebrow, SectionHeading, cn } from "@/components/ui";
import { getCategories, getPublishedCourses, levelLabels } from "@/lib/courses";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Certification training in Power BI, Generative AI, PMP and Scrum Master — filter by category and level to find your program.",
};

const levels = Object.keys(levelLabels) as CourseLevel[];

function isCourseLevel(value: string | undefined): value is CourseLevel {
  return !!value && levels.includes(value as CourseLevel);
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category;
  const activeLevel = isCourseLevel(params.level) ? params.level : undefined;

  const [categories, courses] = await Promise.all([
    getCategories(),
    getPublishedCourses({ categorySlug: activeCategory, level: activeLevel }),
  ]);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Eyebrow>Catalog</Eyebrow>
          <SectionHeading
            title={
              <span className="font-display">
                Find the certification track built for you
              </span>
            }
            description="Filter by category or level to narrow the four programs down to the one that matches where you want to be next."
          />
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <FilterRow
            label="Category"
            activeValue={activeCategory}
            paramName="category"
            currentLevel={params.level}
            options={categories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
          />
          <FilterRow
            label="Level"
            activeValue={activeLevel}
            paramName="level"
            currentCategory={params.category}
            options={levels.map((level) => ({
              value: level,
              label: levelLabels[level],
            }))}
          />
        </div>

        {courses.length > 0 ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <p className="mt-20 text-center text-muted">
            No courses match these filters yet — try clearing one of them.
          </p>
        )}
      </Container>
    </section>
  );
}

function FilterRow({
  label,
  options,
  activeValue,
  paramName,
  currentCategory,
  currentLevel,
}: {
  label: string;
  options: { value: string; label: string }[];
  activeValue?: string;
  paramName: "category" | "level";
  currentCategory?: string;
  currentLevel?: string;
}) {
  function hrefFor(value: string | undefined) {
    const next = new URLSearchParams();
    const category = paramName === "category" ? value : currentCategory;
    const level = paramName === "level" ? value : currentLevel;
    if (category) next.set("category", category);
    if (level) next.set("level", level);
    const query = next.toString();
    return query ? `/courses?${query}` : "/courses";
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <FilterPill href={hrefFor(undefined)} active={!activeValue}>
        All
      </FilterPill>
      {options.map((option) => (
        <FilterPill
          key={option.value}
          href={hrefFor(option.value)}
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
  children: React.ReactNode;
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
