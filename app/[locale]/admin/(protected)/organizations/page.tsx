import { requirePermission } from "@/lib/auth/server";
import { OrganizationsPageClient } from "@/components/admin-v2/organizations/OrganizationsPageClient";

export default async function OrganizationsPage() {
  await requirePermission("organizations.view");
  return <OrganizationsPageClient />;
}
