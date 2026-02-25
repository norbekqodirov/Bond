import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getApiSession, requireApiSession } from "@/lib/api-session";
import { eventStatusMap, eventTypeMap, localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";
import { createEvent } from "@/lib/repositories/events";

export async function GET(request: NextRequest) {
  const session = await getApiSession(request);

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const organizerOrgId = searchParams.get("organizerOrgId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const locale = searchParams.get("locale");

  const where: Record<string, unknown> = {};
  if (type && eventTypeMap[type]) {
    where.type = eventTypeMap[type];
  }
  if (status && eventStatusMap[status]) {
    where.status = eventStatusMap[status];
  }
  if (organizerOrgId) {
    where.organizerOrgId = organizerOrgId;
  }
  if (from || to) {
    where.startDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }

  if (!session) {
    where.status = "PUBLISHED";
  } else if (!session.permissions.has("events.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizerOrg: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: events });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "events.create");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  if (payload && typeof payload === "object") {
    const orgValue = (payload as Record<string, unknown>).organizerOrgId;
    if (!orgValue) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: session!.user!.id },
        orderBy: { createdAt: "asc" }
      });
      if (member) {
        (payload as Record<string, unknown>).organizerOrgId = member.orgId;
      }
    }
  }
  let event;
  try {
    event = await createEvent(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await logAudit({
    userId: session!.user!.id,
    action: "event.create",
    entityType: "Event",
    entityId: event.id
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
