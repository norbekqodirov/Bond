import { requirePermission } from "@/lib/auth/server";
import { TransactionsPageClient } from "@/components/admin-v2/finance/TransactionsPageClient";

export default async function TransactionsPage() {
  await requirePermission("payments.view");
  return <TransactionsPageClient />;
}
