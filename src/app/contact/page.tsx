import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { getCourseTitleBySlug } from "@/lib/course-catalog";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${site.name} team about a course, an enrollment or anything else.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course: courseSlug } = await searchParams;
  const courseTitle = courseSlug
    ? await getCourseTitleBySlug(courseSlug)
    : undefined;

  return (
    <AuthShell
      title="Talk to the team"
      subtitle={
        courseTitle
          ? `Questions about ${courseTitle}? Send us a message and we'll get back to you shortly.`
          : "Questions about a program, pricing or enrollment? Send us a message and we'll get back to you shortly."
      }
      footer={{
        text: "Prefer to browse first?",
        linkLabel: "See the course catalog",
        href: "/courses",
      }}
    >
      <ContactForm
        courseSlug={courseTitle ? courseSlug : undefined}
        courseTitle={courseTitle}
      />
    </AuthShell>
  );
}
