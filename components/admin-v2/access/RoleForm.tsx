"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoleForm({ roleId }: { roleId?: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    const fetchData = async () => {
      const [permRes, roleRes] = await Promise.all([
        fetch("/api/rbac/permissions"),
        roleId ? fetch(`/api/rbac/roles/${roleId}`) : Promise.resolve(null)
      ]);

      const permData = await permRes.json();
      const grouped: Record<string, string[]> = {};
      for (const permission of permData.data ?? []) {
        if (!grouped[permission.module]) {
          grouped[permission.module] = [];
        }
        grouped[permission.module].push(permission.key);
      }
      setPermissions(grouped);

      if (roleRes) {
        const roleData = await roleRes.json();
        setName(roleData.data?.name ?? "");
        setDescription(roleData.data?.description ?? "");
        const current = new Set<string>();
        for (const item of roleData.data?.permissions ?? []) {
          current.add(item.permission.key);
        }
        setSelected(current);
      }

      setLoading(false);
    };

    fetchData();
  }, [roleId]);

  const togglePermission = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const payload = {
      name,
      description,
      permissionKeys: Array.from(selected)
    };

    const response = await fetch(roleId ? `/api/rbac/roles/${roleId}` : "/api/rbac/roles", {
      method: roleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      router.push(`/${locale}/admin/access/roles`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="text-sm font-medium">Role name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {Object.entries(permissions).map(([module, keys]) => (
            <div key={module} className="space-y-2">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">{module}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {keys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox checked={selected.has(key)} onCheckedChange={() => togglePermission(key)} />
                    <Label className="text-sm">{key}</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          {roleId ? t("actions.update") : t("actions.create")}
        </Button>
      </div>
    </div>
  );
}
