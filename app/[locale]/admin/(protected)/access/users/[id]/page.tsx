import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { UserRolesForm } from "@/components/admin-v2/access/UserRolesForm";

export default async function UserRolesPage({ params }: { params: { id: string } }) {
  await requirePermission("rbac.manage");
  return (
    <div className="space-y-6">
      <PageHeader title="User roles" subtitle="Assign roles to the user" />
      <UserRolesForm userId={params.id} />
    </div>
  );
}
