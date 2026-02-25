import { requirePermission } from "@/lib/auth/server";
import { AuditPageClient } from "@/components/admin-v2/audit/AuditPageClient";

export default async function AuditPage() {
  await requirePermission("audit.view");
  return <AuditPageClient />;
}
