import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
  const payload = await request.json().catch(() => null);

  console.log("Payment webhook", params.provider, payload);

  return NextResponse.json({ ok: true });
}
