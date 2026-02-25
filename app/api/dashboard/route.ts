import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "dashboard.view");
  if (response) {
    return response;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    totalRegistrations,
    totalArticles,
    newRegistrations,
    pendingOrganizers,
    pendingEvents,
    pendingRefunds
  ] = await Promise.all([
    prisma.event.count(),
    prisma.registration.count(),
    prisma.article.count(),
    prisma.registration.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.organization.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "PENDING" } })
  ]);

  return NextResponse.json({
    totalEvents,
    totalRegistrations,
    totalArticles,
    newRegistrations,
    pendingOrganizers,
    pendingEvents,
    pendingRefunds
  });
}
