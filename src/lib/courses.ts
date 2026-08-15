/**
 * Public catalog — queries and display helpers.
 *
 * Everything in here backs the marketing site, which is readable by anyone,
 * so every query is scoped to `status: PUBLISHED`. Draft and archived courses
 * must never leak out of this module.
 *
 * Queries are wrapped in React's `cache()` so a page and its
 * `generateMetadata` can both call them and only hit the database once.
 */
import type { CourseLevel, DeliveryMode, Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/* ── Filter vocabulary ────────────────────────────────────────────────── */

export const COURSE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const satisfies readonly CourseLevel[];

export const DELIVERY_MODES = [
  "SELF_PACED",
  "LIVE_ONLINE",
  "IN_PERSON",
  "HYBRID",
] as const satisfies readonly DeliveryMode[];

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  SELF_PACED: "Self-paced",
  LIVE_ONLINE: "Live online",
  IN_PERSON: "In person",
  HYBRID: "Hybrid",
};

export function levelLabel(level: CourseLevel) {
  return LEVEL_LABELS[level];
}

export function deliveryLabel(mode: DeliveryMode) {
  return DELIVERY_LABELS[mode];
}

/** Narrows an untrusted query-string value to a known enum member. */
export function parseLevel(value: string | undefined): CourseLevel | undefined {
  return COURSE_LEVELS.find((level) => level === value);
}

export function parseDelivery(
  value: string | undefined,
): DeliveryMode | undefined {
  return DELIVERY_MODES.find((mode) => mode === value);
}

/* ── Shapes ───────────────────────────────────────────────────────────── */

const cardSelect = {
  slug: true,
  title: true,
  subtitle: true,
  level: true,
  deliveryMode: true,
  durationHours: true,
  price: true,
  currency: true,
  certificationTarget: true,
  learningOutcomes: true,
  category: { select: { slug: true, name: true } },
} satisfies Prisma.CourseSelect;

const detailSelect = {
  ...cardSelect,
  id: true,
  description: true,
  contactHours: true,
  prerequisites: true,
  promoVideoUrl: true,
  thumbnailUrl: true,
  seoTitle: true,
  seoDescription: true,
  publishedAt: true,
  updatedAt: true,
  modules: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          durationMinutes: true,
          isPreview: true,
        },
      },
    },
  },
  instructors: {
    // A course can list several instructors; the lead comes first.
    orderBy: { isLead: "desc" },
    where: { user: { instructorProfile: { isPublic: true } } },
    select: {
      isLead: true,
      user: {
        select: {
          id: true,
          name: true,
          instructorProfile: {
            select: { headline: true, bio: true, linkedinUrl: true },
          },
        },
      },
    },
  },
  // Only approved testimonials are public; pending and rejected ones must
  // never reach the marketing site.
  testimonials: {
    where: { status: "APPROVED" },
    select: {
      id: true,
      authorName: true,
      authorTitle: true,
      rating: true,
      quote: true,
    },
  },
} satisfies Prisma.CourseSelect;

type CourseCardRow = Prisma.CourseGetPayload<{ select: typeof cardSelect }>;
type CourseDetailRow = Prisma.CourseGetPayload<{ select: typeof detailSelect }>;

/**
 * `price` is a Prisma `Decimal`, which is not a plain value React can pass
 * across the server/client boundary — it is converted to a number here, once.
 */
export type CatalogCourse = Omit<CourseCardRow, "price"> & { price: number };
export type CourseDetail = Omit<CourseDetailRow, "price"> & { price: number };

function toCatalogCourse<T extends { price: Prisma.Decimal }>(row: T) {
  return { ...row, price: Number(row.price) };
}

/* ── Queries ──────────────────────────────────────────────────────────── */

export type CatalogFilters = {
  category?: string;
  level?: CourseLevel;
  delivery?: DeliveryMode;
  q?: string;
};

export const getPublishedCourses = cache(
  async (filters: CatalogFilters = {}): Promise<CatalogCourse[]> => {
    const { category, level, delivery, q } = filters;

    const rows = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        ...(level ? { level } : {}),
        ...(delivery ? { deliveryMode: delivery } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { subtitle: { contains: q, mode: "insensitive" } },
                { certificationTarget: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
      select: cardSelect,
    });

    return rows.map(toCatalogCourse);
  },
);

export const getFeaturedCourses = cache(
  async (limit = 4): Promise<CatalogCourse[]> => {
    const rows = await prisma.course.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { title: "asc" },
      take: limit,
      select: cardSelect,
    });

    return rows.map(toCatalogCourse);
  },
);

export const getCourseBySlug = cache(
  async (slug: string): Promise<CourseDetail | null> => {
    const row = await prisma.course.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: detailSelect,
    });

    return row ? toCatalogCourse(row) : null;
  },
);

/** Categories that actually have something published in them. */
export const getCatalogCategories = cache(async () => {
  return prisma.category.findMany({
    where: { courses: { some: { status: "PUBLISHED" } } },
    orderBy: { order: "asc" },
    select: { slug: true, name: true },
  });
});

/**
 * Slug + title only, for navigation. Used by the site footer, which renders
 * on every page including the private ones — keep it cheap.
 */
export const getCourseNavLinks = cache(async () => {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
    take: 6,
    select: { slug: true, title: true },
  });
});

/** Used by `generateStaticParams` and the sitemap. */
export const getPublishedCourseSlugs = cache(async () => {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: { slug: true, updatedAt: true },
  });
});

/* ── Formatting ───────────────────────────────────────────────────────── */

export function formatPrice(course: Pick<CatalogCourse, "price" | "currency">) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: course.currency,
    maximumFractionDigits: 0,
  }).format(course.price);
}
