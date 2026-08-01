import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathForRole } from "@/auth.config";

/**
 * Server-side guards. Middleware already blocks these routes, but every page
 * that reads private data must check again — middleware does not run for
 * direct server-action calls, and "the client sent the right URL" is not
 * authorization.
 */

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homePathForRole(user.role));
  return user;
}
