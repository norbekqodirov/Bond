import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requestOtpCode } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";

const requestSchema = z.object({
  phone: z.string().min(7),
  role: z.enum(["participant", "parent", "organizer"]).optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  const user =
    (await prisma.user.findUnique({ where: { phone } })) ??
    (await prisma.user.create({
      data: {
        phone,
        isActive: true
      }
    }));

  try {
    const { code, codeHash, ttlSeconds } = await requestOtpCode(phone);
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000)
      }
    });

    return NextResponse.json({
      ok: true,
      expiresIn: ttlSeconds,
      devCode: process.env.NODE_ENV === "production" ? undefined : code
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 429 });
  }
}
