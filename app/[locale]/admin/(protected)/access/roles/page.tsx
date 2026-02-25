import { requirePermission } from "@/lib/auth/server";
import { RolesPageClient } from "@/components/admin-v2/access/RolesPageClient";

export default async function RolesPage() {
  await requirePermission("rbac.view");
  return <RolesPageClient />;
}
