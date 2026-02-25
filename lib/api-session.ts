import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { collectPermissions } from "@/lib/rbac";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { ACCESS_COOKIE } from "@/lib/auth/session";

export type ApiSession = {
  user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  permissions: Set<string>;
};

export async function getApiSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const accessToken = bearerToken ?? request.cookies.get(ACCESS_COOKIE)?.value;
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

export async function requireApiSession(request: NextRequest, permission?: string) {
  const session = await getApiSession(request);
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (permission && !session.permissions.has(permission)) {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
