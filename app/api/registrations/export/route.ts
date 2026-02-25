import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-session";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes("\"")) {
    return `"${value.replace(/\"/g, "\"\"")}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession(request, "registrations.export");
  if (response) {
    return response;
  }

  const params = request.nextUrl.searchParams;
  const eventId = params.get("eventId");
  const olympiadId = params.get("olympiadId");
  const status = params.get("status");
  const paymentStatus = params.get("paymentStatus");
  const from = params.get("from");
  const to = params.get("to");

  const where: Record<string, unknown> = {};
  if (eventId) {
    where.eventId = eventId;
  }
  if (olympiadId) {
    where.olympiadId = olympiadId;
  }
  if (status) {
    where.status = status.toUpperCase();
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus.toUpperCase();
  }
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {})
    };
  }

  const registrations = await prisma.registration.findMany({
    where,
    include: { event: true }
  });

  const headers = [
    "id",
    "eventId",
    "olympiadId",
    "participantName",
    "phone",
    "subject",
    "status",
    "paymentStatus",
    "createdAt"
  ];

  const rows = registrations.map((registration) => [
    registration.id,
    registration.eventId,
    registration.olympiadId,
    registration.participantName,
    registration.phone,
    registration.subject ?? "",
    registration.status,
    registration.paymentStatus,
    registration.createdAt.toISOString()
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join(
    "\n"
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=registrations.csv"
    }
  });
}
