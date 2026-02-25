"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type OlympiadItem = {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  translations: { locale: string; title: string }[];
};

export function OlympiadsPageClient() {
  const [olympiads, setOlympiads] = useState<OlympiadItem[]>([]);
  const [query, setQuery] = useState("");
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/olympiads")
      .then((res) => res.json())
      .then((data) => setOlympiads(data.data ?? []))
      .catch(() => setOlympiads([]));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return olympiads;
    return olympiads.filter((item) =>
      item.translations.some((translation) =>
        translation.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [olympiads, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Olympiads"
        subtitle="Manage your olympiad listings"
        actions={
          <Button asChild>
            <Link href={`/${locale}/organizer/olympiads/new`}>Create</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No olympiads yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.translations[0]?.title ?? "Untitled"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status.toLowerCase()} />
                    </TableCell>
                    <TableCell>
                      {item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"} -{" "}
                      {item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${locale}/organizer/olympiads/${item.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
