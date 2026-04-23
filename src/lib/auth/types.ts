import "next-auth";
import "next-auth/jwt";

/**
 * Extend NextAuth types to include custom fields
 * (role, id) on the session and JWT token.
 */

export type UserRole = "admin" | "exporter" | "buyer" | "farmer";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      name:  string | null;
      email: string;
      image: string | null;
      role:  UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:   string;
    role: UserRole;
  }
}
