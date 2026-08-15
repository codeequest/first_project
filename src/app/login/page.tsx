import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  // Carry the destination across to sign-up too, otherwise someone who came
  // here for a course and then creates an account loses their way back.
  const signupHref = callbackUrl
    ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/signup";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to reach your courses, materials and certificates."
      footer={{
        text: "Don't have an account?",
        linkLabel: "Create one",
        href: signupHref,
      }}
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
