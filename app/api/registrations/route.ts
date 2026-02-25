import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { localeMap } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const eventId = params.get("eventId");
  const olympiadId = params.get("olympiadId");
  const status = params.get("status");
  const paymentStatus = params.get("paymentStatus");
  const from = params.get("from");
  const to = params.get("to");
  const scope = params.get("scope");
  const locale = params.get("locale");

  const where: Record<string, unknown> = {};
  if (eventId) {
    where.eventId = eventId;
  }
  if (olympiadId) {
    where.olympiadId = olympiadId;
  }
  if (status) {
    where.status = status.toUpperCase();
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus.toUpperCase();
  }
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }

  if (scope === "organizer") {
    if (!session!.permissions.has("registrations.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const organizer = await prisma.organizer.findFirst({
      where: { ownerUserId: session!.user!.id },
      select: { id: true }
    });
    if (organizer) {
      where.olympiad = { organizerId: organizer.id };
    } else {
      return NextResponse.json({ data: [] });
    }
  }

  if (scope === "me") {
    where.userId = session!.user!.id;
  }

  if (!scope && !session!.permissions.has("registrations.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const registrations = await prisma.registration.findMany({
    where,
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
      payments: true,
      result: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: registrations });
}
