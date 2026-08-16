"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const appShellPrefixes = ["/admin", "/dashboard", "/instructor"];

/**
 * The full marketing footer (nav columns, "Get started" links, course list)
 * was rendering under the admin queue and student dashboard too — someone
 * who just approved an enrollment scrolls straight into "Get started" CTAs
 * aimed at anonymous visitors. Those routes get their own chrome from
 * DashboardShell already; they don't need the public site's footer as well.
 */
export function PublicFooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (appShellPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return <>{children}</>;
}
