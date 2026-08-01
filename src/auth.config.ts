import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * The middleware runs on the edge runtime, where Prisma and bcrypt cannot go.
 * This file therefore contains NO database access and NO providers — only
 * routing rules and the callbacks needed to read the JWT. The full config
 * lives in src/auth.ts.
 */

/** Prefixes only an authenticated user may open. */
const protectedPrefixes = ["/dashboard", "/instructor", "/admin"] as const;

/** Prefixes restricted to a specific role. */
const roleRestrictedPrefixes = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/instructor", roles: ["INSTRUCTOR", "ADMIN"] },
] as const;

/** Pages a signed-in user should be bounced away from. */
const guestOnlyPaths = ["/login", "/signup"] as const;

export function homePathForRole(role: string | undefined) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    default:
      return "/dashboard";
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    /**
     * Runs on every request matched by the middleware. Returning false
     * redirects to the sign-in page.
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user;

      if (user && guestOnlyPaths.some((path) => pathname.startsWith(path))) {
        return Response.redirect(
          new URL(homePathForRole(user.role), request.nextUrl),
        );
      }

      const needsAuth = protectedPrefixes.some((prefix) =>
        pathname.startsWith(prefix),
      );

      if (!needsAuth) return true;
      if (!user) return false;

      const rule = roleRestrictedPrefixes.find((entry) =>
        pathname.startsWith(entry.prefix),
      );

      if (rule && !rule.roles.includes(user.role as never)) {
        // Signed in but wrong role — send them to their own area rather than
        // to the login page, which would look like a broken session.
        return Response.redirect(
          new URL(homePathForRole(user.role), request.nextUrl),
        );
      }

      return true;
    },

    /** Copy our custom fields from the database user onto the token. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },

    /** Expose those fields to `auth()` and `useSession()`. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
  providers: [], // added in src/auth.ts
} satisfies NextAuthConfig;
