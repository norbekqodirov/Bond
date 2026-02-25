import { prisma } from "@/lib/prisma";

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  metadata
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null
    }
  });
}
