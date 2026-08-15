"use server";

import { Prisma } from "@prisma/client";
import { refresh, revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  enrollmentRequestSchema,
  enrollmentReviewSchema,
} from "@/lib/validation";

/**
 * Enrollment is request-then-approve. Nothing is paid or unlocked here: a
 * student asks for a place (status PENDING), an admin settles it (ACTIVE or
 * REJECTED). Notifying the student by email is a later step — the approval
 * itself must not depend on mail delivery.
 */

export type EnrollmentFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    contactEmail?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    motivation?: string;
  };
};

/** Statuses that mean "there is already a live request or place". */
const BLOCKING_STATUSES = ["PENDING", "ACTIVE", "COMPLETED"] as const;

const blockedMessages: Record<string, string> = {
  PENDING: "You already have a request waiting for approval on this course.",
  ACTIVE: "You are already enrolled on this course.",
  COMPLETED: "You have already completed this course.",
};

export async function requestEnrollmentAction(
  _prevState: EnrollmentFormState,
  formData: FormData,
): Promise<EnrollmentFormState> {
  const submitted = {
    contactEmail: String(formData.get("contactEmail") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    company: String(formData.get("company") ?? ""),
    jobTitle: String(formData.get("jobTitle") ?? ""),
    motivation: String(formData.get("motivation") ?? ""),
  };

  // The form is only rendered to signed-in students, but a Server Action is a
  // public POST endpoint — re-check rather than trust the rendered UI.
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return {
      error: "Your session has expired. Please log in and try again.",
      values: submitted,
    };
  }

  if (user.role !== "STUDENT") {
    return {
      error: "Only student accounts can request a place on a course.",
      values: submitted,
    };
  }

  const parsed = enrollmentRequestSchema.safeParse({
    ...submitted,
    courseSlug: String(formData.get("courseSlug") ?? ""),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: submitted,
    };
  }

  const { courseSlug, contactEmail, phone, company, jobTitle, motivation } =
    parsed.data;

  // The client names the course; everything else about it is read here.
  const course = await prisma.course.findFirst({
    where: { slug: courseSlug, status: "PUBLISHED" },
    select: { id: true },
  });

  if (!course) {
    return {
      error: "That course is no longer open for enrollment.",
      values: submitted,
    };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { id: true, status: true },
  });

  if (
    existing &&
    BLOCKING_STATUSES.includes(
      existing.status as (typeof BLOCKING_STATUSES)[number],
    )
  ) {
    return {
      error: blockedMessages[existing.status] ?? "You already have a request.",
      values: submitted,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (existing) {
        // A previously rejected or cancelled request becomes a fresh one
        // rather than a second row — [userId, courseId] is unique.
        await tx.enrollment.update({
          where: { id: existing.id },
          data: {
            status: "PENDING",
            contactEmail,
            requestMessage: motivation,
            requestedAt: new Date(),
            reviewNote: null,
            reviewedAt: null,
            reviewedById: null,
          },
        });
      } else {
        await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            status: "PENDING",
            contactEmail,
            requestMessage: motivation,
          },
        });
      }

      if (phone) {
        await tx.user.update({
          where: { id: user.id },
          data: { phone },
        });
      }

      // Keep whatever the student already told us if they left a field blank.
      if (company || jobTitle) {
        await tx.studentProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            company: company || null,
            jobTitle: jobTitle || null,
          },
          update: {
            ...(company ? { company } : {}),
            ...(jobTitle ? { jobTitle } : {}),
          },
        });
      }
    });
  } catch (error) {
    // Two submissions racing each other both pass the check above; the unique
    // constraint settles it and the loser is told the truth.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "You already have a request waiting for approval on this course.",
        values: submitted,
      };
    }
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true };
}

export type ReviewFormState = {
  error?: string;
};

export async function reviewEnrollmentAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  const admin = session?.user;

  if (!admin || admin.role !== "ADMIN") {
    return { error: "You are not allowed to review enrollment requests." };
  }

  const parsed = enrollmentReviewSchema.safeParse({
    enrollmentId: String(formData.get("enrollmentId") ?? ""),
    decision: String(formData.get("decision") ?? ""),
    reviewNote: String(formData.get("reviewNote") ?? ""),
  });

  if (!parsed.success) {
    return { error: "That request could not be reviewed." };
  }

  const { enrollmentId, decision, reviewNote } = parsed.data;
  const approved = decision === "APPROVE";

  // Scoping the update to status PENDING makes a double click — or two admins
  // acting at once — settle the request exactly once.
  const result = await prisma.enrollment.updateMany({
    where: { id: enrollmentId, status: "PENDING" },
    data: {
      status: approved ? "ACTIVE" : "REJECTED",
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
      reviewedById: admin.id,
      ...(approved ? { startedAt: new Date() } : {}),
    },
  });

  if (result.count === 0) {
    return { error: "That request has already been reviewed." };
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: approved ? "enrollment.approve" : "enrollment.reject",
      entity: "Enrollment",
      entityId: enrollmentId,
      metadata: reviewNote ? { reviewNote } : undefined,
    },
  });

  // TODO: notify the student by email once mail delivery is wired up. The
  // recipient is Enrollment.contactEmail (fall back to User.email for rows
  // created before that field existed). Send it AFTER this point so a mail
  // failure can never roll back a decision the admin already made.

  revalidatePath("/dashboard");
  refresh();

  return {};
}
