"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";

type RegistrationItem = {
  id: string;
  participantName: string;
  phone: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  olympiad?: { translations: { locale: string; title: string }[] } | null;
};

export function RegistrationsPageClient() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  useEffect(() => {
    fetch("/api/registrations?scope=organizer")
      .then((res) => res.json())
      .then((data) => setRegistrations(data.data ?? []))
      .catch(() => setRegistrations([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Registrations" subtitle="Participants registered for your olympiads" />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Olympiad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No registrations yet.
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.participantName}</TableCell>
                    <TableCell>{item.olympiad?.translations?.[0]?.title ?? "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status.toLowerCase()} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.paymentStatus.toLowerCase()} />
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
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
