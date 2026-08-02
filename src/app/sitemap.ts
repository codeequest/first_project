import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { legalNav, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...legalNav.map((item) => ({
      url: `${site.url}${item.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${site.url}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
