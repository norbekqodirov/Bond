import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const issueSchema = z.object({
  registrationId: z.string(),
  resultId: z.string().optional().nullable(),
  url: z.string().min(5),
  verificationCode: z.string().optional().nullable()
});

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "certificates.issue");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = issueSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: parsed.data.registrationId }
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const verificationCode =
    parsed.data.verificationCode ?? crypto.randomBytes(6).toString("hex").toUpperCase();

  const certificate = await prisma.certificate.upsert({
    where: { registrationId: parsed.data.registrationId },
    update: {
      url: parsed.data.url,
      resultId: parsed.data.resultId ?? null,
      verificationCode
    },
    create: {
      registrationId: parsed.data.registrationId,
      resultId: parsed.data.resultId ?? null,
      url: parsed.data.url,
      verificationCode
    }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "certificate.issue",
    entityType: "Certificate",
    entityId: certificate.id
  });

  return NextResponse.json({ data: certificate });
}
