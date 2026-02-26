import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  if (!isDatabaseConfigured()) {
    return (
      <AdminShell>
        <div className="space-y-6">
          <h1 className="text-3xl font-display font-semibold text-brand-primary">Admin Panel</h1>
          <DatabaseRequiredNotice />
        </div>
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
