import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "payments.refund");
  if (response) {
    return response;
  }

  const transaction = await prisma.payment.update({
    where: { id: params.id },
    data: { status: "REFUNDED" }
  });

  await prisma.registration.update({
    where: { id: transaction.registrationId },
    data: { paymentStatus: "REFUNDED" }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "payment.refund",
    entityType: "Payment",
    entityId: transaction.id
  });

  return NextResponse.json({ data: transaction });
}
