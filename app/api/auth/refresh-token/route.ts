import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { generateTokenPair, hashToken } from "@/lib/auth/refresh";

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.refreshToken);
  const existing = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() }
  });

  const accessToken = await signAccessToken(existing.userId);
  const { rawToken, tokenHash: nextHash } = generateTokenPair();
  const refreshExpiry = new Date(Date.now() + tokenConfig.refreshTokenTtlDays * 86400000);

  await prisma.refreshToken.create({
    data: {
      userId: existing.userId,
      tokenHash: nextHash,
      expiresAt: refreshExpiry
    }
  });

  return NextResponse.json({
    accessToken,
    refreshToken: rawToken
  });
}
