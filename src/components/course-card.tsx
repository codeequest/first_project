import Link from "next/link";
import { formatPrice, type Course } from "@/lib/courses";
import { cn } from "./ui";

const categoryStyles: Record<Course["category"], string> = {
  "BI & Data": "bg-amber-50 text-amber-700 ring-amber-100",
  "Artificial Intelligence": "bg-violet-50 text-violet-700 ring-violet-100",
  "Project Management": "bg-brand-50 text-brand-700 ring-brand-100",
  Agile: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group relative flex h-full flex-col gap-5 rounded-2xl bg-white p-7 ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-950/8 hover:ring-brand-200">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold ring-1",
            categoryStyles[course.category],
          )}
        >
          {course.category}
        </span>
        {course.certification ? (
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-muted ring-1 ring-line">
            {course.certification}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-ink">
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0">
            {course.title}
          </Link>
        </h3>
        <p className="text-[15px] leading-relaxed text-muted">
          {course.subtitle}
        </p>
      </div>

      <ul className="flex flex-col gap-2 text-sm text-muted">
        {course.outcomes.slice(0, 3).map((outcome) => (
          <li key={outcome} className="flex items-start gap-2.5">
            <CheckIcon />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-end justify-between border-t border-line pt-5">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            {course.durationHours} hours · {course.level}
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-ink">
            {formatPrice(course)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-transform duration-300 group-hover:translate-x-1">
          View course
          <ArrowIcon />
        </span>
      </div>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 1 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
