import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

import type { UserRole } from "./types";

const db = getDb();
/**
 * NextAuth Configuration
 * ============================================================
 * Authentication strategy:
 *   - Email + password (CredentialsProvider with bcrypt)
 *   - JWT session strategy (stateless, scales well)
 *   - Role is stored in the JWT and passed to the session
 *
 * To add OAuth providers (Google, GitHub, etc.), add them
 * to the providers array below.
 * ============================================================
 */
export const authOptions: NextAuthOptions = {
  // Drizzle adapter manages user/account/session tables
  adapter: DrizzleAdapter(db) as NextAuthOptions["adapter"],

  // JWT sessions – no session table needed for credentials auth
  session: { strategy: "jwt" },

  // Custom auth pages
  pages: {
    signIn:  "/auth/login",
    signOut: "/auth/logout",
    error:   "/auth/error",
    newUser: "/auth/register",
  },

  providers: [
    CredentialsProvider({
      id:   "credentials",
      name: "Email & Password",

      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Look up user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase().trim()))
          .limit(1);

        if (!user) {
          throw new Error("No account found with that email address.");
        }

        if (!user.password) {
          throw new Error(
            "This account uses a social login. Please sign in with the original provider."
          );
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * jwt – called when the JWT is created or updated.
     * Persist role (and any extra fields) into the token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: UserRole }).role ?? "buyer";
      }
      return token;
    },

    /**
     * session – called whenever a session is checked.
     * Expose token data to the client via useSession().
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },

  events: {
    /**
     * signIn – update updatedAt on every successful sign-in.
     */
    async signIn({ user }) {
      if (user.id) {
        await db
          .update(users)
          .set({ updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
