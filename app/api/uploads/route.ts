import { NextRequest, NextResponse } from "next/server";

import { saveUploadedImage } from "@/lib/upload";
import { getApiSession } from "@/lib/api-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.permissions.has("events.edit") && !session.permissions.has("events.create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, "uploads");
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
