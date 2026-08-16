import { site } from "@/lib/site";
import type { MailMessage } from "@/lib/mail";

/**
 * The two enrollment-lifecycle emails (request received, request approved).
 * Not wired into src/lib/actions/enrollment.ts yet — that's Track B/F's call
 * on when to send, retry-on-failure behaviour, etc. These just build the
 * message; sendMail() from "@/lib/mail" delivers it.
 */

type EnrollmentReceivedInput = {
  to: string;
  studentName?: string | null;
  courseTitle: string;
};

export function enrollmentReceivedEmail({
  to,
  studentName,
  courseTitle,
}: EnrollmentReceivedInput): MailMessage {
  const greeting = studentName ? `Hi ${studentName},` : "Hi,";
  const subject = `We've received your request for ${courseTitle}`;

  const text = `${greeting}

We've received your enrollment request for "${courseTitle}" and it's now waiting for review. We'll email you again as soon as it's been processed.

— ${site.name}`;

  const html = wrapEmailHtml(`
    <p>${escapeHtml(greeting)}</p>
    <p>We've received your enrollment request for <strong>${escapeHtml(courseTitle)}</strong> and it's now waiting for review by our team. We'll email you again as soon as it's been processed.</p>
  `);

  return { to, subject, html, text };
}

type EnrollmentConfirmedInput = {
  to: string;
  studentName?: string | null;
  courseTitle: string;
  reviewNote?: string | null;
};

export function enrollmentConfirmedEmail({
  to,
  studentName,
  courseTitle,
  reviewNote,
}: EnrollmentConfirmedInput): MailMessage {
  const greeting = studentName ? `Hi ${studentName},` : "Hi,";
  const subject = `Subscription confirmed: ${courseTitle}`;

  const text = `${greeting}

Good news — your enrollment request for "${courseTitle}" has been confirmed. You now have access to the course.${
    reviewNote ? `\n\nNote from our team: ${reviewNote}` : ""
  }

— ${site.name}`;

  const html = wrapEmailHtml(`
    <p>${escapeHtml(greeting)}</p>
    <p>Good news — your enrollment request for <strong>${escapeHtml(courseTitle)}</strong> has been confirmed. You now have access to the course.</p>
    ${reviewNote ? `<p><em>Note from our team: ${escapeHtml(reviewNote)}</em></p>` : ""}
  `);

  return { to, subject, html, text };
}

/**
 * Hex colours here mirror the brand tokens in src/app/globals.css
 * (--color-brand-600 / --color-ink) rather than reusing them: email clients
 * don't support CSS custom properties, so inline hex is the only option.
 * Keep these in sync by hand if the design owner repaints the palette.
 */
function wrapEmailHtml(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#0b1220;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px 0;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1d42e2;">${escapeHtml(site.name)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 28px;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
