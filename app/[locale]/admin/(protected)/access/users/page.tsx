import { requirePermission } from "@/lib/auth/server";
import { UsersPageClient } from "@/components/admin-v2/access/UsersPageClient";

export default async function UsersPage() {
  await requirePermission("rbac.view");
  return <UsersPageClient />;
}
