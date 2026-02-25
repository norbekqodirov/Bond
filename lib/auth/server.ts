import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { collectPermissions } from "@/lib/rbac";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { ACCESS_COOKIE } from "@/lib/auth/session";
import { getAdminSession } from "@/lib/admin-auth";

export async function getServerSession() {
  const adminSession = getAdminSession();
  if (adminSession) {
    return {
      user: {
        email: adminSession.email,
        phone: null
      },
      permissions: new Set(["*"])
    };
  }

  const accessToken = cookies().get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }
  try {
    const payload = await verifyAccessToken(accessToken);
    if (!payload.sub) {
      return null;
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });
    if (!user || !user.isActive) {
      return null;
    }
    const permissions = collectPermissions(user);
    return { user, permissions };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getServerSession();
  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/admin/login`);
  }
  return session;
}

export async function requirePermission(permission: string) {
  const session = await requireUser();
  if (!session.permissions.has("*") && !session.permissions.has(permission)) {
    const locale = await getLocale();
    redirect(`/${locale}/admin/unauthorized`);
  }
  return session;
}
