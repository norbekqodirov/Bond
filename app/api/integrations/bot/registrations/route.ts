import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  telegramId: z.string().optional(),
  telegramUsername: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(6),
  olympiadId: z.string().optional(),
  olympiadTitle: z.string().optional(),
  locale: z.string().optional(),
  meta: z.record(z.unknown()).optional()
});

async function resolveOlympiadId(payload: z.infer<typeof payloadSchema>) {
  if (payload.olympiadId) {
    return payload.olympiadId;
  }
  if (!payload.olympiadTitle) {
    return null;
  }
  const title = payload.olympiadTitle.trim();
  if (!title) {
    return null;
  }
  const olympiad = await prisma.olympiad.findFirst({
    where: {
      translations: {
        some: {
          title: {
            contains: title,
            mode: "insensitive"
          }
        }
      }
    }
  });
  return olympiad?.id ?? null;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.BOT_INTEGRATION_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;
  const telegramId = payload.telegramId ? payload.telegramId.trim() : null;
  const telegramUsername = payload.telegramUsername?.trim() || null;

  let user = null;
  if (telegramId) {
    user = await prisma.user.findFirst({ where: { telegramId } });
  }
  if (!user && payload.phone) {
    user = await prisma.user.findFirst({ where: { phone: payload.phone } });
  }
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername,
        phone: payload.phone,
        isActive: true
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(telegramId ? { telegramId } : {}),
        ...(telegramUsername ? { telegramUsername } : {}),
        ...(payload.phone ? { phone: payload.phone } : {})
      }
    });
  }

  const olympiadId = await resolveOlympiadId(payload);

  const registration = await prisma.registration.create({
    data: {
      userId: user.id,
      olympiadId,
      participantName: payload.fullName,
      phone: payload.phone,
      formData: payload.meta ?? {}
    }
  });

  return NextResponse.json({ data: registration }, { status: 201 });
}
