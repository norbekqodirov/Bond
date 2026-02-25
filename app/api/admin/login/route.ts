import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  setAdminSession(email);
  return NextResponse.json({ ok: true });
}
