import type { MetadataRoute } from "next";
import { getPublishedCourseSlugs } from "@/lib/courses";
import { legalNav, site } from "@/lib/site";

/** Regenerated hourly, alongside the course pages it lists. */
export const revalidate = 3600;

/**
 * `metadataBase` is not available to the sitemap — Next.js writes each `url`
 * into `<loc>` verbatim — so every entry has to be absolute. Set
 * NEXT_PUBLIC_SITE_URL or the sitemap will point at localhost.
 */
function url(path: string) {
  return new URL(path, site.url).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: url("/courses"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: url("/contact"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: url("/signup"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...legalNav.map((page) => ({
      url: url(page.href),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];

  try {
    const courses = await getPublishedCourseSlugs();
    courseRoutes = courses.map((course) => ({
      url: url(`/courses/${course.slug}`),
      lastModified: course.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch {
    // A sitemap missing the course pages is far better than a build that
    // fails because the database was unreachable.
  }

  return [...staticRoutes, ...courseRoutes];
}
