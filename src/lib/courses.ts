/**
 * Static course catalog used by the marketing pages.
 *
 * This is TEMPORARY seed data so the front end can be built and reviewed
 * before the database exists. Once Prisma + PostgreSQL are wired up, these
 * objects get replaced by DB queries — the `Course` shape below is
 * deliberately close to the planned `Course` table so the swap is mechanical.
 */

export type CourseCategory =
  | "BI & Data"
  | "Artificial Intelligence"
  | "Project Management"
  | "Agile";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  category: CourseCategory;
  level: CourseLevel;
  /** Total training volume shown on the card and the detail page. */
  durationHours: number;
  /** Displayed only — enrollment is a request, payment is handled offline. */
  price: number;
  currency: string;
  /** Certification the course prepares for, if any. */
  certification?: string;
  outcomes: string[];
  featured: boolean;
};

export const courses: Course[] = [
  {
    slug: "power-bi",
    title: "Power BI",
    subtitle:
      "Turn raw data into decision-ready dashboards, from data modeling to DAX and publishing.",
    category: "BI & Data",
    level: "Beginner",
    durationHours: 40,
    price: 850,
    currency: "USD",
    certification: "Microsoft PL-300",
    outcomes: [
      "Model and clean data with Power Query",
      "Write DAX measures with confidence",
      "Design dashboards executives actually use",
      "Publish and govern reports in the Power BI Service",
    ],
    featured: true,
  },
  {
    slug: "generative-ai",
    title: "Generative AI",
    subtitle:
      "Build practical AI solutions — prompting, retrieval-augmented generation, agents and safe deployment.",
    category: "Artificial Intelligence",
    level: "Intermediate",
    durationHours: 35,
    price: 950,
    currency: "USD",
    outcomes: [
      "Design prompts that hold up in production",
      "Build a RAG pipeline over your own documents",
      "Integrate LLM APIs into real applications",
      "Evaluate output quality, cost and risk",
    ],
    featured: true,
  },
  {
    slug: "pmp",
    title: "PMP Certification Prep",
    subtitle:
      "The full 35 contact hours required for PMI eligibility, plus exam strategy and mock exams.",
    category: "Project Management",
    level: "Advanced",
    durationHours: 35,
    price: 1200,
    currency: "USD",
    certification: "PMI PMP",
    outcomes: [
      "Cover all three PMP exam domains in depth",
      "Earn the 35 contact hours PMI requires",
      "Practise with full-length mock exams",
      "Master predictive, agile and hybrid approaches",
    ],
    featured: true,
  },
  {
    slug: "scrum-master",
    title: "Professional Scrum Master",
    subtitle:
      "Master the Scrum framework and the facilitation skills that make teams actually deliver.",
    category: "Agile",
    level: "Beginner",
    durationHours: 16,
    price: 700,
    currency: "USD",
    certification: "PSM I",
    outcomes: [
      "Apply the Scrum framework end to end",
      "Facilitate the five Scrum events effectively",
      "Coach teams through real-world impediments",
      "Prepare for the PSM I assessment",
    ],
    featured: true,
  },
];

export const featuredCourses = courses.filter((course) => course.featured);

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function formatPrice(course: Pick<Course, "price" | "currency">) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: course.currency,
    maximumFractionDigits: 0,
  }).format(course.price);
}
