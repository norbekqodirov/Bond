import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const profile = await prisma.studentProfile.findFirst({
    where: {
      id: params.id,
      OR: [{ guardianId: session!.user!.id }, { userId: session!.user!.id }]
    }
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session!.user!.id },
    data: { activeStudentProfileId: profile.id }
  });

  return NextResponse.json({ ok: true });
}
