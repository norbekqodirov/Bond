import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { generateTokenPair, hashToken } from "@/lib/auth/refresh";
import { setAuthCookies, REFRESH_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenHash = hashToken(refreshToken);
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

  setAuthCookies(accessToken, rawToken);

  return NextResponse.json({ ok: true });
}
