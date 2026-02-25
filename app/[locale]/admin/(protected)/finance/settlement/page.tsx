import { requirePermission } from "@/lib/auth/server";
import { SettlementPageClient } from "@/components/admin-v2/finance/SettlementPageClient";

export default async function SettlementPage() {
  await requirePermission("payouts.view");
  return <SettlementPageClient />;
}
