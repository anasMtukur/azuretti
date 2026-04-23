import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";
import bcrypt from "bcryptjs";

const schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  role:     z.enum(["admin", "exporter", "buyer", "investor", "farmer"]),
  isActive: z.boolean(),
  password: z.string().optional(),
});

export async function PATCH(
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

  const { name, email, role, isActive, password } = parsed.data;

  const newData: Record<string, unknown> = {
    name, email: email.toLowerCase().trim(), role, isActive,
  };

  if (password && password.length >= 8) {
    newData.password = await bcrypt.hash(password, 12);
  }

  const [created] = await db.insert(users).values({
        ...parsed.data,
    }).returning({ id: users.id });

  return NextResponse.json({ message: "User created." });
}