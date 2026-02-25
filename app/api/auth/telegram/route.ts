import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { generateTokenPair } from "@/lib/auth/refresh";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { verifyTelegramInitData } from "@/lib/telegram";

const payloadSchema = z.object({
  initData: z.string().min(1)
});

const languageMap: Record<string, "UZ" | "RU" | "EN"> = {
  uz: "UZ",
  ru: "RU",
  en: "EN"
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Bot token missing" }, { status: 500 });
  }

  const verification = verifyTelegramInitData(parsed.data.initData, botToken);
  if (!verification.ok || !verification.data) {
    return NextResponse.json({ error: "Invalid init data" }, { status: 401 });
  }

  const userRaw = verification.data.user ? JSON.parse(verification.data.user) : null;
  if (!userRaw?.id) {
    return NextResponse.json({ error: "User missing" }, { status: 400 });
  }

  const telegramId = String(userRaw.id);
  const telegramUsername = userRaw.username ? `@${userRaw.username}` : null;
  const preferredLanguage = userRaw.language_code
    ? languageMap[userRaw.language_code.toLowerCase()] ?? null
    : null;

  let user = await prisma.user.findFirst({
    where: { telegramId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername,
        telegramFirstName: userRaw.first_name ?? null,
        telegramLastName: userRaw.last_name ?? null,
        telegramPhotoUrl: userRaw.photo_url ?? null,
        telegramAuthAt: new Date(),
        firstName: userRaw.first_name ?? null,
        lastName: userRaw.last_name ?? null,
        preferredLanguage,
        isActive: true
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramUsername,
        telegramFirstName: userRaw.first_name ?? null,
        telegramLastName: userRaw.last_name ?? null,
        telegramPhotoUrl: userRaw.photo_url ?? null,
        telegramAuthAt: new Date(),
        ...(user.firstName ? {} : { firstName: userRaw.first_name ?? null }),
        ...(user.lastName ? {} : { lastName: userRaw.last_name ?? null }),
        ...(preferredLanguage ? { preferredLanguage } : {})
      }
    });
  }

  const participantRole = await prisma.role.findFirst({
    where: { name: "Participant" }
  });

  if (participantRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: participantRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: participantRole.id
      }
    });
  }

  const accessToken = await signAccessToken(user.id);
  const { rawToken, tokenHash } = generateTokenPair();
  const refreshExpiry = new Date(Date.now() + tokenConfig.refreshTokenTtlDays * 86400000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: refreshExpiry
    }
  });

  return NextResponse.json({
    accessToken,
    refreshToken: rawToken,
    user: {
      id: user.id,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      firstName: user.telegramFirstName,
      lastName: user.telegramLastName
    }
  });
}
