"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type UserItem = {
  id: string;
  email: string;
  roles: { role: { name: string } }[];
};

export function UsersPageClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/rbac/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.data ?? []))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Assign roles and permissions" />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.roles.map((role) => role.role.name).join(", ") || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/admin/access/users/${user.id}`}>Manage roles</Link>
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
