import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { clearAuthCookies } from "@/lib/auth/session";

export async function POST() {
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}
