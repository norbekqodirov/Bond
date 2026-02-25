import { requirePermission } from "@/lib/auth/server";
import { OrganizationDetailClient } from "@/components/admin-v2/organizations/OrganizationDetailClient";

export default async function OrganizationDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("organizations.view");
  return <OrganizationDetailClient id={params.id} />;
}
