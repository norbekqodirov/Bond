import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { localeMap } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale");

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: locale && localeMap[locale] ? { where: { locale: localeMap[locale] } } : true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: articles });
}
