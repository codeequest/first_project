import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up for free, then request a place on any program in the catalog."
      footer={{
        text: "Already have an account?",
        linkLabel: "Log in",
        href: "/login",
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
