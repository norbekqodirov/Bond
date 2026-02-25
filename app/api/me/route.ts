import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { localeMap } from "@/lib/mappers";

const updateSchema = z.object({
  preferredLanguage: z.enum(["uz", "ru", "en"]).optional().nullable(),
  activeStudentProfileId: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      roles: {
        include: {
          role: true
        }
      },
      activeStudentProfile: true
    }
  });

  return NextResponse.json({
    data: {
      id: user!.id,
      phone: user!.phone,
      email: user!.email,
      firstName: user!.firstName,
      lastName: user!.lastName,
      preferredLanguage: user!.preferredLanguage,
      activeStudentProfileId: user!.activeStudentProfileId,
      roles: user!.roles.map((item) => item.role.name)
    }
  });
}

export async function PUT(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { preferredLanguage, activeStudentProfileId } = parsed.data;

  if (activeStudentProfileId) {
    const profile = await prisma.studentProfile.findFirst({
      where: {
        id: activeStudentProfileId,
        OR: [{ guardianId: session!.user!.id }, { userId: session!.user!.id }]
      }
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session!.user!.id },
    data: {
      preferredLanguage: preferredLanguage ? localeMap[preferredLanguage] : undefined,
      activeStudentProfileId: activeStudentProfileId ?? undefined
    }
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      preferredLanguage: updated.preferredLanguage,
      activeStudentProfileId: updated.activeStudentProfileId
    }
  });
}
