import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { RoleForm } from "@/components/admin-v2/access/RoleForm";

export default async function NewRolePage() {
  await requirePermission("rbac.manage");
  return (
    <div className="space-y-6">
      <PageHeader title="Create role" subtitle="Define permissions" />
      <RoleForm />
    </div>
  );
}
