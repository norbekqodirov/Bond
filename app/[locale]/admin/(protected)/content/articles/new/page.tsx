import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { ArticleForm } from "@/components/admin-v2/content/ArticleForm";

export default async function NewArticlePage() {
  await requirePermission("content.create");
  return (
    <div className="space-y-6">
      <PageHeader title="Create article" subtitle="Publish a new story" />
      <ArticleForm />
    </div>
  );
}
