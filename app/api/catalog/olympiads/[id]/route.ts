import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { localeMap } from "@/lib/mappers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const locale = request.nextUrl.searchParams.get("locale");

  const olympiad = await prisma.olympiad.findUnique({
    where: { id: params.id },
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizer: {
        include: { organization: true }
      }
    }
  });

  if (olympiad && olympiad.status === "PUBLISHED") {
    const registrationCount = await prisma.registration.count({
      where: { olympiadId: olympiad.id }
    });

    return NextResponse.json({ data: { ...olympiad, registrationCount } });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizerOrg: true
    }
  });

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const registrationCount = await prisma.registration.count({
    where: { eventId: event.id }
  });

  const mappedEvent = {
    id: event.id,
    type: event.type,
    status: event.status,
    format: null,
    level: null,
    region: event.city ?? event.address ?? null,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.address ?? event.city ?? null,
    rules: event.translations?.[0]?.rules ?? null,
    prizes: event.translations?.[0]?.prizes ?? null,
    price: event.price,
    currency: event.currency,
    capacity: event.capacity ?? null,
    coverImageUrl: event.coverImageUrl,
    translations: event.translations,
    organizer: event.organizerOrg ? { organization: { name: event.organizerOrg.name } } : null,
    registrationCount
  };

  return NextResponse.json({ data: mappedEvent });
}
