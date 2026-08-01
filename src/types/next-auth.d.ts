import type { Role, UserStatus } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Teaches TypeScript about the extra fields we put on the session and token,
 * so `session.user.role` is typed everywhere instead of `any`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: UserStatus;
  }
}

// `next-auth/jwt` only re-exports from `@auth/core/jwt`, so the augmentation
// has to target the module that actually declares the interface.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
  }
}
