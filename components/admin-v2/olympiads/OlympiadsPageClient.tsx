"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type OlympiadItem = {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  organizer?: { organization?: { name: string } | null } | null;
  translations: { locale: string; title: string }[];
};

export function OlympiadsPageClient() {
  const [olympiads, setOlympiads] = useState<OlympiadItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    fetch(`/api/olympiads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setOlympiads(data.data ?? []))
      .catch(() => setOlympiads([]));
  }, [status]);

  const filtered = useMemo(() => {
    if (!query) return olympiads;
    return olympiads.filter((item) =>
      item.translations.some((translation) =>
        translation.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [olympiads, query]);

  const handleCopyLink = async (id: string) => {
    const url = `${window.location.origin}/${locale}/register/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Olympiads"
        subtitle="Moderate olympiad listings"
        actions={
          <Button asChild>
            <Link href={`/${locale}/admin/olympiads/new`}>Create</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Link</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No olympiads found.
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
                    <TableCell>{item.organizer?.organization?.name ?? "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(item.id)}>
                        {copiedId === item.id ? "Copied" : "Copy link"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${locale}/admin/olympiads/${item.id}`}>Edit</Link>
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
