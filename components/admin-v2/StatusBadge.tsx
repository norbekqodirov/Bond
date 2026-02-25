"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const t = useTranslations("admin");
  let label = status;
  try {
    label = t(`status.${normalized}`);
  } catch {
    label = status;
  }
  if (["published", "paid", "approved", "confirmed", "results_ready"].includes(normalized)) {
    return <Badge variant="success">{label}</Badge>;
  }
  if (["pending"].includes(normalized)) {
    return <Badge variant="warning">{label}</Badge>;
  }
  if (["archived", "cancelled", "rejected", "refunded", "failed"].includes(normalized)) {
    return <Badge variant="danger">{label}</Badge>;
  }
  return <Badge variant="secondary">{label}</Badge>;
}
