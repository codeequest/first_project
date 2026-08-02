"use client";

import { useActionState } from "react";
import {
  FormError,
  FormField,
  FormTextarea,
  SubmitButton,
} from "@/components/form-field";
import {
  contactAction,
  type ContactFormState,
} from "@/lib/actions/contact";

const initialState: ContactFormState = {};

export function ContactForm({ formOpenedAt }: { formOpenedAt: number }) {
  const [state, formAction, pending] = useActionState(
    contactAction,
    initialState,
  );

  if (state.success) {
    return (
      <p
        role="status"
        className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100"
      >
        Thanks — your message is in. We usually reply within one business
        day.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError>{state.error}</FormError>

      {/* Honeypot — hidden from real visitors, bots tend to fill every field. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px]"
      />
      <input type="hidden" name="formOpenedAt" value={formOpenedAt} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Name"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          errors={state.fieldErrors?.name}
        />
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={state.values?.phone}
          errors={state.fieldErrors?.phone}
        />
        <FormField
          label="Subject (optional)"
          name="subject"
          defaultValue={state.values?.subject}
          errors={state.fieldErrors?.subject}
        />
      </div>

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
