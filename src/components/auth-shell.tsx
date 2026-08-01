import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./ui";

/** Shared frame for the login and signup pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: { text: string; linkLabel: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
      <Container>
        <div className="mx-auto w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {subtitle}
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-line sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            {footer.text}{" "}
            <Link
              href={footer.href}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {footer.linkLabel}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
