"use client";

import { useActionState } from "react";
import {
  FormError,
  FormField,
  FormTextarea,
  SubmitButton,
} from "@/components/form-field";
import {
  submitContactAction,
  type ContactFormState,
} from "@/lib/actions/contact";

const initialState: ContactFormState = {};

export function ContactForm({
  courseSlug,
  courseTitle,
}: {
  courseSlug?: string;
  courseTitle?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-lg font-semibold text-ink">Message sent.</p>
        <p className="text-sm text-muted">
          Thanks for reaching out — we usually reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError>{state.error}</FormError>

      {courseTitle ? (
        <input type="hidden" name="courseSlug" value={courseSlug ?? ""} />
      ) : null}

      {/* Honeypot — hidden from real visitors, left blank by them. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {courseTitle ? (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 ring-1 ring-brand-100">
          Asking about <strong>{courseTitle}</strong>
        </p>
      ) : null}

      <FormField
        label="Full name"
        name="name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        errors={state.fieldErrors?.name}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          errors={state.fieldErrors?.email}
        />
        <FormField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={state.values?.phone}
          errors={state.fieldErrors?.phone}
        />
      </div>

      <FormField
        label="Subject (optional)"
        name="subject"
        defaultValue={state.values?.subject}
        errors={state.fieldErrors?.subject}
      />

      <FormTextarea
        label="Message"
        name="message"
        rows={5}
        required
        defaultValue={state.values?.message}
        errors={state.fieldErrors?.message}
      />

      <SubmitButton pending={pending}>Send message</SubmitButton>
    </form>
  );
}
