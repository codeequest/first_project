"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Login/logout/signup run as Server Actions that call Auth.js's server-side
 * signIn/signOut — that changes the session cookie directly, but next-auth's
 * client SessionProvider (mounted once in the root layout, with no `session`
 * prop, so the marketing pages under it can stay statically rendered) has no
 * way to find out: it only refetches on mount, on window focus, or when the
 * *client* signIn/signOut from next-auth/react is called (which broadcasts).
 * A Server Action redirect triggers none of those, so useSession() across
 * the app — the header's login state, the course page's enroll CTA — keeps
 * serving the pre-login/pre-logout value until something else forces a
 * refetch. A hard reload remounts the provider and "fixes" it, which is why
 * the symptom always looked like "works after I refresh."
 *
 * Resyncing on every route change closes that gap without making the root
 * layout depend on cookies()/auth(), which would force every page under it
 * — including the ISR'd marketing pages — to render dynamically.
 */
export function SessionSync() {
  const pathname = usePathname();
  const { update } = useSession();

  useEffect(() => {
    update();
    // Only route changes should trigger a resync; `update` is a stable
    // function identity from next-auth but isn't worth depending on here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
