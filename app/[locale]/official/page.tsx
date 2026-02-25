import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/settings";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings } from "@/lib/settings";

export default async function OfficialInfoPage({
  params
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations("official");
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 lg:px-8">
        <h1 className="text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base font-medium text-slate-500">
          {t("subtitle")}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("fullNameLabel")}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              {t("fullNameValue")}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("shortNameLabel")}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              {t("shortNameValue")}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("domainLabel")}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              {t("domainValue")}
            </p>
          </div>
          <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
              {t("title")}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              {settings.footer.domain}
            </p>
          </div>
        </div>
      </main>
      <Footer footer={settings.footer} contact={settings.contact} locale={params.locale} />
    </div>
  );
}
