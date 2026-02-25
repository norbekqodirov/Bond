"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  registration: { participantName: string };
};

export function TransactionsPageClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("all");
  const t = useTranslations("admin");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    fetch(`/api/finance/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.data ?? []))
      .catch(() => setTransactions([]));
  }, [status]);

  const refund = async (id: string) => {
    await fetch(`/api/finance/transactions/${id}/refund`, { method: "POST" });
    const res = await fetch(`/api/finance/transactions`);
    const data = await res.json();
    setTransactions(data.data ?? []);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Track payments and refunds" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.registration?.participantName ?? "-"}</TableCell>
                  <TableCell>
                    {tx.amount} {tx.currency}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status.toLowerCase()} />
                  </TableCell>
                  <TableCell className="capitalize">{tx.provider.toLowerCase()}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => refund(tx.id)}>
                      {t("actions.refund")}
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
