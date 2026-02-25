import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

const registrationSchema = z.object({
  participantName: z.string().min(2),
  phone: z.string().min(7),
  studentProfileId: z.string().optional().nullable(),
  formData: z.record(z.any()).optional().nullable()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id }
  });
  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      userId: session!.user!.id,
      studentProfileId: parsed.data.studentProfileId ?? null,
      participantName: parsed.data.participantName,
      phone: parsed.data.phone,
      status: "REGISTERED",
      paymentStatus: "UNPAID",
      formData: parsed.data.formData ?? undefined
    }
  });

  await prisma.notification.create({
    data: {
      userId: session!.user!.id,
      type: "registration_confirmed",
      title: "Registration created",
      body: `You are registered for ${event.type.toLowerCase()}.`,
      data: {
        registrationId: registration.id,
        eventId: event.id
      }
    }
  });

  return NextResponse.json({ data: registration }, { status: 201 });
}
