"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: { permission: { key: string } }[];
};

export function RolesPageClient() {
  const [roles, setRoles] = useState<Role[]>([]);
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    fetch("/api/rbac/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data.data ?? []))
      .catch(() => setRoles([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        subtitle="Configure permissions by role"
        actions={
          <Button asChild>
            <Link href={`/${locale}/admin/access/roles/new`}>{t("actions.create")}</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description ?? "-"}</TableCell>
                  <TableCell>{role.permissions?.length ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/admin/access/roles/${role.id}`}>Edit</Link>
                    </Button>
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
