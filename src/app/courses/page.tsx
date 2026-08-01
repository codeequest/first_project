import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <ComingSoon
      eyebrow="Catalog"
      title="The full course catalog is on its way"
      description="Filterable catalog with syllabus, duration, pricing and enrollment requests for every program. Next up after the home page."
    />
  );
}
