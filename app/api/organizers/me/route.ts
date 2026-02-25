import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-session";
import { getOrganizerForUser } from "@/lib/organizer";

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (response) {
    return response;
  }

  if (!session!.permissions.has("olympiads.view") && !session!.permissions.has("organizations.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizer = await getOrganizerForUser(session!.user!.id);
  if (!organizer) {
    return NextResponse.json({ error: "Organizer profile not found" }, { status: 404 });
  }

  return NextResponse.json({ data: organizer });
}
