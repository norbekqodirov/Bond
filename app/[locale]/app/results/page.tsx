import { getTranslations } from "next-intl/server";

import type { Locale } from "@/lib/settings";

export default async function ResultsPage({ params }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "app" });

  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
      <h1 className="text-2xl font-semibold text-slate-900">{t("resultsTitle")}</h1>
      <p className="mt-2">{t("resultsComing")}</p>
    </div>
  );
}
