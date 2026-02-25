import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { articleSchema } from "@/lib/validators/article";
import { localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "content.view");
  if (response) {
    return response;
  }

  const articles = await prisma.article.findMany({
    include: { translations: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: articles });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "content.create");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const article = await prisma.article.create({
    data: {
      slug: data.slug,
      status: data.status ? data.status.toUpperCase() : "DRAFT",
      coverImageUrl: data.coverImageUrl ?? null,
      translations: {
        create: data.translations.map((translation) => ({
          locale: localeMap[translation.locale],
          title: translation.title,
          body: translation.body,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        }))
      }
    },
    include: { translations: true }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "article.create",
    entityType: "Article",
    entityId: article.id
  });

  return NextResponse.json({ data: article }, { status: 201 });
}
