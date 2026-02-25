import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";
import { createOlympiad } from "@/lib/repositories/olympiads";
import { eventStatusMap, eventTypeMap, gradeGroupMap, olympiadFormatMap, subjectMap } from "@/lib/mappers";
import { getOrganizerForUser } from "@/lib/organizer";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "olympiads.view");
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const type = params.get("type");
  const subject = params.get("subject");
  const gradeGroup = params.get("gradeGroup");
  const format = params.get("format");
  const organizerId = params.get("organizerId");

  const where: Record<string, unknown> = {};
  if (status && eventStatusMap[status]) {
    where.status = eventStatusMap[status];
  }
  if (type && eventTypeMap[type]) {
    where.type = eventTypeMap[type];
  }
  if (subject && subjectMap[subject]) {
    where.subject = subjectMap[subject];
  }
  if (gradeGroup && gradeGroupMap[gradeGroup]) {
    where.gradeGroup = gradeGroupMap[gradeGroup];
  }
  if (format && olympiadFormatMap[format]) {
    where.format = olympiadFormatMap[format];
  }

  const isAdminScope =
    session!.permissions.has("olympiads.approve") ||
    session!.permissions.has("organizations.view") ||
    session!.permissions.has("events.view");

  if (organizerId) {
    where.organizerId = organizerId;
  } else if (!isAdminScope) {
    const organizer = await getOrganizerForUser(session!.user!.id);
    if (!organizer) {
      return NextResponse.json({ data: [] });
    }
    where.organizerId = organizer.id;
  }

  const olympiads = await prisma.olympiad.findMany({
    where,
    include: {
      translations: true,
      organizer: {
        include: {
          organization: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: olympiads });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession(request, "olympiads.create");
  if (response) {
    return response;
  }

  const payload = await request.json().catch(() => null);
  const organizerIdInput = payload?.organizerId as string | undefined;
  const isAdminScope =
    session!.permissions.has("olympiads.approve") ||
    session!.permissions.has("organizations.edit") ||
    session!.permissions.has("events.edit");

  let organizerId = organizerIdInput;
  if (!organizerId || !isAdminScope) {
    const organizer = await getOrganizerForUser(session!.user!.id);
    if (!organizer) {
      return NextResponse.json({ error: "Organizer profile required" }, { status: 403 });
    }
    organizerId = organizer.id;
  }

  let olympiad;
  try {
    olympiad = await createOlympiad(payload, organizerId);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await logAudit({
    userId: session!.user!.id,
    action: "olympiad.create",
    entityType: "Olympiad",
    entityId: olympiad.id
  });

  return NextResponse.json({ data: olympiad }, { status: 201 });
}
