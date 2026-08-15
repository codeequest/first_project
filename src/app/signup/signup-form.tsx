"use client";

import { useActionState } from "react";
import { FormError, FormField, SubmitButton } from "@/components/form-field";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function SignupForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError>{state.error}</FormError>

      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="First name"
          name="firstName"
          autoComplete="given-name"
          required
          defaultValue={state.values?.firstName}
          errors={state.fieldErrors?.firstName}
        />
        <FormField
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          required
          defaultValue={state.values?.lastName}
          errors={state.fieldErrors?.lastName}
        />
      </div>

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
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters, with an uppercase letter and a number."
        errors={state.fieldErrors?.password}
      />

      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}
