import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "events.publish");
  if (response) {
    return response;
  }

  const event = await prisma.event.update({
    where: { id: params.id },
    data: { status: "PUBLISHED" }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "event.publish",
    entityType: "Event",
    entityId: event.id
  });

  return NextResponse.json({ data: event });
}
