"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

export type ContactFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
  values?: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    courseSlug?: string;
  };
};

export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: a real visitor never fills this hidden field. Filling it in
  // means a bot is autofilling every field it can find.
  if (String(formData.get("company") ?? "").length > 0) {
    return { success: true };
  }

  const submitted = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    courseSlug: String(formData.get("courseSlug") ?? ""),
  };

  const parsed = contactSchema.safeParse(submitted);

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
      phone: phone || undefined,
      subject: subject || undefined,
      message,
      courseSlug: courseSlug || undefined,
      sourcePage: courseSlug ? `/courses/${courseSlug}` : "/contact",
    },
  });

  return { success: true };
}
