"use client";

import { useActionState } from "react";
import {
  reviewEnrollmentAction,
  type ReviewFormState,
} from "@/lib/actions/enrollment";

const initialState: ReviewFormState = {};

/**
 * Approve/reject for one pending request. Both buttons submit the same form —
 * the pressed button carries the decision, so the note the admin typed is
 * attached either way.
 */
export function EnrollmentReview({ enrollmentId }: { enrollmentId: string }) {
  const [state, formAction, pending] = useActionState(
    reviewEnrollmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 ring-1 ring-red-100"
        >
          {state.error}
        </p>
      ) : null}

      <label className="sr-only" htmlFor={`note-${enrollmentId}`}>
        Note for the student (optional)
      </label>
      <textarea
        id={`note-${enrollmentId}`}
        name="reviewNote"
        rows={2}
        placeholder="Note for the student (optional)"
        className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink transition-colors placeholder:text-muted/60 hover:border-brand-300"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="APPROVE"
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : "Approve"}
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECT"
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition duration-200 hover:text-red-700 hover:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
