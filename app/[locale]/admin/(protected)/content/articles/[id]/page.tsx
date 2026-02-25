import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { ArticleForm } from "@/components/admin-v2/content/ArticleForm";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  await requirePermission("content.edit");
  return (
    <div className="space-y-6">
      <PageHeader title="Edit article" subtitle="Update translations and SEO" />
      <ArticleForm articleId={params.id} />
    </div>
  );
}
