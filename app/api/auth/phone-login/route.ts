import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { generateTokenPair } from "@/lib/auth/refresh";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { getPhoneCandidates } from "@/lib/phone";

const loginSchema = z.object({
  phone: z.string().min(7),
  password: z.string().min(6),
  role: z.enum(["participant", "parent", "organizer"]).optional()
});

const roleMap: Record<string, string> = {
  participant: "Participant",
  parent: "Parent",
  organizer: "Organizer"
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { phone, password, role } = parsed.data;
  const phoneCandidates = getPhoneCandidates(phone);

  const user = await prisma.user.findFirst({
    where: {
      phone: {
        in: phoneCandidates
      }
    }
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

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
