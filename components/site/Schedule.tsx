import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateRange, getRegistrationWindow, type OlympiadLike } from "@/lib/olympiad";
import { localizeField } from "@/lib/localize";
import type { Locale } from "@/lib/settings";
import { ScheduleFilters } from "@/components/site/ScheduleFilters";

type ScheduleItem = OlympiadLike & {
  id: string;
  type?: string | null;
  subject?: string | null;
  format?: string | null;
  date_start?: Date | null;
  date_end?: Date | null;
  location?: string | null;
  translations?: {
    locale: string;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
  }[];
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  location_uz?: string;
  location_ru?: string;
  location_en?: string;
  city?: string | null;
};

export function Schedule({
  olympiads,
  locale,
  filters
}: {
  olympiads: ScheduleItem[];
  locale: Locale;
  filters: {
    subject?: string;
    grade_group?: string;
    format?: string;
  };
}) {
  const t = useTranslations("schedule");
  const enumT = useTranslations("enum");
  const formatTypeLabel = (value?: string | null) => {
    if (!value) return "-";
    const lower = value.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <section id="schedule" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
          <h2 className="text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-5xl">
            {t("title")}
          </h2>
          <Badge className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary">
            {t("note")}
          </Badge>
        </div>

        <ScheduleFilters
          subject={filters.subject}
          grade_group={filters.grade_group}
          format={filters.format}
        />

        <div className="overflow-x-auto rounded-[32px] border border-slate-100 bg-white shadow-soft">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("header.name")}</TableHead>
                <TableHead>{t("header.subject")}</TableHead>
                <TableHead>{t("header.format")}</TableHead>
                <TableHead>{t("header.date")}</TableHead>
                <TableHead>{t("header.location")}</TableHead>
                <TableHead>{t("header.status")}</TableHead>
                <TableHead className="text-right whitespace-nowrap">{t("header.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {olympiads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">
                    {t("note")}
                  </TableCell>
                </TableRow>
              ) : (
                olympiads.map((olympiad) => {
                  const status = getRegistrationWindow(olympiad);
                  const statusText = t(`status.${status}`);
                  const subjectLabel = olympiad.subject
                    ? enumT(`subject.${olympiad.subject}`)
                    : olympiad.type
                    ? enumT(`eventType.${olympiad.type}`)
                    : formatTypeLabel(olympiad.type);
                  const formatLabel = olympiad.format
                    ? enumT(`format.${olympiad.format}`)
                    : "-";
                  return (
                    <TableRow key={olympiad.id}>
                      <TableCell className="font-semibold text-slate-800">
                        {localizeField(olympiad, "title", locale)}
                      </TableCell>
                      <TableCell>{subjectLabel}</TableCell>
                      <TableCell>{formatLabel}</TableCell>
                      <TableCell>
                        {formatDateRange(locale, olympiad.date_start, olympiad.date_end)}
                      </TableCell>
                      <TableCell>{localizeField(olympiad, "location", locale)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            status === "open"
                              ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
                              : status === "closed"
                              ? "border-slate-200 bg-slate-100 text-slate-500"
                              : "border-brand-primary/25 bg-brand-primary/10 text-brand-primary"
                          }
                        >
                          {statusText}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/${locale}/register/${olympiad.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-brand-primary px-4 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5 whitespace-nowrap"
                          >
                            {t("cta")}
                          </Link>
                          <Link
                            href={`/${locale}/register/${olympiad.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-brand-primary/30 hover:text-brand-primary whitespace-nowrap"
                          >
                            {t("details")}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

