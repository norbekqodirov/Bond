"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formats, gradeGroups, subjects } from "@/lib/enums";
import { NativeSelect } from "@/components/ui/native-select";

export function ScheduleFilters({
  subject,
  grade_group,
  format
}: {
  subject?: string;
  grade_group?: string;
  format?: string;
}) {
  const t = useTranslations("schedule");
  const enumT = useTranslations("enum");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    const next = `${pathname}${query ? `?${query}` : ""}#schedule`;
    startTransition(() => router.replace(next));
  };

  return (
    <div className="mb-6 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50 p-3 sm:mb-8 sm:gap-4 sm:p-4 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("filters.subject")}
        </label>
        <NativeSelect
          value={subject ?? "all"}
          onChange={(event) => updateParam("subject", event.target.value)}
        >
          <option value="all">{t("filters.all")}</option>
          {subjects.map((item) => (
            <option key={item} value={item}>
              {enumT(`subject.${item}`)}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("filters.grade")}
        </label>
        <NativeSelect
          value={grade_group ?? "all"}
          onChange={(event) => updateParam("grade_group", event.target.value)}
        >
          <option value="all">{t("filters.all")}</option>
          {gradeGroups.map((item) => (
            <option key={item} value={item}>
              {enumT(`grade.${item}`)}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("filters.format")}
        </label>
        <NativeSelect
          value={format ?? "all"}
          onChange={(event) => updateParam("format", event.target.value)}
        >
          <option value="all">{t("filters.all")}</option>
          {formats.map((item) => (
            <option key={item} value={item}>
              {enumT(`format.${item}`)}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
