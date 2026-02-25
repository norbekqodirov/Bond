import { requirePermission } from "@/lib/auth/server";
import { ArticlesPageClient } from "@/components/admin-v2/content/ArticlesPageClient";

export default async function ArticlesPage() {
  await requirePermission("content.view");
  return <ArticlesPageClient />;
}
