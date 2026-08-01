import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";

/**
 * Placeholder legal pages. These will later be driven by a `Page` table in the
 * database so the admin can edit them without a deploy.
 */
const legalPages = {
  privacy: {
    title: "Privacy Policy",
    description:
      "How we collect, store and process personal data, and the rights you have over it.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "The terms governing enrollment, course access, cancellations and use of the platform.",
  },
  cookies: {
    title: "Cookie Policy",
    description:
      "Which cookies we use, what they do, and how you can control them.",
  },
} as const;

type LegalSlug = keyof typeof legalPages;

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug as LegalSlug];
  return { title: page?.title ?? "Legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages[slug as LegalSlug];

  if (!page) notFound();

  return (
    <ComingSoon
      eyebrow="Legal"
      title={page.title}
      description={`${page.description} The final text needs to be supplied or reviewed by the client before publication.`}
    />
  );
}
