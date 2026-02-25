import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

  const olympiad = await prisma.olympiad.findUnique({
    where: { id: params.id }
  });
  const event = !olympiad
    ? await prisma.event.findUnique({
        where: { id: params.id }
      })
    : null;

  if (olympiad && olympiad.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Olympiad not found" }, { status: 404 });
  }
  if (!olympiad && (!event || event.status !== "PUBLISHED")) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const activeProfileId = parsed.data.studentProfileId ?? session!.user!.activeStudentProfileId ?? null;
  if (activeProfileId) {
    const profile = await prisma.studentProfile.findFirst({
      where: {
        id: activeProfileId,
        OR: [{ guardianId: session!.user!.id }, { userId: session!.user!.id }]
      }
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
  }

  const existing = await prisma.registration.findFirst({
    where: {
      ...(olympiad ? { olympiadId: olympiad.id } : { eventId: event!.id }),
      userId: session!.user!.id,
      status: { notIn: ["CANCELLED", "REJECTED"] }
    }
  });

  if (existing) {
    return NextResponse.json({ data: existing });
  }

  const registration = await prisma.registration.create({
    data: {
      ...(olympiad ? { olympiadId: olympiad.id } : { eventId: event!.id }),
      userId: session!.user!.id,
      studentProfileId: activeProfileId,
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
      body: `You are registered for ${(olympiad?.type ?? event!.type).toLowerCase()}.`,
      data: {
        registrationId: registration.id,
        ...(olympiad ? { olympiadId: olympiad.id } : { eventId: event!.id })
      }
    }
  });

  return NextResponse.json({ data: registration }, { status: 201 });
}
