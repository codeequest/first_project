import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * SMTP is not configured anywhere yet — no host, port or credentials exist
 * in .env. The transport is built lazily (only when sendMail() is actually
 * called) rather than at module load, so importing this file never crashes
 * a server action before Track F wires the real SMTP values in.
 */
const globalForMail = globalThis as unknown as {
  mailTransport: Transporter | undefined;
};

function createTransport(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD in .env.",
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass: password },
  });
}

function getTransport(): Transporter {
  const transport = globalForMail.mailTransport ?? createTransport();
  if (process.env.NODE_ENV !== "production") {
    globalForMail.mailTransport = transport;
  }
  return transport;
}

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendMail(message: MailMessage): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransport().sendMail({ from, ...message });
}
