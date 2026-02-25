import { Prisma } from "@prisma/client";

export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true };
            };
          };
        };
      };
    };
  };
}>;

export function collectPermissions(user: UserWithRoles | null) {
  const permissions = new Set<string>();
  if (!user) {
    return permissions;
  }
  for (const userRole of user.roles) {
    for (const rolePermission of userRole.role.permissions) {
      permissions.add(rolePermission.permission.key);
    }
  }
  return permissions;
}

export function hasPermission(userPermissions: Set<string>, required: string | string[]) {
  if (Array.isArray(required)) {
    return required.every((permission) => userPermissions.has(permission));
  }
  return userPermissions.has(required);
}
