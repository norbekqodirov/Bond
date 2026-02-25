import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { localeMap } from "@/lib/mappers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const locale = request.nextUrl.searchParams.get("locale");

  const events = await prisma.event.findMany({
    where: {
      organizerOrgId: params.id,
      status: "PUBLISHED"
    },
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: events });
}
