import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const notification = await prisma.notification.findUnique({
    where: { id: params.id }
  });

  if (!notification || notification.userId !== session!.user!.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { readAt: new Date() }
  });

  return NextResponse.json({ data: updated });
}
