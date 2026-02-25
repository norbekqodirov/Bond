import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "events.create");
  if (response) {
    return response;
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { translations: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const duplicate = await prisma.event.create({
    data: {
      type: event.type,
      status: "DRAFT",
      organizerOrgId: event.organizerOrgId,
      startDate: event.startDate,
      endDate: event.endDate,
      city: event.city,
      price: event.price,
      currency: event.currency,
      capacity: event.capacity,
      coverImageUrl: event.coverImageUrl,
      translations: {
        create: event.translations.map((translation) => ({
          locale: translation.locale,
          title: `${translation.title} (Copy)`,
          subtitle: translation.subtitle,
          description: translation.description,
          rules: translation.rules,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription
        }))
      }
    },
    include: { translations: true }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "event.duplicate",
    entityType: "Event",
    entityId: duplicate.id,
    metadata: { sourceEventId: event.id }
  });

  return NextResponse.json({ data: duplicate }, { status: 201 });
}
