"use client";

import { useActionState, useState } from "react";
import { useToast } from "@/components/toast";
import {
  reviewEnrollmentAction,
  type ReviewFormState,
} from "@/lib/actions/enrollment";

const initialState: ReviewFormState = {};

/**
 * Approve/reject for one pending request. Both buttons submit the same form —
 * the pressed button carries the decision, so the note the admin typed is
 * attached either way.
 *
 * Reject needs a confirm step and both decisions need visible feedback: this
 * unlocks or turns away a paying student, and the old version submitted
 * instantly on click with the only sign of success being the row quietly
 * vanishing from the list on the next server render. The toast fires
 * optimistically on click (in the same synchronous handler as the submit)
 * rather than waiting on the action to resolve, because a successful
 * approve/reject removes this row from the list in the very same render
 * that would otherwise carry a "done" state — there's no later moment to
 * show it from inside a component that's already gone.
 */
export function EnrollmentReview({
  enrollmentId,
  studentName,
  courseTitle,
}: {
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
}) {
  const [state, formAction, pending] = useActionState(
    reviewEnrollmentAction,
    initialState,
  );
  const [confirmingReject, setConfirmingReject] = useState(false);
  const toast = useToast();

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
        {confirmingReject ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmingReject(false)}
              disabled={pending}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition duration-200 hover:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              name="decision"
              value="REJECT"
              disabled={pending}
              onClick={() =>
                toast.show({
                  message: `Request from ${studentName} rejected.`,
                })
              }
              className="inline-flex flex-1 items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Working…" : "Confirm reject"}
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              name="decision"
              value="APPROVE"
              disabled={pending}
              onClick={() =>
                toast.show({
                  tone: "success",
                  message: `Approved — ${studentName} can now access ${courseTitle}.`,
                })
              }
              className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Working…" : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReject(true)}
              disabled={pending}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition duration-200 hover:text-red-700 hover:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </form>
  );
}
