import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { Container, Eyebrow } from "@/components/ui";
import { getPage, getPageSlugs } from "@/lib/pages";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Legal" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  if (!page.isPublished) {
    return (
      <ComingSoon
        eyebrow="Legal"
        title={page.title}
        description="This page is still being reviewed by the team before publication. Check back shortly."
      />
    );
  }

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink">
          {page.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Last updated{" "}
          {page.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-10 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">
          {page.body}
        </div>
      </Container>
    </section>
  );
}
