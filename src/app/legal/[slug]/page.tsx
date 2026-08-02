import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { legalNav } from "@/lib/site";

const legalSlugs = legalNav.map((item) => item.href.split("/").pop()!);

export function generateStaticParams() {
  return legalSlugs.map((slug) => ({ slug }));
}

async function getLegalPage(slug: string) {
  if (!legalSlugs.includes(slug)) return null;
  return prisma.page.findUnique({
    where: { slug_locale: { slug, locale: "EN" } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);

  if (!page) return { title: "Legal" };

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: `/legal/${slug}` },
    robots: page.isPublished ? undefined : { index: false, follow: true },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getLegalPage(slug);

  if (!page) notFound();

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-display">
          {page.title}
        </h1>

        {!page.isPublished ? (
          <p className="mt-6 rounded-xl bg-accent-400/15 px-4 py-3 text-sm font-medium text-accent-600 ring-1 ring-accent-400/30">
            This page is a draft awaiting legal review. Content is subject to
            change before launch.
          </p>
        ) : null}

        <div className="mt-8 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
          {page.body}
        </div>
      </Container>
    </section>
  );
}
