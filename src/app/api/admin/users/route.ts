import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

import { getSession } from "@/lib/auth/helpers";
import bcrypt from "bcryptjs";

const db = getDb();

const schema = z.object({
  name:      z.string().min(2),
  email:     z.string().email(),
  role:      z.enum(["admin", "exporter", "buyer", "investor", "farmer"]),
  adminRole: z.enum(["system_admin", "warehouse_manager", "content_manager", "finance_manager"]),
  isActive:  z.boolean(),
  password:  z.string().optional(),
});

export async function POST(
  req: NextRequest
) {
  const session = await getSession();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, role, adminRole, isActive, password } = parsed.data;
  if (password && password.length >= 8) {
    parsed.data.password = await bcrypt.hash(password, 12);
  }

  const [created] = await db.insert(users).values({
        ...parsed.data,
    }).returning({ id: users.id });

  return NextResponse.json({ message: "User created." });
}

/**
 *
 * GET — List users with optional filters.
 *
 * Query params:
 *   role    — filter by role (can be repeated: ?role=exporter&role=farmer)
 *   q       — search by name or email
 *   limit   — max results (default 100)
 *   page    — page number (default 1)
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  // role can be multi-valued: ?role=exporter&role=farmer
  const roles  = searchParams.getAll("role");
  const q      = searchParams.get("q")?.trim() ?? "";
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions: any[] = [];

  if (roles.length > 0) {
    conditions.push(inArray(users.role, roles as any[]));
  }

  if (q) {
    conditions.push(
      or(
        ilike(users.name,  `%${q}%`),
        ilike(users.email, `%${q}%`),
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id:        users.id,
        name:      users.name,
        email:     users.email,
        role:      users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(users).where(where),
  ]);

  return NextResponse.json({ users: rows, total, page, limit });
}