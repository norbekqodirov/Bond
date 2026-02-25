import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { siteBlockSchema } from "@/lib/validators/site";
import { localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "content.view");
  if (response) {
    return response;
  }

  const blocks = await prisma.siteBlock.findMany({
    include: { translations: true },
    orderBy: { code: "asc" }
  });

  return NextResponse.json({ data: blocks });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "content.create");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = siteBlockSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const block = await prisma.siteBlock.create({
    data: {
      code: data.code,
      translations: {
        create: data.translations.map((translation) => ({
          locale: localeMap[translation.locale],
          data: translation.data
        }))
      }
    },
    include: { translations: true }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "siteblock.create",
    entityType: "SiteBlock",
    entityId: block.id
  });

  return NextResponse.json({ data: block }, { status: 201 });
}
