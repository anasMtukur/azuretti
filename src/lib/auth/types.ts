import "next-auth";
import "next-auth/jwt";

/**
 * Extend NextAuth types to include custom fields
 * (role, adminRole, id) on the session and JWT token.
 */

export type UserRole = "admin" | "exporter" | "buyer" | "farmer";

export type AdminRole =
  | "system_admin"
  | "warehouse_manager"
  | "content_manager"
  | "finance_manager";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      name:  string | null;
      email: string;
      image: string | null;
      role:  UserRole;
      adminRole?: AdminRole | null;
    };
  }

  interface User {
    role?: UserRole;
    adminRole?: AdminRole | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:   string;
    role: UserRole;
    adminRole?: AdminRole | null;
  }
}
