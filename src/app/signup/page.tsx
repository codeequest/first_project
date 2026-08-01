import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <ComingSoon
      eyebrow="Account"
      title="Create your account"
      description="Student registration with email verification is next in the build queue, alongside the login flow."
    />
  );
}
