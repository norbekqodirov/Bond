"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin-v2/PageHeader";

const locales = ["uz", "ru", "en"] as const;

type Block = {
  id: string;
  code: string;
  translations: { locale: string; data: Record<string, any> }[];
};

export function SiteBlocksPageClient() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selected, setSelected] = useState<Block | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const t = useTranslations("admin");

  const refresh = async () => {
    const res = await fetch("/api/content/site-blocks");
    const data = await res.json();
    setBlocks(data.data ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSelect = (block: Block) => {
    setSelected(block);
    const next: Record<string, any> = {};
    for (const localeKey of locales) {
      const translation = block.translations.find((item) => item.locale.toLowerCase() === localeKey);
      next[localeKey] = translation?.data ?? { title: "", body: "" };
    }
    setDraft(next);
  };

  const updateBlock = async () => {
    if (!selected) return;
    const payload = {
      translations: locales.map((localeKey) => ({
        locale: localeKey,
        data: draft[localeKey] ?? {}
      }))
    };
    await fetch(`/api/content/site-blocks/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Site blocks" subtitle="Edit hero, about, footer content" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="space-y-2 pt-6">
            {blocks.map((block) => (
              <Button
                key={block.id}
                variant={selected?.id === block.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleSelect(block)}
              >
                {block.code}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {selected ? (
              <div className="space-y-4">
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
                      <div className="space-y-3">
                        <Input
                          placeholder="Title"
                          value={draft[localeKey]?.title ?? ""}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [localeKey]: { ...prev[localeKey], title: event.target.value }
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Body"
                          value={draft[localeKey]?.body ?? ""}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [localeKey]: { ...prev[localeKey], body: event.target.value }
                            }))
                          }
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <Button onClick={updateBlock}>{t("actions.save")}</Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Select a block to edit.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
