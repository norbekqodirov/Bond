import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth/session";

export async function POST() {
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}
