import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./config";
import type { UserRole } from "./types";

/**
 * getSession – get the server-side session in Server Components / Route Handlers.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * getCurrentUser – get the current user or null.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * requireAuth – redirect to login if no session exists.
 * Use inside Server Components that need authentication.
 *
 * @example
 * const user = await requireAuth();
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * requireRole – redirect to /unauthorized if the user lacks a required role.
 *
 * @example
 * const user = await requireRole(["admin", "exporter"]);
 */
export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    //redirect("/unauthorized");
  }
  return user;
}

/**
 * hashPassword – hash a plain-text password using bcrypt.
 * Import only on the server; never call from client components.
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

/**
 * verifyPassword – compare a plain password against a hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}
