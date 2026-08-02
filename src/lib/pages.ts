import { prisma } from "@/lib/prisma";

/**
 * Legal / CMS pages (privacy, terms, cookies), editable by an admin without a
 * deploy. See the `Page` model in prisma/schema.prisma.
 */
export async function getPage(slug: string) {
  return prisma.page.findUnique({
    where: { slug_locale: { slug, locale: "EN" } },
  });
}

export async function getPageSlugs() {
  const rows = await prisma.page.findMany({
    where: { locale: "EN" },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}
