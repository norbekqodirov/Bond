import Link from "next/link";
import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/site/SectionTitle";

export function OfficialInfoPreview({ locale }: { locale: string }) {
  const t = useTranslations("official");

  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t("title")} align="left" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-medium text-slate-500">{t("subtitle")}</p>
            <div className="mt-6 space-y-4 text-sm font-semibold text-slate-700">
              <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {t("fullNameLabel")}
                </span>
                <span>{t("fullNameValue")}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {t("shortNameLabel")}
                </span>
                <span>{t("shortNameValue")}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {t("domainLabel")}
                </span>
                <span>{t("domainValue")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[32px] border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-white to-brand-accent/10 p-6 shadow-soft sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
                {t("title")}
              </p>
              <h3 className="mt-3 text-xl font-display font-semibold text-slate-900 sm:text-2xl">
                {t("subtitle")}
              </h3>
              <p className="mt-4 text-sm font-medium text-slate-500">
                {t("domainValue")}
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                href={`/${locale}/official`}
                className="rounded-full border border-brand-primary px-5 py-2 text-xs font-semibold text-brand-primary"
              >
                {t("title")}
              </Link>
              <Link
                href={`/${locale}/articles`}
                className="rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-soft"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
