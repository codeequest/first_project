import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

/**
 * Full Auth.js configuration — runs on the Node runtime only (it touches
 * Prisma and bcrypt). Middleware uses the edge-safe `authConfig` instead.
 *
 * The adapter is present so that adding an OAuth provider (Google, Microsoft)
 * later needs no schema work. Credentials sign-in intentionally uses JWT
 * sessions, which is the only strategy Auth.js supports for that provider.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            status: true,
            passwordHash: true,
          },
        });

        // Compare against a dummy hash when the user does not exist, so that
        // a missing account and a wrong password take the same time to answer
        // and cannot be told apart.
        const hash =
          user?.passwordHash ??
          "$2a$12$xxxxxxxxxxxxxxxxxxxxxuGZgLQ5m3vBqvJ8yYy8vJ8yYy8vJ8yY";

        const passwordMatches = await bcrypt.compare(password, hash);

        if (!user || !user.passwordHash || !passwordMatches) return null;
        if (user.status === "SUSPENDED") return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
});
