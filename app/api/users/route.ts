import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "rbac.view");
  if (response) {
    return response;
  }

  const search = request.nextUrl.searchParams.get("search");
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      roles: {
        include: { role: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.roles.map((item) => item.role.name)
    }))
  });
}
