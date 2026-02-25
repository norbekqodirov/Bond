"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, Pencil, CopyPlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type EventItem = {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  organizerOrg?: { id: string; name: string } | null;
  translations: { locale: string; title: string }[];
  createdAt?: string;
};

type OlympiadItem = {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  organizer?: { id: string; organization?: { name: string } | null } | null;
  translations: { locale: string; title: string }[];
  createdAt?: string;
};

type UnifiedEvent = {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  organizerName: string;
  organizerId?: string | null;
  organizerOrgId?: string | null;
  translations: { locale: string; title: string }[];
  createdAt?: string;
  source: "event" | "olympiad";
};

export function EventsPageClient() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [organizerOrgId, setOrganizerOrgId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);
    if (organizerOrgId) params.set("organizerOrgId", organizerOrgId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const olympiadParams = new URLSearchParams();
    if (status !== "all") olympiadParams.set("status", status);
    if (type !== "all") olympiadParams.set("type", type);

    const shouldLoadOlympiads = type === "all" || type === "olympiad";

    Promise.all([
      fetch(`/api/events?${params.toString()}`).then((res) => res.json()),
      shouldLoadOlympiads
        ? fetch(`/api/olympiads?${olympiadParams.toString()}`).then((res) => res.json())
        : Promise.resolve({ data: [] })
    ])
      .then(([eventRes, olympiadRes]) => {
        const eventItems: UnifiedEvent[] = (eventRes.data ?? []).map((event: EventItem) => ({
          id: event.id,
          type: event.type,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate,
          organizerName: event.organizerOrg?.name ?? "-",
          organizerOrgId: event.organizerOrg?.id ?? null,
          translations: event.translations,
          createdAt: event.createdAt,
          source: "event"
        }));

        const olympiadItems: UnifiedEvent[] = (olympiadRes.data ?? []).map(
          (olympiad: OlympiadItem) => ({
            id: olympiad.id,
            type: olympiad.type,
            status: olympiad.status,
            startDate: olympiad.startDate,
            endDate: olympiad.endDate,
            organizerName: olympiad.organizer?.organization?.name ?? "-",
            organizerId: olympiad.organizer?.id ?? null,
            translations: olympiad.translations,
            createdAt: olympiad.createdAt,
            source: "olympiad"
          })
        );

        const merged = [...eventItems, ...olympiadItems]
          .filter((item) =>
            organizerOrgId
              ? item.organizerOrgId === organizerOrgId || item.organizerId === organizerOrgId
              : true
          )
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });

        setEvents(merged);
      })
      .catch(() => setEvents([]));
  }, [status, type, organizerOrgId, from, to, refreshKey]);

  const filtered = useMemo(() => {
    if (!query) return events;
    return events.filter((event) =>
      event.translations.some((translation) =>
        translation.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [events, query]);

  const handleDuplicate = async (id: string) => {
    await fetch(`/api/events/${id}/duplicate`, { method: "POST" });
    setRefreshKey((value) => value + 1);
  };

  const handleCopyLink = async (id: string) => {
    const url = `${window.location.origin}/${locale}/register/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (item: UnifiedEvent, nextStatus: string) => {
    const endpoint =
      item.source === "olympiad" ? `/api/olympiads/${item.id}` : `/api/events/${item.id}`;
    await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    setRefreshKey((value) => value + 1);
  };

  const handleDelete = async (item: UnifiedEvent) => {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;
    const endpoint =
      item.source === "olympiad" ? `/api/olympiads/${item.id}` : `/api/events/${item.id}`;
    await fetch(endpoint, { method: "DELETE" });
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Manage olympiads, contests, camps, and travel"
        actions={
          <Button asChild>
            <Link href={`/${locale}/admin/events/new`}>{t("actions.create")}</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Input
              placeholder="Organizer ID"
              value={organizerOrgId}
              onChange={(e) => setOrganizerOrgId(e.target.value)}
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="olympiad">Olympiad</SelectItem>
                <SelectItem value="contest">Contest</SelectItem>
                <SelectItem value="camp">Camp</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="flex gap-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((event) => (
                <TableRow key={`${event.source}-${event.id}`}>
                  <TableCell className="font-medium">
                    {event.translations[0]?.title ?? "Untitled"}
                  </TableCell>
                  <TableCell className="capitalize">{event.type.toLowerCase()}</TableCell>
                  <TableCell>
                    <Select
                      value={event.status.toLowerCase()}
                      onValueChange={(value) => handleStatusChange(event, value)}
                    >
                      <SelectTrigger className="h-9 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : "-"} - {event.endDate ? new Date(event.endDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{event.organizerName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title={t("actions.update")}>
                        <Link
                          href={
                            event.source === "olympiad"
                              ? `/${locale}/admin/olympiads/${event.id}`
                              : `/${locale}/admin/events/${event.id}`
                          }
                          aria-label={t("actions.update")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyLink(event.id)}
                        title="Copy registration link"
                        aria-label="Copy registration link"
                      >
                        {copiedId === event.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      {event.source === "event" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(event.id)}
                          title={t("actions.duplicate")}
                          aria-label={t("actions.duplicate")}
                        >
                          <CopyPlus className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event)}
                        title={t("actions.remove")}
                        aria-label={t("actions.remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
