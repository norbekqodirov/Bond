"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type Article = {
  id: string;
  slug: string;
  status: string;
  createdAt: string;
  translations: { title: string }[];
};

export function ArticlesPageClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const locale = useLocale();
  const t = useTranslations("admin");

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t("actions.remove"));
    if (!confirmed) return;
    const res = await fetch(`/api/content/articles/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      return;
    }
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  useEffect(() => {
    fetch("/api/content/articles")
      .then((res) => res.json())
      .then((data) => setArticles(data.data ?? []))
      .catch(() => setArticles([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        subtitle="Manage news and updates"
        actions={
          <Button asChild>
            <Link href={`/${locale}/admin/content/articles/new`}>{t("actions.create")}</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.translations[0]?.title ?? "Untitled"}</TableCell>
                  <TableCell>{article.slug}</TableCell>
                  <TableCell>
                    <StatusBadge status={article.status.toLowerCase()} />
                  </TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${locale}/admin/content/articles/${article.id}`}>Edit</Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>
                        {t("actions.remove")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
