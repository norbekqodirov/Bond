import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { getOrganizerForUser } from "@/lib/organizer";
import { updateOlympiad } from "@/lib/repositories/olympiads";
import { logAudit } from "@/lib/audit";

async function assertOrganizerScope(userId: string, olympiadId: string, isAdminScope: boolean) {
  if (isAdminScope) {
    return true;
  }
  const organizer = await getOrganizerForUser(userId);
  if (!organizer) {
    return false;
  }
  const owns = await prisma.olympiad.findFirst({
    where: { id: olympiadId, organizerId: organizer.id },
    select: { id: true }
  });
  return Boolean(owns);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "olympiads.view");
  if (response) {
    return response;
  }

  const isAdminScope =
    session!.permissions.has("olympiads.approve") ||
    session!.permissions.has("organizations.view") ||
    session!.permissions.has("events.view");

  const allowed = await assertOrganizerScope(session!.user!.id, params.id, isAdminScope);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const olympiad = await prisma.olympiad.findUnique({
    where: { id: params.id },
    include: { translations: true, organizer: { include: { organization: true } } }
  });

  if (!olympiad) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: olympiad });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "olympiads.edit");
  if (response) {
    return response;
  }

  const isAdminScope =
    session!.permissions.has("olympiads.approve") ||
    session!.permissions.has("organizations.edit") ||
    session!.permissions.has("events.edit");

  const allowed = await assertOrganizerScope(session!.user!.id, params.id, isAdminScope);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  let olympiad;
  try {
    olympiad = await updateOlympiad(params.id, payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await logAudit({
    userId: session!.user!.id,
    action: "olympiad.update",
    entityType: "Olympiad",
    entityId: olympiad.id
  });

  return NextResponse.json({ data: olympiad });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession(request, "olympiads.edit");
  if (response) {
    return response;
  }

  const isAdminScope =
    session!.permissions.has("olympiads.approve") ||
    session!.permissions.has("organizations.edit") ||
    session!.permissions.has("events.edit");

  const allowed = await assertOrganizerScope(session!.user!.id, params.id, isAdminScope);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.olympiad.delete({
    where: { id: params.id }
  });

  await logAudit({
    userId: session!.user!.id,
    action: "olympiad.delete",
    entityType: "Olympiad",
    entityId: params.id
  });

  return NextResponse.json({ ok: true });
}
