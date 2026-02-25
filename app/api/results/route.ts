import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const resultSchema = z.object({
  registrationId: z.string(),
  score: z.number().optional().nullable(),
  place: z.number().int().optional().nullable(),
  rank: z.number().int().optional().nullable(),
  details: z.any().optional().nullable(),
  publish: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  if (!session!.permissions.has("results.publish") && !session!.permissions.has("registrations.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await prisma.result.findMany({
    include: {
      registration: true,
      certificate: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: results });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "results.publish");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = resultSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const publish = parsed.data.publish ?? false;
  const result = await prisma.result.upsert({
    where: { registrationId: parsed.data.registrationId },
    update: {
      score: parsed.data.score ?? undefined,
      place: parsed.data.place ?? undefined,
      rank: parsed.data.rank ?? undefined,
      details: parsed.data.details ?? undefined,
      status: publish ? "PUBLISHED" : undefined,
      publishedAt: publish ? new Date() : undefined
    },
    create: {
      registrationId: parsed.data.registrationId,
      score: parsed.data.score ?? null,
      place: parsed.data.place ?? null,
      rank: parsed.data.rank ?? null,
      details: parsed.data.details ?? null,
      status: publish ? "PUBLISHED" : "PENDING",
      publishedAt: publish ? new Date() : null
    }
  });

  await logAudit({
    userId: session!.user!.id,
    action: publish ? "result.publish" : "result.upsert",
    entityType: "Result",
    entityId: result.id
  });

  return NextResponse.json({ data: result });
}
