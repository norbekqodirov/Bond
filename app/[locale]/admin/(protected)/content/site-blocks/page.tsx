import { requirePermission } from "@/lib/auth/server";
import { SiteBlocksPageClient } from "@/components/admin-v2/content/SiteBlocksPageClient";

export default async function SiteBlocksPage() {
  await requirePermission("content.view");
  return <SiteBlocksPageClient />;
}
