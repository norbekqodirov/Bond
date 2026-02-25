import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const rolesSchema = z.object({
  roleIds: z.array(z.string()).min(1)
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "rbac.manage");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = rolesSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.userRole.deleteMany({
    where: { userId: params.id }
  });

  await prisma.userRole.createMany({
    data: parsed.data.roleIds.map((roleId) => ({
      userId: params.id,
      roleId
    }))
  });

  await logAudit({
    userId: session!.user!.id,
    action: "user.roles.update",
    entityType: "User",
    entityId: params.id,
    metadata: { roleIds: parsed.data.roleIds }
  });

  return NextResponse.json({ ok: true });
}
