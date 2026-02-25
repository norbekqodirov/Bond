import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { eventTypeMap, gradeGroupMap, olympiadFormatMap, subjectMap, localeMap } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const subject = params.get("subject");
  const gradeGroup = params.get("gradeGroup");
  const format = params.get("format");
  const region = params.get("region");
  const from = params.get("from");
  const to = params.get("to");
  const priceMin = params.get("priceMin");
  const priceMax = params.get("priceMax");
  const search = params.get("search");
  const locale = params.get("locale");

  const olympiadWhere: Record<string, unknown> = {
    status: "PUBLISHED"
  };

  if (type && eventTypeMap[type]) {
    olympiadWhere.type = eventTypeMap[type];
  }
  if (subject && subjectMap[subject]) {
    olympiadWhere.subject = subjectMap[subject];
  }
  if (gradeGroup && gradeGroupMap[gradeGroup]) {
    olympiadWhere.gradeGroup = gradeGroupMap[gradeGroup];
  }
  if (format && olympiadFormatMap[format]) {
    olympiadWhere.format = olympiadFormatMap[format];
  }
  if (region) {
    olympiadWhere.region = { contains: region, mode: "insensitive" };
  }
  if (from || to) {
    olympiadWhere.startDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }
  if (priceMin || priceMax) {
    olympiadWhere.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {})
    };
  }
  if (search) {
    olympiadWhere.translations = {
      some: {
        title: { contains: search, mode: "insensitive" }
      }
    };
  }

  const olympiads = await prisma.olympiad.findMany({
    where: olympiadWhere,
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizer: {
        include: { organization: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const eventWhere: Record<string, unknown> = {
    status: "PUBLISHED"
  };
  if (type && eventTypeMap[type]) {
    eventWhere.type = eventTypeMap[type];
  }
  if (subject && subjectMap[subject]) {
    eventWhere.subjects = { has: subjectMap[subject] };
  }
  if (region) {
    eventWhere.OR = [
      { city: { contains: region, mode: "insensitive" } },
      { address: { contains: region, mode: "insensitive" } }
    ];
  }
  if (from || to) {
    eventWhere.startDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }
  if (priceMin || priceMax) {
    eventWhere.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {})
    };
  }
  if (search) {
    eventWhere.translations = {
      some: {
        title: { contains: search, mode: "insensitive" }
      }
    };
  }

  const events = await prisma.event.findMany({
    where: eventWhere,
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true,
      organizerOrg: true
    },
    orderBy: { createdAt: "desc" }
  });

  const mappedEvents = events.map((event) => ({
    id: event.id,
    type: event.type,
    status: event.status,
    format: null,
    level: null,
    subjects: event.subjects ?? [],
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
    createdAt: event.createdAt
  }));

  const combined = [...olympiads, ...mappedEvents].sort((a, b) => {
    const aDate = a.createdAt ?? a.startDate ?? 0;
    const bDate = b.createdAt ?? b.startDate ?? 0;
    return new Date(bDate as Date).getTime() - new Date(aDate as Date).getTime();
  });

  return NextResponse.json({ data: combined });
}
