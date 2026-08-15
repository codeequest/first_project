/**
 * Central site configuration.
 *
 * PLACEHOLDER VALUES — replace the name, contact details and social links with
 * the real ones. Everything user-facing reads from here so there is a single
 * place to edit.
 */
/**
 * Absolute base URL, used for canonical links, the sitemap and OpenGraph tags.
 * Set NEXT_PUBLIC_SITE_URL per environment — a wrong value here silently
 * points every canonical tag at the wrong host.
 */
const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const site = {
  name: "Nexa Academy",
  tagline: "IT & Project Management Training",
  description:
    "Professional certification training in Power BI, Generative AI, PMP and Scrum Master — taught by certified practitioners.",
  url,
  email: "contact@example.com",
  phone: "+000 00 000 000",
  address: "Address line, City, Country",
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/#why-us" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookies" },
] as const;
