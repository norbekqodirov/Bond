import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getApiSession, requireApiSession } from "@/lib/api-session";
import { eventUpdateSchema } from "@/lib/validators/event";
import { eventStatusMap, eventTypeMap, localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getApiSession(request);
  const locale = request.nextUrl.searchParams.get("locale");

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizerOrg: true
    }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!session) {
    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: event });
  }

  if (!session.permissions.has("events.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: event });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "events.edit");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = eventUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      type: data.type ? eventTypeMap[data.type] : undefined,
      status: data.status ? eventStatusMap[data.status] : undefined,
      organizerOrgId: data.organizerOrgId ?? undefined,
      subjects: data.subjects ?? undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      city: data.city ?? undefined,
      address: data.address ?? undefined,
      mapUrl: data.mapUrl ?? undefined,
      price: data.price ?? undefined,
      currency: data.currency ?? undefined,
      capacity: data.capacity ?? undefined,
      coverImageUrl: data.coverImageUrl ?? undefined
    }
  });

  if (data.translations?.length) {
    for (const translation of data.translations) {
      await prisma.eventTranslation.upsert({
        where: {
          eventId_locale: {
            eventId: params.id,
            locale: localeMap[translation.locale]
          }
        },
        update: {
          title: translation.title,
          subtitle: translation.subtitle ?? null,
          description: translation.description ?? null,
          rules: translation.rules ?? null,
          prizes: translation.prizes ?? null,
          levelInfo: translation.levelInfo ?? null,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        },
        create: {
          eventId: params.id,
          locale: localeMap[translation.locale],
          title: translation.title,
          subtitle: translation.subtitle ?? null,
          description: translation.description ?? null,
          rules: translation.rules ?? null,
          prizes: translation.prizes ?? null,
          levelInfo: translation.levelInfo ?? null,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        }
      });
    }
  }

  await logAudit({
    userId: session!.user!.id,
    action: "event.update",
    entityType: "Event",
    entityId: event.id
  });

  return NextResponse.json({ data: event });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "events.delete");
  if (response) {
    return response;
  }

  await prisma.event.delete({
    where: { id: params.id }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "event.delete",
    entityType: "Event",
    entityId: params.id
  });

  return NextResponse.json({ ok: true });
}
