import { Award, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AboutSetting, Locale } from "@/lib/settings";
import { localizeSetting } from "@/lib/localize";

export function About({
  about,
  locale
}: {
  about: AboutSetting;
  locale: Locale;
}) {
  const t = useTranslations("about");
  const sideT = useTranslations("aboutSide");
  const officialT = useTranslations("official");
  const paragraphs = about.body[locale] ?? about.body.uz;

  return (
    <section id="about" className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-5xl">
            {localizeSetting(about.title, locale) ?? t("title")}
          </h2>
          <div className="mt-4 h-1 w-12 rounded-full bg-brand-primary sm:w-16" />
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-display font-semibold leading-snug text-brand-primary">
                {localizeSetting(about.quote, locale) ?? t("quote")}
              </h3>
            </div>
            <div className="mt-5 space-y-4 text-sm font-medium leading-relaxed text-slate-600">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-brand-primary/15 bg-brand-primary/5 p-4 text-sm font-semibold text-brand-primary">
              {localizeSetting(about.highlight, locale) ?? t("highlight")}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-900">
                {sideT("officialTitle")}
              </h3>
            </div>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {officialT("fullNameLabel")}
                </p>
                <p className="mt-1 text-slate-800">
                  {officialT("fullNameValue")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {officialT("shortNameLabel")}
                </p>
                <p className="mt-1 text-slate-800">
                  {officialT("shortNameValue")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {sideT("serviceLabel")}
                </p>
                <p className="mt-1 text-slate-800">
                  {sideT("serviceValue")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-900">
                {sideT("card1Title")}
              </h3>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {sideT("card1Text")}
            </p>
          </div>

          <div className="rounded-[32px] border border-brand-primary/20 bg-brand-primary/5 p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/20 text-brand-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-900">
                {sideT("card2Title")}
              </h3>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {sideT("card2Text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
