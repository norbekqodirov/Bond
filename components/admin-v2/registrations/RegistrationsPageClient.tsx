"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { registrationStatuses } from "@/lib/enums";

type Registration = {
  id: string;
  participantName: string;
  phone: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  event?: { translations: { title: string }[] } | null;
  olympiad?: { translations: { title: string }[] } | null;
};

type EventItem = {
  id: string;
  translations: { title: string }[];
};

export function RegistrationsPageClient() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [eventId, setEventId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const locale = useLocale();
  const t = useTranslations("admin");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.data ?? []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
    if (eventId) params.set("eventId", eventId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/registrations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRegistrations(data.data ?? []))
      .catch(() => setRegistrations([]));
  }, [status, paymentStatus, eventId, from, to]);

  const filtered = registrations.filter((reg) =>
    reg.participantName.toLowerCase().includes(query.toLowerCase())
  );

  const statusColumns = registrationStatuses.map((item) => item.toLowerCase());
  const grouped = statusColumns.map((statusKey) => ({
    statusKey,
    items: filtered.filter((reg) => reg.status.toLowerCase() === statusKey)
  }));

  const exportParams = new URLSearchParams();
  if (status !== "all") exportParams.set("status", status);
  if (paymentStatus !== "all") exportParams.set("paymentStatus", paymentStatus);
  if (eventId) exportParams.set("eventId", eventId);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrations"
        subtitle="Track applications and attendance"
        actions={
          eventId ? (
            <Button asChild variant="outline">
              <a href={`/api/registrations/export?${exportParams.toString()}`}>{t("actions.export")}</a>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {t("actions.export")}
            </Button>
          )
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-6">
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.translations?.[0]?.title ?? "Untitled"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              <Input
                placeholder="Search by name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!eventId}
              />
            <Select value={status} onValueChange={setStatus} disabled={!eventId}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={!eventId}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 md:col-span-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={!eventId} />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={!eventId} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
              <Button
                type="button"
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                disabled={!eventId}
              >
                List
              </Button>
              <Button
                type="button"
                variant={view === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("kanban")}
                disabled={!eventId}
              >
                Kanban
              </Button>
            </div>
          </div>
          {!eventId ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-muted-foreground">
              Select an event to view registrations.
            </div>
          ) : view === "kanban" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {grouped.map((column) => (
                <div key={column.statusKey} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {t(`status.${column.statusKey}`)}
                    </div>
                    <div className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                      {column.items.length}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {column.items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs text-muted-foreground">
                        No registrations.
                      </div>
                    ) : (
                      column.items.map((registration) => (
                        <div key={registration.id} className="rounded-2xl border border-slate-100 p-3 shadow-sm">
                          <div className="text-sm font-semibold text-slate-900">
                            {registration.participantName}
                          </div>
                          <div className="text-xs text-muted-foreground">{registration.phone}</div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {registration.event?.translations?.[0]?.title ??
                              registration.olympiad?.translations?.[0]?.title ??
                              "-"}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <StatusBadge status={registration.paymentStatus.toLowerCase()} />
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/${locale}/admin/registrations/${registration.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.participantName}
                      <div className="text-xs text-muted-foreground">{registration.phone}</div>
                    </TableCell>
                    <TableCell>
                      {registration.event?.translations?.[0]?.title ??
                        registration.olympiad?.translations?.[0]?.title ??
                        "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={registration.status.toLowerCase()} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={registration.paymentStatus.toLowerCase()} />
                    </TableCell>
                    <TableCell>{new Date(registration.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${locale}/admin/registrations/${registration.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
