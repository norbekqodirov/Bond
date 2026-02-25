"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type Settlement = {
  gross: number;
  commissionRate: number;
  commission: number;
  net: number;
};

export function SettlementPageClient() {
  const [data, setData] = useState<Settlement | null>(null);

  useEffect(() => {
    fetch("/api/finance/settlement")
      .then((res) => res.json())
      .then((payload) => setData(payload))
      .catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Settlement" subtitle="Commission and payout summary" />
      <Card>
        <CardHeader>
          <CardTitle>Current period</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-muted-foreground">Gross</div>
            <div className="text-2xl font-semibold">{data ? data.gross.toFixed(2) : "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Commission rate</div>
            <div className="text-2xl font-semibold">{data ? `${data.commissionRate * 100}%` : "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Commission</div>
            <div className="text-2xl font-semibold">{data ? data.commission.toFixed(2) : "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Net payout</div>
            <div className="text-2xl font-semibold">{data ? data.net.toFixed(2) : "-"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
