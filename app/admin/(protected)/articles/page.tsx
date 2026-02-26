import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";
import { deleteArticle } from "@/app/admin/(protected)/articles/actions";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ArticlesAdminPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">Articles</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">
          Articles
        </h1>
        <Link
          href="/admin/articles/new"
          className="rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-soft"
        >
          New Article
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-semibold text-slate-800">
                  {article.title_en}
                </TableCell>
                <TableCell>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-500">
                    {article.status}
                  </Badge>
                </TableCell>
                <TableCell>{article.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                    >
                      Edit
                    </Link>
                    <form action={deleteArticle.bind(null, article.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
