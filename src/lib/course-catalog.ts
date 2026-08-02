import { CourseLevel, DeliveryMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * DB-backed catalog queries for the public site (Track A). Separate from
 * lib/courses.ts, which is static fixture data still used by the home page —
 * merging the two would mean touching a file outside this track's ownership.
 */

export const levelLabels: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const deliveryModeLabels: Record<DeliveryMode, string> = {
  SELF_PACED: "Self-paced",
  LIVE_ONLINE: "Live online",
  IN_PERSON: "In person",
  HYBRID: "Hybrid",
};

export type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  durationHours: number;
  price: number;
  currency: string;
  certification?: string;
  outcomes: string[];
};

type CourseWithCategory = {
  slug: string;
  title: string;
  subtitle: string | null;
  level: CourseLevel;
  durationHours: number;
  price: unknown;
  currency: string;
  certificationTarget: string | null;
  learningOutcomes: string[];
  category: { name: string } | null;
};

function toCourseCardData(course: CourseWithCategory): CourseCardData {
  return {
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle ?? "",
    category: course.category?.name ?? "General",
    level: levelLabels[course.level],
    durationHours: course.durationHours,
    price: Number(course.price),
    currency: course.currency,
    certification: course.certificationTarget ?? undefined,
    outcomes: course.learningOutcomes,
  };
}

export type CourseFilters = {
  category?: string;
  level?: string;
  mode?: string;
};

function isCourseLevel(value: string): value is CourseLevel {
  return value in CourseLevel;
}

function isDeliveryMode(value: string): value is DeliveryMode {
  return value in DeliveryMode;
}

export async function getPublishedCourses(filters: CourseFilters = {}) {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      category: filters.category ? { slug: filters.category } : undefined,
      level:
        filters.level && isCourseLevel(filters.level)
          ? filters.level
          : undefined,
      deliveryMode:
        filters.mode && isDeliveryMode(filters.mode)
          ? filters.mode
          : undefined,
    },
    include: { category: { select: { name: true } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
  });

  return courses.map(toCourseCardData);
}

export async function getCatalogFilterOptions() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, name: true },
  });

  return {
    categories,
    levels: Object.entries(levelLabels) as [CourseLevel, string][],
    deliveryModes: Object.entries(deliveryModeLabels) as [
      DeliveryMode,
      string,
    ][],
  };
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
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
        include: {
          user: {
            select: {
              name: true,
              image: true,
              instructorProfile: true,
            },
          },
        },
      },
    },
  });
}

export async function getCourseTitleBySlug(slug: string) {
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true },
  });
  return course?.title;
}

export function formatCoursePrice(course: { price: number; currency: string }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: course.currency,
    maximumFractionDigits: 0,
  }).format(course.price);
}
