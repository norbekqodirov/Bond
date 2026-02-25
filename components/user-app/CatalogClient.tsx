"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  Calculator,
  Type,
  Laptop,
  Brain,
  Tent,
  Plane
} from "lucide-react";

import { cn } from "@/lib/utils";

type CatalogItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  type?: string | null;
  subject?: string | null;
  subjects?: string[] | null;
  format?: string | null;
  city?: string | null;
  price?: number | null;
  currency?: string | null;
  coverImageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type ArticleItem = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
};

type Props = {
  items: CatalogItem[];
  articles: ArticleItem[];
  registrationMap: Record<string, string>;
};

const categoryItems = [
  { key: "math", icon: Calculator, subject: "MATH" },
  { key: "english", icon: Type, subject: "ENGLISH" },
  { key: "it", icon: Laptop, subject: "IT" },
  { key: "mental", icon: Brain, subject: "MENTAL" },
  { key: "camp", icon: Tent, type: "camp" },
  { key: "travel", icon: Plane, type: "travel" }
];

function formatDateRange(locale: string, start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  if (startDate && endDate && startDate.toDateString() !== endDate.toDateString()) {
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }
  return formatter.format(startDate ?? endDate ?? new Date());
}

export function CatalogClient({ items, articles, registrationMap }: Props) {
  const t = useTranslations("app");
  const enumT = useTranslations("enum");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [region, setRegion] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !item.title.toLowerCase().includes(query)) return false;
      if (category) {
        const categoryItem = categoryItems.find((cat) => cat.key === category);
        if (categoryItem?.subject) {
          const matchesSubject =
            item.subject === categoryItem.subject ||
            (Array.isArray(item.subjects) && item.subjects.includes(categoryItem.subject));
          if (!matchesSubject) return false;
        }
        if (categoryItem?.type && item.type?.toLowerCase() !== categoryItem.type) return false;
      }
      if (region.trim()) {
        const value = region.trim().toLowerCase();
        const target = (item.city ?? "").toLowerCase();
        if (!target.includes(value)) return false;
      }
      const priceValue = item.price ?? 0;
      if (minPrice && priceValue < Number(minPrice)) return false;
      if (maxPrice && priceValue > Number(maxPrice)) return false;
      return true;
    });
  }, [items, search, category, region, minPrice, maxPrice]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("catalogSearch")}
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder={t("region")}
              className="w-40 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
            />
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder={t("minPrice")}
              className="w-28 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder={t("maxPrice")}
              className="w-28 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
            />
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t("bannerTitle")}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {articles.map((article) => (
            <div
              key={article.id}
              className="relative h-44 w-72 shrink-0 overflow-hidden rounded-3xl bg-slate-900 text-white"
            >
              {article.coverImageUrl ? (
                <img src={article.coverImageUrl} alt={article.title} className="h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-sm font-semibold">
                {article.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t("categories")}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categoryItems.map((item) => {
            const Icon = item.icon;
            const active = category === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(active ? null : item.key)}
                className={cn(
                  "flex min-w-[110px] items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-soft transition",
                  active ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary" : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500",
                    active ? "bg-white text-brand-primary" : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {t(`category.${item.key}`)}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t("olympiadList")}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const paymentStatus = registrationMap[item.id];
            const isRegistered = Boolean(paymentStatus);
            const typeKey = item.type ? item.type.toString().toUpperCase() : null;
            const typeLabel = typeKey ? enumT(`eventType.${typeKey}`) : t("eventSubtitle");
            return (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
                <div className="relative h-44 bg-slate-900">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase text-white">
                    {typeLabel}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500">{item.subtitle ?? t("eventSubtitle")}</div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDateRange(locale, item.startDate, item.endDate)}
                    {item.city ? ` - ${item.city}` : ""}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.price ? `${item.price} ${item.currency ?? "UZS"}` : t("free")}
                    </div>
                    {isRegistered ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {paymentStatus?.toLowerCase() === "paid" ? t("paid") : t("registered")}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={`/${locale}/register/${item.id}`}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-wide transition",
                      isRegistered
                        ? "bg-slate-100 text-slate-400 pointer-events-none"
                        : "bg-brand-primary text-white hover:bg-brand-accent"
                    )}
                  >
                    {isRegistered ? t("registered") : t("cta")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
