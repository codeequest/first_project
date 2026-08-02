import type { Metadata } from "next";
import { Container, Eyebrow, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} about a course, an enrollment, or a partnership.`,
};

export default function ContactPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <Eyebrow>Contact</Eyebrow>
          <SectionHeading
            align="left"
            title={
              <span className="font-display">Talk to an advisor</span>
            }
            description="Questions about a program, corporate training, or anything else — send us a message and we will get back to you."
          />
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-ink">Email</dt>
              <dd>
                <a
                  href={`mailto:${site.email}`}
                  className="text-brand-600 hover:underline"
                >
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-ink">Phone</dt>
              <dd className="text-muted">{site.phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-ink">Address</dt>
              <dd className="text-muted">{site.address}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-7 ring-1 ring-line sm:p-9">
          <ContactForm formOpenedAt={Date.now()} />
        </div>
      </Container>
    </section>
  );
}
