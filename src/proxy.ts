import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Route protection. (Next.js 16 renamed the `middleware` convention to
 * `proxy`.) Uses the edge-safe config only — the `authorized` callback in
 * src/auth.config.ts decides what is allowed.
 *
 * This is defence in depth, not the only check: every page and server action
 * that reads private data must still verify the session itself, because this
 * does not run for direct server-action invocations.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Everything except Next internals, the auth API and static files.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
