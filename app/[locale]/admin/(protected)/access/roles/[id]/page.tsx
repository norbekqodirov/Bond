import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { RoleForm } from "@/components/admin-v2/access/RoleForm";

export default async function EditRolePage({ params }: { params: { id: string } }) {
  await requirePermission("rbac.manage");
  return (
    <div className="space-y-6">
      <PageHeader title="Edit role" subtitle="Update permissions" />
      <RoleForm roleId={params.id} />
    </div>
  );
}
