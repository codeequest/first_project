import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/session";
import { Container } from "./ui";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
};

export function DashboardShell({
  user,
  title,
  description,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: string };
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface-alt py-14 sm:py-20">
      <Container>
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              {roleLabels[user.role] ?? user.role}
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-ink">
                {user.name ?? "Account"}
              </span>
              <span className="text-xs text-muted">{user.email}</span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition-colors hover:text-brand-700 hover:ring-brand-300"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-6 ring-1 ring-line">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span className="font-display text-3xl font-extrabold tracking-tight text-ink">
        {value}
      </span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}
