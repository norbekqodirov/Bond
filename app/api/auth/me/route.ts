import { NextRequest, NextResponse } from "next/server";

import { getApiSession } from "@/lib/api-session";

export async function GET(request: NextRequest) {
  const session = await getApiSession(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user?.id,
      email: session.user?.email,
      permissions: Array.from(session.permissions)
    }
  });
}
