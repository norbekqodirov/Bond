import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";
import { clearAuthCookies } from "@/lib/auth/session";

export async function GET(request: Request) {
  clearAdminSession();
  clearAuthCookies();
  return NextResponse.redirect(new URL("/uz/admin/login", request.url));
}
