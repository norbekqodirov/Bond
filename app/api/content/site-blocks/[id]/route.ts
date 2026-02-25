import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { siteBlockUpdateSchema } from "@/lib/validators/site";
import { localeMap } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "content.edit");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = siteBlockUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const block = await prisma.siteBlock.update({
    where: { id: params.id },
    data: {
      code: data.code ?? undefined
    }
  });

  if (data.translations?.length) {
    for (const translation of data.translations) {
      await prisma.siteBlockTranslation.upsert({
        where: {
          blockId_locale: {
            blockId: params.id,
            locale: localeMap[translation.locale]
          }
        },
        update: {
          data: translation.data
        },
        create: {
          blockId: params.id,
          locale: localeMap[translation.locale],
          data: translation.data
        }
      });
    }
  }

  await logAudit({
    userId: session!.user!.id,
    action: "siteblock.update",
    entityType: "SiteBlock",
    entityId: block.id
  });

  return NextResponse.json({ data: block });
}
