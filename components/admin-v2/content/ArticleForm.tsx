"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const locales = ["uz", "ru", "en"] as const;

const emptyTranslation = {
  title: "",
  body: "",
  seoTitle: "",
  seoDescription: ""
};

export function ArticleForm({ articleId }: { articleId?: string }) {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [translations, setTranslations] = useState<Record<string, typeof emptyTranslation>>({
    uz: { ...emptyTranslation },
    ru: { ...emptyTranslation },
    en: { ...emptyTranslation }
  });
  const [loading, setLoading] = useState(Boolean(articleId));
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    if (!articleId) return;
    fetch(`/api/content/articles/${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        const article = data.data;
        setSlug(article.slug);
        setStatus(article.status.toLowerCase());
        setCoverImageUrl(article.coverImageUrl ?? "");
        const next = { uz: { ...emptyTranslation }, ru: { ...emptyTranslation }, en: { ...emptyTranslation } };
        for (const translation of article.translations) {
          next[translation.locale.toLowerCase()] = {
            title: translation.title ?? "",
            body: translation.body ?? "",
            seoTitle: translation.seoTitle ?? "",
            seoDescription: translation.seoDescription ?? ""
          };
        }
        setTranslations(next);
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = async () => {
    setError(null);
    const translationsPayload = locales
      .map((localeKey) => ({
        locale: localeKey,
        ...translations[localeKey]
      }))
      .filter((translation) => translation.title.trim().length > 0);

    if (translationsPayload.length === 0) {
      setError("At least one language title is required.");
      return;
    }

    const payload = {
      slug,
      status,
      coverImageUrl: coverImageUrl || null,
      translations: translationsPayload
    };

    const response = await fetch(articleId ? `/api/content/articles/${articleId}` : "/api/content/articles", {
      method: articleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      router.push(`/${locale}/admin/content/articles`);
    } else {
      setError("Failed to save article. Check required fields.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Cover image</label>
              <Input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="uz">
            <TabsList>
              {locales.map((localeKey) => (
                <TabsTrigger key={localeKey} value={localeKey}>
                  {localeKey.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            {locales.map((localeKey) => (
              <TabsContent key={localeKey} value={localeKey}>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={translations[localeKey].title}
                      onChange={(event) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [localeKey]: { ...prev[localeKey], title: event.target.value }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Body</label>
                    <Textarea
                      value={translations[localeKey].body}
                      onChange={(event) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [localeKey]: { ...prev[localeKey], body: event.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">SEO title</label>
                      <Input
                        value={translations[localeKey].seoTitle}
                        onChange={(event) =>
                          setTranslations((prev) => ({
                            ...prev,
                            [localeKey]: { ...prev[localeKey], seoTitle: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">SEO description</label>
                      <Input
                        value={translations[localeKey].seoDescription}
                        onChange={(event) =>
                          setTranslations((prev) => ({
                            ...prev,
                            [localeKey]: { ...prev[localeKey], seoDescription: event.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          {articleId ? t("actions.update") : t("actions.create")}
        </Button>
      </div>
    </div>
  );
}
