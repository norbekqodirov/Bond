import Image from "next/image";
import { Award, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HeroSetting, Locale } from "@/lib/settings";
import { localizeSetting } from "@/lib/localize";

export function Hero({
  hero,
  locale
}: {
  hero: HeroSetting;
  locale: Locale;
}) {
  const t = useTranslations("hero");
  const titleText = localizeSetting(hero.title, locale) ?? t("title");
  const [headline, subline] = titleText.split(" - ", 2);

  return (
    <section className="relative overflow-hidden bg-white pb-12 pt-24 sm:pt-28 md:pb-16 md:pt-32 lg:pt-36">
      <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-slate-50 via-white to-white" />
      <div className="absolute right-12 top-24 -z-10 h-56 w-56 rounded-full bg-brand-primary/10 blur-[120px]" />
      <div className="absolute left-16 top-32 -z-10 h-40 w-40 rounded-full bg-brand-accent/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex h-full flex-col">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
              <Award className="h-4 w-4" />
              <span>{localizeSetting(hero.badge, locale) ?? t("badge")}</span>
            </div>
            <h1 className="mt-6 text-3xl font-display font-semibold tracking-tight text-brand-primary sm:text-4xl md:text-6xl">
              {headline}
              {subline ? (
                <span className="mt-4 block text-xl font-semibold text-brand-accent sm:text-2xl md:text-3xl">
                  {subline}
                </span>
              ) : null}
            </h1>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-600 md:text-lg">
              {localizeSetting(hero.subtitle, locale)}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#schedule"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-primary px-8 py-4 text-sm font-semibold text-brand-primary transition-all hover:bg-brand-primary/5"
              >
                {t("cta.schedule")}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#registration"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-8 py-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-accent"
              >
                {t("cta.register")}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                {t("meta.trusted")}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                {t("meta.transparent")}
              </div>
            </div>
          </div>

          <div className="relative flex h-full items-stretch justify-center lg:justify-end">
            <div className="absolute -right-6 top-10 -z-10 h-64 w-64 rounded-full bg-brand-primary/10 blur-[120px]" />
            <div className="absolute right-10 bottom-6 -z-10 h-40 w-40 rounded-full bg-brand-accent/20 blur-[120px]" />
            <div className="relative h-full w-full max-w-[360px] sm:max-w-[420px] lg:w-[min(520px,42vw)] lg:max-w-[520px] lg:translate-x-6">
              <Image
                src="/img/icons/trophy.png"
                alt="Trophy"
                width={560}
                height={560}
                quality={100}
                unoptimized
                className="h-full w-auto object-contain drop-shadow-[0_25px_45px_rgba(15,23,42,0.15)] motion-safe:animate-float"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
