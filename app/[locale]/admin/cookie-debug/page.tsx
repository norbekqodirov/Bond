import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminCookieDebugPage() {
  const store = cookies();
  const adminCookie = store.get("bond_admin_session")?.value ?? null;
  const session = getAdminSession();

  return (
    <pre className="p-6 text-xs">
      {JSON.stringify(
        {
          hasAdminCookie: Boolean(adminCookie),
          cookiePreview: adminCookie ? `${adminCookie.slice(0, 24)}...` : null,
          session
        },
        null,
        2
      )}
    </pre>
  );
}
