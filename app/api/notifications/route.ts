import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const limit = Number(params.get("limit") ?? "50");
  const scope = params.get("scope");
  const userId = params.get("userId");

  if (scope === "all" && !session!.permissions.has("audit.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    where:
      scope === "all"
        ? {
            ...(userId ? { userId } : {})
          }
        : { userId: session!.user!.id },
    include: scope === "all" ? { user: true } : undefined,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100)
  });

  return NextResponse.json({ data: notifications });
}
