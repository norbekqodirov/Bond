import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "settings.view");
  if (response) {
    return response;
  }

  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" }
  });

  return NextResponse.json({ data: settings });
}

export async function PUT(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "settings.manage");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = z.union([settingSchema, z.array(settingSchema)]).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  for (const item of items) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value }
    });
  }

  await logAudit({
    userId: session!.user!.id,
    action: "settings.update",
    entityType: "SiteSetting",
    entityId: null,
    metadata: { keys: items.map((item) => item.key) }
  });

  return NextResponse.json({ ok: true });
}
