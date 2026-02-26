import { AdminShell } from "@/components/admin-v2/AdminShell";
import { redirect } from "next/navigation";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { getAdminSession } from "@/lib/admin-auth";
import { isDatabaseConfigured } from "@/lib/database";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (getAdminSession()) {
    redirect("/admin");
  }

  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <DatabaseRequiredNotice description="The localized admin panel requires a configured database. For the demo login, use /admin after sign-in." />
      </div>
    );
  }

  const session = await requireUser();
  return (
    <AdminShell
      user={{ email: session.user.email ?? session.user.phone ?? "User" }}
      permissions={Array.from(session.permissions)}
    >
      {children}
    </AdminShell>
  );
}
