import Link from "next/link";
import { courses } from "@/lib/courses";
import { legalNav, mainNav, site } from "@/lib/site";
import { Logo } from "./logo";
import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-950 text-white/70">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Logo tone="light" />
            <p className="max-w-xs text-sm leading-relaxed">
              {site.description}
            </p>
          </div>

          <FooterColumn title="Navigation">
            {mainNav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Courses">
            {courses.map((course) => (
              <FooterLink key={course.slug} href={`/courses/${course.slug}`}>
                {course.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal">
            {legalNav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-white"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="transition-colors hover:text-white"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
