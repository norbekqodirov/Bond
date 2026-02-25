import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "rbac.view");
  if (response) {
    return response;
  }

  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: users });
}
