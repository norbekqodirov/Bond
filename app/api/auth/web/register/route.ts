import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateTokenPair } from "@/lib/auth/refresh";
import { signAccessToken, tokenConfig } from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/session";
import { getPhoneCandidates, normalizePhone } from "@/lib/phone";

const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().min(7),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6)
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"]
  });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { firstName, lastName, phone, password } = parsed.data;
  const normalizedPhone = normalizePhone(phone);
  const phoneCandidates = getPhoneCandidates(phone);

  const existing = await prisma.user.findFirst({
    where: {
      phone: {
        in: phoneCandidates
      }
    }
  });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      phone: normalizedPhone,
      passwordHash,
      isActive: true,
      preferredLanguage: "UZ"
    }
  });

  const participantRole = await prisma.role.findFirst({
    where: { name: "Participant" }
  });

  if (participantRole) {
    await prisma.userRole.create({
      data: {
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

  setAuthCookies(accessToken, rawToken);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    }
  });
}
