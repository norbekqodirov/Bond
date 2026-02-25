import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const roleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  permissionKeys: z.array(z.string()).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireApiSession(request, "rbac.view");
  if (response) {
    return response;
  }

  const role = await prisma.role.findUnique({
    where: { id: params.id },
    include: {
      permissions: { include: { permission: true } }
    }
  });

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: role });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
  const role = await prisma.role.update({
    where: { id: params.id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined
    }
  });

  if (data.permissionKeys) {
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    });

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
    action: "role.update",
    entityType: "Role",
    entityId: role.id
  });

  return NextResponse.json({ data: role });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "rbac.manage");
  if (response) {
    return response;
  }

  await prisma.role.delete({
    where: { id: params.id }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "role.delete",
    entityType: "Role",
    entityId: params.id
  });

  return NextResponse.json({ ok: true });
}
