import { Award, BadgeCheck, CheckCircle2, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

export function AwardsAndWhy() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="absolute right-0 top-0 -z-10 h-60 w-60 rounded-full bg-brand-primary/10 blur-[120px]" />
      <div className="absolute left-0 top-20 -z-10 h-72 w-72 rounded-full bg-brand-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-[32px] border border-slate-100 bg-slate-50 p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
                  {t("awards.title")}
                </p>
                <h2 className="mt-3 text-xl font-display font-semibold text-slate-900 sm:text-2xl">
                  {t("awards.title")}
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent sm:h-12 sm:w-12">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {[t("awards.item1"), t("awards.item2"), t("awards.item3")].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent sm:h-12 sm:w-12">
                      <Award className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-primary/15 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  {t("why.title")}
                </p>
                <h2 className="mt-3 text-xl font-display font-semibold text-slate-900 sm:text-2xl">
                  {t("why.title")}
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary sm:h-12 sm:w-12">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              {[
                t("why.item1"),
                t("why.item2"),
                t("why.item3"),
                t("why.item4"),
                t("why.item5")
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
