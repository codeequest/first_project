import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <ComingSoon
      eyebrow="Account"
      title="Log in"
      description="Authentication for students, instructors and admins is being wired up with Auth.js and PostgreSQL."
    />
  );
}
