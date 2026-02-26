import { AdminShell } from "@/components/admin-v2/AdminShell";
import { DatabaseRequiredNotice } from "@/components/shared/DatabaseRequiredNotice";
import { isDatabaseConfigured } from "@/lib/database";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  if (!isDatabaseConfigured()) {
    return (
      <AdminShell
        user={{ email: session.user.email ?? session.user.phone ?? "User" }}
        permissions={Array.from(session.permissions)}
      >
        <div className="space-y-6">
          <DatabaseRequiredNotice description="The new admin panel UI is restored. Data modules will fully work after configuring a real DATABASE_URL on Vercel (not localhost)." />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      user={{ email: session.user.email ?? session.user.phone ?? "User" }}
      permissions={Array.from(session.permissions)}
    >
      {children}
    </AdminShell>
  );
}
