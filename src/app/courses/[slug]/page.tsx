import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { courses, getCourse } from "@/lib/courses";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course?.title ?? "Course",
    description: course?.subtitle,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);

  if (!course) notFound();

  return (
    <ComingSoon
      eyebrow={course.category}
      title={course.title}
      description={`${course.subtitle} — the full detail page with syllabus, instructor profile and the enrollment request flow is in progress.`}
    />
  );
}
