import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { localeMap } from "@/lib/mappers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const locale = request.nextUrl.searchParams.get("locale");
  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    include: {
      event: {
        include: {
          translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true
        }
      },
      olympiad: {
        include: {
          translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
          organizer: { include: { organization: true } }
        }
      },
      studentProfile: true,
      payments: true
    }
  });

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canView =
    registration.userId === session!.user!.id || session!.permissions.has("registrations.view");
  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: registration });
}

const updateSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "registrations.edit_status");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.registration.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status ? parsed.data.status.toUpperCase() : undefined,
      paymentStatus: parsed.data.paymentStatus ? parsed.data.paymentStatus.toUpperCase() : undefined
    }
  });

  await prisma.notification.create({
    data: {
      userId: updated.userId ?? session!.user!.id,
      type: "registration_status_changed",
      title: "Registration updated",
      body: `Status updated to ${updated.status.toLowerCase()}.`,
      data: {
        registrationId: updated.id
      }
    }
  });

  return NextResponse.json({ data: updated });
}
