"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };
};

/** Reject submissions filled in faster than a human could type them. */
const MIN_FILL_TIME_MS = 2000;

async function hashIp() {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export async function contactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const submitted = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: real visitors never see or fill this field. A filled value
  // means a bot — report success without writing anything.
  if (String(formData.get("company") ?? "").length > 0) {
    return { success: true };
  }

  const openedAt = Number(formData.get("formOpenedAt") ?? 0);
  if (openedAt && Date.now() - openedAt < MIN_FILL_TIME_MS) {
    return { success: true };
  }

  const parsed = contactSchema.safeParse({
    ...submitted,
    courseSlug: String(formData.get("courseSlug") ?? ""),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: submitted,
    };
  }

  const { name, email, phone, subject, message, courseSlug } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      courseSlug: courseSlug || null,
      sourcePage: "/contact",
      ipHash: await hashIp(),
    },
  });

  return { success: true };
}
