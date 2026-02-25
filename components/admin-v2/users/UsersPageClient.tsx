"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
};

export function UsersPageClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    fetch(`/api/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.data ?? []))
      .catch(() => setUsers([]));
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Mobile and admin accounts" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Search by email or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.email ?? "-"}
                    <div className="text-xs text-muted-foreground">{user.phone ?? "-"}</div>
                  </TableCell>
                  <TableCell>{user.roles.join(", ") || "-"}</TableCell>
                  <TableCell>{user.isActive ? "Active" : "Disabled"}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
