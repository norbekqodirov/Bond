"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type NotificationRow = {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  user?: { email: string | null; phone: string | null } | null;
};

export function NotificationsPageClient() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ scope: "all" });
    if (query) params.set("userId", query);
    fetch(`/api/notifications?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setItems(data.data ?? []))
      .catch(() => setItems([]));
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Server-driven notification log" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Filter by user id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>
                    {item.user?.email ?? "-"}
                    <div className="text-xs text-muted-foreground">{item.user?.phone ?? "-"}</div>
                  </TableCell>
                  <TableCell>{item.title ?? item.body ?? "-"}</TableCell>
                  <TableCell>{item.readAt ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
