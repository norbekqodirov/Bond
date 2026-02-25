import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const registration = await prisma.registration.findUnique({
    where: { id: params.id }
  });

  if (!registration || registration.userId !== session!.user!.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.registration.update({
    where: { id: params.id },
    data: { status: "CANCELLED" }
  });

  await prisma.notification.create({
    data: {
      userId: session!.user!.id,
      type: "registration_cancelled",
      title: "Registration cancelled",
      body: `Registration ${registration.id} was cancelled.`,
      data: { registrationId: registration.id }
    }
  });

  return NextResponse.json({ data: updated });
}
