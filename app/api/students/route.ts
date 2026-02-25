import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { localeMap } from "@/lib/mappers";

const studentSchema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string().datetime().optional().nullable(),
  grade: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  language: z.enum(["uz", "ru", "en"]).optional().nullable(),
  parentPhone: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const profiles = await prisma.studentProfile.findMany({
    where: {
      OR: [{ userId: session!.user!.id }, { guardianId: session!.user!.id }]
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: profiles });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = studentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const profile = await prisma.studentProfile.create({
    data: {
      userId: null,
      guardianId: session!.user!.id,
      fullName: parsed.data.fullName,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      grade: parsed.data.grade ?? null,
      school: parsed.data.school ?? null,
      region: parsed.data.region ?? null,
      language: parsed.data.language ? localeMap[parsed.data.language] : null,
      parentPhone: parsed.data.parentPhone ?? null
    }
  });

  return NextResponse.json({ data: profile }, { status: 201 });
}
