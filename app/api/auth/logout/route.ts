import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { clearAuthCookies } from "@/lib/auth/session";
import { clearAdminSession } from "@/lib/admin-auth";

export async function POST() {
  clearAuthCookies();
  clearAdminSession();
  return NextResponse.json({ ok: true });
}
