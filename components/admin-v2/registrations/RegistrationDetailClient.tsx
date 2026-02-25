"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";

export function RegistrationDetailClient({ id }: { id: string }) {
  const [registration, setRegistration] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const router = useRouter();
  const t = useTranslations("admin");

  useEffect(() => {
    fetch(`/api/registrations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRegistration(data.data);
        setStatus(data.data?.status?.toLowerCase() ?? "new");
        setPaymentStatus(data.data?.paymentStatus?.toLowerCase() ?? "unpaid");
      });
  }, [id]);

  const handleSave = async () => {
    await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus })
    });
    router.refresh();
  };

  if (!registration) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{registration.participantName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">{registration.phone}</div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={registration.status.toLowerCase()} />
            <StatusBadge status={registration.paymentStatus.toLowerCase()} />
          </div>
          <div className="rounded-xl border border-border/60 bg-slate-50 p-4 text-sm">
            <div className="font-medium text-slate-900">Timeline</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>Created: {new Date(registration.createdAt).toLocaleString()}</li>
              <li>Updated: {new Date(registration.updatedAt).toLocaleString()}</li>
            </ul>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Payment</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave}>{t("actions.save")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
