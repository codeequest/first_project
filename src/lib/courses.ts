import type { CourseLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const levelLabels: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const courseCardSelect = {
  slug: true,
  title: true,
  subtitle: true,
  level: true,
  durationHours: true,
  price: true,
  currency: true,
  certificationTarget: true,
  learningOutcomes: true,
  category: { select: { slug: true, name: true } },
} satisfies Prisma.CourseSelect;

type CourseCardRow = Prisma.CourseGetPayload<{ select: typeof courseCardSelect }>;

export type CourseCardData = Omit<CourseCardRow, "price"> & { price: number };

function toCourseCardData(row: CourseCardRow): CourseCardData {
  return { ...row, price: Number(row.price) };
}

export async function getFeaturedCourses(limit = 4): Promise<CourseCardData[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    select: courseCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(toCourseCardData);
}

export async function getPublishedCourses(filters?: {
  categorySlug?: string;
  level?: CourseLevel;
}): Promise<CourseCardData[]> {
  const rows = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(filters?.categorySlug
        ? { category: { slug: filters.categorySlug } }
        : {}),
      ...(filters?.level ? { level: filters.level } : {}),
    },
    select: courseCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  return rows.map(toCourseCardData);
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { courses: { some: { status: "PUBLISHED" } } },
    select: { slug: true, name: true, nameFr: true },
    orderBy: { order: "asc" },
  });
}

const courseDetailSelect = {
  slug: true,
  title: true,
  subtitle: true,
  description: true,
  level: true,
  deliveryMode: true,
  durationHours: true,
  contactHours: true,
  price: true,
  currency: true,
  certificationTarget: true,
  prerequisites: true,
  learningOutcomes: true,
  seoTitle: true,
  seoDescription: true,
  category: { select: { slug: true, name: true } },
  modules: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
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
    where: { user: { instructorProfile: { isPublic: true } } },
    select: {
      isLead: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          instructorProfile: {
            select: { headline: true, bio: true, expertise: true },
          },
        },
      },
    },
  },
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

type CourseDetailRow = Prisma.CourseGetPayload<{
  select: typeof courseDetailSelect;
}>;

export type CourseDetailData = Omit<CourseDetailRow, "price"> & {
  price: number;
};

export async function getCourseBySlug(
  slug: string,
): Promise<CourseDetailData | null> {
  const row = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: courseDetailSelect,
  });
  if (!row) return null;
  return { ...row, price: Number(row.price) };
}

export async function getPublishedCourseSlugs(): Promise<string[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/**
 * The subset the enrollment flow needs. Separate from the detail select
 * because that one is for the public page and deliberately omits the id.
 */
export async function getEnrollableCourse(slug: string) {
  const row = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      level: true,
      durationHours: true,
      price: true,
      currency: true,
    },
  });
  if (!row) return null;
  return { ...row, price: Number(row.price) };
}

/** Lightweight list for nav-style contexts like the site footer. */
export async function getFooterCourseLinks() {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });
}

export function formatPrice({
  price,
  currency,
}: {
  price: number;
  currency: string;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
