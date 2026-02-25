import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  permissionKeys: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "rbac.view");
  if (response) {
    return response;
  }

  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ data: roles });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "rbac.manage");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = roleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      isSystem: false
    }
  });

  if (data.permissionKeys?.length) {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: data.permissionKeys } },
      select: { id: true }
    });

    if (permissions.length) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id
        }))
      });
    }
  }

  await logAudit({
    userId: session!.user!.id,
    action: "role.create",
    entityType: "Role",
    entityId: role.id
  });

  return NextResponse.json({ data: role }, { status: 201 });
}
