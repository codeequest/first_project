import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds the database with the four launch courses, their categories, and a
 * first admin account.
 *
 * Safe to run repeatedly — every write is an upsert keyed on a slug or email.
 *
 *   npm run db:seed
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  { slug: "bi-data", name: "BI & Data", nameFr: "BI & Données", order: 1 },
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    nameFr: "Intelligence artificielle",
    order: 2,
  },
  {
    slug: "project-management",
    name: "Project Management",
    nameFr: "Gestion de projet",
    order: 3,
  },
  { slug: "agile", name: "Agile", nameFr: "Agile", order: 4 },
];

const courses = [
  {
    slug: "power-bi",
    title: "Power BI",
    subtitle:
      "Turn raw data into decision-ready dashboards, from data modeling to DAX and publishing.",
    categorySlug: "bi-data",
    level: "BEGINNER",
    deliveryMode: "SELF_PACED",
    durationHours: 40,
    price: 850,
    certificationTarget: "Microsoft PL-300",
    learningOutcomes: [
      "Model and clean data with Power Query",
      "Write DAX measures with confidence",
      "Design dashboards executives actually use",
      "Publish and govern reports in the Power BI Service",
    ],
  },
  {
    slug: "generative-ai",
    title: "Generative AI",
    subtitle:
      "Build practical AI solutions — prompting, retrieval-augmented generation, agents and safe deployment.",
    categorySlug: "artificial-intelligence",
    level: "INTERMEDIATE",
    deliveryMode: "SELF_PACED",
    durationHours: 35,
    price: 950,
    certificationTarget: null,
    learningOutcomes: [
      "Design prompts that hold up in production",
      "Build a RAG pipeline over your own documents",
      "Integrate LLM APIs into real applications",
      "Evaluate output quality, cost and risk",
    ],
  },
  {
    slug: "pmp",
    title: "PMP Certification Prep",
    subtitle:
      "The full 35 contact hours required for PMI eligibility, plus exam strategy and mock exams.",
    categorySlug: "project-management",
    level: "ADVANCED",
    deliveryMode: "LIVE_ONLINE",
    durationHours: 35,
    contactHours: 35,
    price: 1200,
    certificationTarget: "PMI PMP",
    learningOutcomes: [
      "Cover all three PMP exam domains in depth",
      "Earn the 35 contact hours PMI requires",
      "Practise with full-length mock exams",
      "Master predictive, agile and hybrid approaches",
    ],
  },
  {
    slug: "scrum-master",
    title: "Professional Scrum Master",
    subtitle:
      "Master the Scrum framework and the facilitation skills that make teams actually deliver.",
    categorySlug: "agile",
    level: "BEGINNER",
    deliveryMode: "LIVE_ONLINE",
    durationHours: 16,
    price: 700,
    certificationTarget: "PSM I",
    learningOutcomes: [
      "Apply the Scrum framework end to end",
      "Facilitate the five Scrum events effectively",
      "Coach teams through real-world impediments",
      "Prepare for the PSM I assessment",
    ],
  },
] as const;

const legalPages = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: "Replace this placeholder with the reviewed privacy policy before launch.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    body: "Replace this placeholder with the reviewed terms of service before launch.",
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    body: "Replace this placeholder with the reviewed cookie policy before launch.",
  },
];

async function main() {
  console.log("Seeding categories…");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("Seeding courses…");
  for (const course of courses) {
    const { categorySlug, ...data } = course;
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    const payload = {
      ...data,
      learningOutcomes: [...data.learningOutcomes],
      categoryId: category?.id,
      status: "PUBLISHED" as const,
      isFeatured: true,
      publishedAt: new Date(),
    };

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: payload,
      create: payload,
    });
  }

  console.log("Seeding legal pages…");
  for (const page of legalPages) {
    await prisma.page.upsert({
      where: { slug_locale: { slug: page.slug, locale: "EN" } },
      update: {},
      create: { ...page, locale: "EN", isPublished: false },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`Seeding admin account (${adminEmail})…`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { role: "ADMIN", status: "ACTIVE" },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        firstName: "Site",
        lastName: "Administrator",
        name: "Site Administrator",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
  } else {
    console.log(
      "Skipping admin account — set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.",
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
