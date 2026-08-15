"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  FormError,
  FormField,
  FormTextarea,
  SubmitButton,
} from "@/components/form-field";
import {
  requestEnrollmentAction,
  type EnrollmentFormState,
} from "@/lib/actions/enrollment";

const initialState: EnrollmentFormState = {};

export function EnrollmentForm({
  courseSlug,
  defaults,
}: {
  courseSlug: string;
  defaults?: {
    contactEmail?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    requestEnrollmentAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100"
        >
          Request sent. An administrator will review it and your dashboard will
          show the course as soon as it is approved.
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Go to my dashboard →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError>{state.error}</FormError>

      <input type="hidden" name="courseSlug" value={courseSlug} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Email"
          name="contactEmail"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          hint="Where we send the decision on your request."
          defaultValue={state.values?.contactEmail ?? defaults?.contactEmail}
          errors={state.fieldErrors?.contactEmail}
        />
        <FormField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={state.values?.phone ?? defaults?.phone}
          errors={state.fieldErrors?.phone}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Company (optional)"
          name="company"
          autoComplete="organization"
          defaultValue={state.values?.company ?? defaults?.company}
          errors={state.fieldErrors?.company}
        />
        <FormField
          label="Job title (optional)"
          name="jobTitle"
          autoComplete="organization-title"
          defaultValue={state.values?.jobTitle ?? defaults?.jobTitle}
          errors={state.fieldErrors?.jobTitle}
        />
      </div>

      <FormTextarea
        label="Why do you want to take this course?"
        name="motivation"
        rows={5}
        required
        hint="What you want to get out of it, and any background that helps us place you."
        defaultValue={state.values?.motivation}
        errors={state.fieldErrors?.motivation}
      />

      <SubmitButton pending={pending}>Send enrollment request</SubmitButton>
    </form>
  );
}
