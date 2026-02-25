import { requirePermission } from "@/lib/auth/server";
import { OlympiadsPageClient } from "@/components/admin-v2/olympiads/OlympiadsPageClient";

export default async function AdminOlympiadsPage() {
  await requirePermission("olympiads.view");
  return <OlympiadsPageClient />;
}
