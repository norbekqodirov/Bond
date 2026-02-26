import { ArticleForm } from "@/components/admin/ArticleForm";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";

export default function NewArticlePage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">New Article</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        New Article
      </h1>
      <ArticleForm />
    </div>
  );
}
