import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { articleUpdateSchema } from "@/lib/validators/article";
import { localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";
import { deleteUploadedFile } from "@/lib/upload";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireApiSession(request, "content.view");
  if (response) {
    return response;
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { translations: true }
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: article });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "content.edit");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = articleUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      slug: data.slug ?? undefined,
      status: data.status ? data.status.toUpperCase() : undefined,
      coverImageUrl: data.coverImageUrl ?? undefined
    }
  });

  if (data.translations?.length) {
    for (const translation of data.translations) {
      await prisma.articleTranslation.upsert({
        where: {
          articleId_locale: {
            articleId: params.id,
            locale: localeMap[translation.locale]
          }
        },
        update: {
          title: translation.title,
          body: translation.body,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        },
        create: {
          articleId: params.id,
          locale: localeMap[translation.locale],
          title: translation.title,
          body: translation.body,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        }
      });
    }
  }

  await logAudit({
    userId: session!.user!.id,
    action: "article.update",
    entityType: "Article",
    entityId: article.id
  });

  return NextResponse.json({ data: article });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "content.edit");
  if (response) {
    return response;
  }

  const existing = await prisma.article.findUnique({
    where: { id: params.id },
    select: { id: true, coverImageUrl: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteUploadedFile(existing.coverImageUrl);

  await prisma.article.delete({
    where: { id: params.id }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "article.delete",
    entityType: "Article",
    entityId: existing.id
  });

  return NextResponse.json({ ok: true });
}
