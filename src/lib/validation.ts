import { z } from "zod";

/**
 * Shared input schemas. Every one of these is validated on the SERVER —
 * client-side validation is only there to give faster feedback.
 */

const password = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(200, "Password is too long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().min(1, "Last name is required").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address")
      .max(255),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(4000),
  courseSlug: z.string().trim().max(80).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * A student asking for a place on a course. Identity is NOT in this schema —
 * the server reads it from the session, so a caller cannot enroll someone
 * else by posting a different user id.
 */
export const enrollmentRequestSchema = z.object({
  courseSlug: z.string().trim().min(1, "Course is required").max(80),
  /// Where approval and rejection notices are sent for this request.
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  motivation: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(2000),
});

export type EnrollmentRequestInput = z.infer<typeof enrollmentRequestSchema>;

/** An admin settling a pending request. */
export const enrollmentReviewSchema = z.object({
  enrollmentId: z.string().trim().min(1, "Enrollment is required").max(40),
  decision: z.enum(["APPROVE", "REJECT"]),
  reviewNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type EnrollmentReviewInput = z.infer<typeof enrollmentReviewSchema>;
