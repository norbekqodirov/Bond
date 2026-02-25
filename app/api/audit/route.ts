import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "audit.view");
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const userId = params.get("userId");
  const entityType = params.get("entityType");
  const from = params.get("from");
  const to = params.get("to");

  const where: Record<string, unknown> = {};
  if (userId) {
    where.userId = userId;
  }
  if (entityType) {
    where.entityType = entityType;
  }
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: logs });
}
