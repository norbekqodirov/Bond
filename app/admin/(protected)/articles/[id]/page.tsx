import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticlePage({
  params
}: {
  params: { id: string };
}) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">Edit Article</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id }
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        Edit Article
      </h1>
      <ArticleForm article={article} />
    </div>
  );
}
