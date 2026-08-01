import type { ComponentProps } from "react";
import { cn } from "./ui";

export function FormField({
  label,
  name,
  errors,
  hint,
  className,
  ...props
}: ComponentProps<"input"> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const hasError = Boolean(errors?.length);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={
          hasError ? errorId : hint ? hintId : undefined
        }
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-2.5 text-[15px] text-ink transition-colors placeholder:text-muted/60",
          hasError
            ? "border-red-400 focus-visible:outline-red-500"
            : "border-line hover:border-brand-300",
        )}
        {...props}
      />
      {hint && !hasError ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
    >
      {children}
    </p>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
