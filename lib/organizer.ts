import { prisma } from "@/lib/prisma";

export async function getOrganizerForUser(userId: string) {
  const ownerOrganizer = await prisma.organizer.findFirst({
    where: { ownerUserId: userId }
  });

  if (ownerOrganizer) {
    return ownerOrganizer;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true }
  });

  if (!membership) {
    return null;
  }

  return prisma.organizer.findFirst({
    where: { organizationId: membership.orgId }
  });
}
