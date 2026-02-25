import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

const paymentSchema = z.object({
  provider: z.enum(["click", "payme", "manual"]).default("manual"),
  idempotencyKey: z.string().min(8)
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    include: {
      olympiad: true,
      event: true
    }
  });

  if (!registration || registration.userId !== session!.user!.id) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      registrationId: registration.id,
      idempotencyKey: parsed.data.idempotencyKey
    }
  });

  if (existingPayment) {
    return NextResponse.json({ data: existingPayment });
  }

  const amount = registration.olympiad?.price ?? registration.event?.price ?? 0;
  const currency = registration.olympiad?.currency ?? registration.event?.currency ?? "UZS";

  const payment = await prisma.payment.create({
    data: {
      registrationId: registration.id,
      provider: parsed.data.provider.toUpperCase(),
      amount,
      currency,
      status: "PAID",
      idempotencyKey: parsed.data.idempotencyKey
    }
  });

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      paymentStatus: "PAID",
      status: "PAID"
    }
  });

  await prisma.notification.create({
    data: {
      userId: session!.user!.id,
      type: "payment_confirmed",
      title: "Payment confirmed",
      body: `Payment received for registration ${registration.id}.`,
      data: {
        registrationId: registration.id,
        paymentId: payment.id
      }
    }
  });

  return NextResponse.json({ data: payment }, { status: 201 });
}
