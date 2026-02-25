import { AdminShell } from "@/components/admin-v2/AdminShell";
import { requireUser } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
