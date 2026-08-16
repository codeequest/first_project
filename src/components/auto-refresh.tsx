"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * revalidatePath()/refresh() in a Server Action only re-render for the
 * client that ran the action — an admin watching /admin has no way to know
 * a student submitted a request on a different device, and vice versa.
 * There's no push channel (WebSocket/SSE) in this app, so polling is the
 * cheap way to close that gap: every tick, re-run the current route's
 * Server Components and pick up whatever changed elsewhere.
 */
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
