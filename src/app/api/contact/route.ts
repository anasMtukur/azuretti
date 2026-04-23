import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";

const schema = z.object({
  name:    z.string().min(2),
  company: z.string().optional(),
  country: z.string().min(1),
  email:   z.string().email(),
  phone:   z.string().optional(),
  role:    z.enum(["exporter", "buyer", "investor", "other"]),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await db.insert(contactSubmissions).values({
      name:    parsed.data.name,
      company: parsed.data.company ?? null,
      country: parsed.data.country,
      email:   parsed.data.email,
      phone:   parsed.data.phone ?? null,
      role:    parsed.data.role,
      message: parsed.data.message,
    });

    return NextResponse.json({ message: "Submission received." }, { status: 201 });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
