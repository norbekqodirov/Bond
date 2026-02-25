"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin-v2/PageHeader";

export function SettingsPageClient() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [commissionRate, setCommissionRate] = useState("");
  const t = useTranslations("admin");

  const refresh = async () => {
    const res = await fetch("/api/content/settings");
    const data = await res.json();
    const map: Record<string, any> = {};
    for (const item of data.data ?? []) {
      map[item.key] = item.value;
    }
    setSettings(map);
    if (map.commissionRate !== undefined) {
      setCommissionRate(String(map.commissionRate));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    await fetch("/api/content/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "commissionRate", value: Number(commissionRate) })
    });
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Marketplace configuration" />
      <Card>
        <CardHeader>
          <CardTitle>Commission rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={commissionRate} onChange={(event) => setCommissionRate(event.target.value)} />
          <Button onClick={save}>{t("actions.save")}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current settings snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
