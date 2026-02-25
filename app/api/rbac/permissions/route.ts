import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "rbac.view");
  if (response) {
    return response;
  }

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { key: "asc" }]
  });

  return NextResponse.json({ data: permissions });
}
