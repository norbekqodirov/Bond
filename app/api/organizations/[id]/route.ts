import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  contacts: z.record(z.string(), z.any()).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireApiSession(request, "organizations.view");
  if (response) {
    return response;
  }

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: true }
      },
      events: true
    }
  });

  if (!organization) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: organization });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const permission = data.status ? "organizations.approve" : "organizations.edit";
  const { session, response } = await requireApiSession(request, permission);
  if (response) {
    return response;
  }
  const organization = await prisma.organization.update({
    where: { id: params.id },
    data: {
      name: data.name ?? undefined,
      status: data.status ? data.status.toUpperCase() : undefined,
      contacts: data.contacts ?? undefined
    }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "organization.update",
    entityType: "Organization",
    entityId: organization.id,
    metadata: data
  });

  return NextResponse.json({ data: organization });
}
