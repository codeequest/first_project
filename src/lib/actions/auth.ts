"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { homePathForRole } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /**
   * Non-secret values echoed back so a validation error does not wipe what
   * the user typed. Passwords are deliberately never returned.
   */
  values?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

const BCRYPT_ROUNDS = 12;

/**
 * Where to send someone after they authenticate, when they were interrupted
 * on their way somewhere — e.g. clicking "Request enrollment" while logged
 * out. Never trusted as given: an attacker who can put a URL in front of a
 * user must not be able to bounce them off-site after login.
 *
 * Absolute URLs are accepted only when they point at this same host, because
 * the auth middleware itself produces them ("?callbackUrl=http://host/admin").
 * Anything else falls back to the caller's default.
 */
async function safeCallbackUrl(
  raw: FormDataEntryValue | null,
): Promise<string | null> {
  if (typeof raw !== "string" || raw.length === 0) return null;

  try {
    const url = new URL(raw, "http://callback.invalid");

    if (url.hostname !== "callback.invalid") {
      const hdrs = await headers();
      const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
      if (!host || url.host !== host) return null;
    }

    const path = `${url.pathname}${url.search}`;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    // Bouncing back to an auth page would loop.
    if (path.startsWith("/login") || path.startsWith("/signup")) return null;
    return path;
  } catch {
    return null;
  }
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const submitted = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = signupSchema.safeParse({
    ...submitted,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: submitted,
    };
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    // Deliberately vague: confirming which emails are registered would let
    // anyone enumerate the student list.
    return {
      error:
        "We could not create that account. If you already have one, try logging in.",
      values: submitted,
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: "STUDENT",
      // TODO: switch to PENDING_VERIFICATION once transactional email is
      // wired up, and gate login on a verified address.
      status: "ACTIVE",
      studentProfile: { create: {} },
    },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Your account was created. Please log in to continue.",
      };
    }
    throw error;
  }

  // A new student who came here from "Request enrollment" should land back
  // on that form, not on an empty dashboard.
  redirect(
    (await safeCallbackUrl(formData.get("callbackUrl"))) ?? "/dashboard",
  );
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");

  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { email },
    };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password.", values: { email } };
    }
    throw error;
  }

  // Read the role from the database rather than from auth(): the session
  // cookie was only just set by signIn() and is not readable inside the same
  // request, which would send every user to the student dashboard.
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  redirect(
    (await safeCallbackUrl(formData.get("callbackUrl"))) ??
      homePathForRole(user?.role),
  );
}
