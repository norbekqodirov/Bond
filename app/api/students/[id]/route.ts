import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { localeMap } from "@/lib/mappers";

const studentUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  grade: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  language: z.enum(["uz", "ru", "en"]).optional().nullable(),
  parentPhone: z.string().optional().nullable()
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = studentUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.studentProfile.findFirst({
    where: {
      id: params.id,
      OR: [{ userId: session!.user!.id }, { guardianId: session!.user!.id }]
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await prisma.studentProfile.update({
    where: { id: params.id },
    data: {
      fullName: parsed.data.fullName ?? undefined,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
      grade: parsed.data.grade ?? undefined,
      school: parsed.data.school ?? undefined,
      region: parsed.data.region ?? undefined,
      language: parsed.data.language ? localeMap[parsed.data.language] : undefined,
      parentPhone: parsed.data.parentPhone ?? undefined
    }
  });

  return NextResponse.json({ data: profile });
}
