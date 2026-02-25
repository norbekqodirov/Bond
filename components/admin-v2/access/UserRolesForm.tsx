"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function UserRolesForm({ userId }: { userId: string }) {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    const fetchData = async () => {
      const [rolesRes, usersRes] = await Promise.all([
        fetch("/api/rbac/roles"),
        fetch("/api/rbac/users")
      ]);
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      setRoles(rolesData.data ?? []);
      const user = (usersData.data ?? []).find((item: any) => item.id === userId);
      const current = new Set<string>();
      for (const item of user?.roles ?? []) {
        current.add(item.roleId ?? item.role?.id);
      }
      setSelected(current);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const toggleRole = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const save = async () => {
    await fetch(`/api/rbac/users/${userId}/roles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleIds: Array.from(selected) })
    });
    router.push(`/${locale}/admin/access/users`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center gap-2">
            <Checkbox checked={selected.has(role.id)} onCheckedChange={() => toggleRole(role.id)} />
            <Label>{role.name}</Label>
          </div>
        ))}
        <Button onClick={save}>{t("actions.save")}</Button>
      </CardContent>
    </Card>
  );
}
