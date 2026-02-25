import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "payouts.view");
  if (response) {
    return response;
  }

  const commissionSetting = await prisma.siteSetting.findUnique({
    where: { key: "commissionRate" }
  });
  const commissionRate = typeof commissionSetting?.value === "number" ? commissionSetting.value : 0.08;

  const aggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" }
  });

  const gross = Number(aggregate._sum.amount ?? 0);
  const commission = Number((gross * commissionRate).toFixed(2));
  const net = Number((gross - commission).toFixed(2));

  return NextResponse.json({
    gross,
    commissionRate,
    commission,
    net
  });
}
