import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { logAudit } from "@/lib/audit";

const memberSchema = z.object({
  userId: z.string(),
  orgRole: z.enum(["owner", "admin", "jury"])
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireApiSession(request, "organizations.view");
  if (response) {
    return response;
  }

  const members = await prisma.organizationMember.findMany({
    where: { orgId: params.id },
    include: { user: true }
  });

  return NextResponse.json({ data: members });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "organizations.edit");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const member = await prisma.organizationMember.upsert({
    where: {
      orgId_userId: {
        orgId: params.id,
        userId: parsed.data.userId
      }
    },
    update: {
      orgRole: parsed.data.orgRole.toUpperCase()
    },
    create: {
      orgId: params.id,
      userId: parsed.data.userId,
      orgRole: parsed.data.orgRole.toUpperCase()
    }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "organization.member.upsert",
    entityType: "OrganizationMember",
    entityId: `${member.orgId}:${member.userId}`,
    metadata: parsed.data
  });

  return NextResponse.json({ data: member });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "organizations.edit");
  if (response) {
    return response;
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await prisma.organizationMember.delete({
    where: {
      orgId_userId: {
        orgId: params.id,
        userId
      }
    }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "organization.member.remove",
    entityType: "OrganizationMember",
    entityId: `${params.id}:${userId}`
  });

  return NextResponse.json({ ok: true });
}
