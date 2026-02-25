import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashOtpCode, verifyOtpCode } from "@/lib/otp";
import { generateTokenPair } from "@/lib/auth/refresh";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { normalizePhone } from "@/lib/phone";

const verifySchema = z.object({
  phone: z.string().min(7),
  code: z.string().min(4),
  role: z.enum(["participant", "parent", "organizer"]).optional()
});

const roleMap: Record<string, string> = {
  participant: "Participant",
  parent: "Parent",
  organizer: "Organizer"
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { code, role } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  const verified = await verifyOtpCode(phone, code);
  if (!verified) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const user =
    (await prisma.user.findUnique({ where: { phone } })) ??
    (await prisma.user.create({
      data: {
        phone,
        isActive: true
      }
    }));

  await prisma.otpToken.updateMany({
    where: {
      userId: user.id,
      codeHash: hashOtpCode(code),
      expiresAt: { gt: new Date() },
      usedAt: null
    },
    data: { usedAt: new Date() }
  });

  const roleName = role ? roleMap[role] : "Participant";
  const roleRecord = await prisma.role.findFirst({
    where: { name: roleName }
  });

  if (roleRecord) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roleRecord.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roleRecord.id
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
      phone: user.phone,
      email: user.email
    }
  });
}
