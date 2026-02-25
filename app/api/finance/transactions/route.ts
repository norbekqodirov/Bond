import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "payments.view");
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status");

  const transactions = await prisma.payment.findMany({
    where: status ? { status: status.toUpperCase() } : undefined,
    include: {
      registration: {
        include: { event: true, olympiad: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: transactions });
}
