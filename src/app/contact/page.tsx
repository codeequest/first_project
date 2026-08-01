import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="Contact"
      title="Contact form coming shortly"
      description="A validated contact form with spam protection, routed to the admin inbox and to email. Scheduled right after the catalog."
    />
  );
}
