import { Layout, ShieldCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function GridDetails() {
  const t = useTranslations();
  const gradeGroups = ["1-4", "5-7", "8-9", "10-11"];

  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-8 flex items-center space-x-3">
              <div className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary sm:p-4">
                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg font-display font-semibold text-brand-primary sm:text-xl">
                {t("participants.title")}
              </h3>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {gradeGroups.map((group) => (
                <div
                  key={group}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center text-sm font-semibold text-brand-primary"
                >
                  {group}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-500">
              {t("participants.note")}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-brand-primary/15 bg-gradient-to-br from-brand-primary/10 via-white to-brand-primary/5 p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl" />
            <div className="mb-6 flex items-center space-x-3">
              <div className="rounded-2xl bg-brand-primary/15 p-3 text-brand-primary sm:p-4">
                <Layout className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg font-display font-semibold text-brand-primary sm:text-xl">
                {t("format.title")}
              </h3>
            </div>
            <ul className="mb-6 space-y-3 text-sm font-semibold text-slate-600">
              {[t("format.online"), t("format.offline"), t("format.staged")].map(
                (item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <span className="h-2 w-2 rounded-full bg-brand-accent" />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
            <div className="rounded-2xl border border-brand-primary/10 bg-white/70 p-4 text-sm font-semibold text-slate-600">
              {t("format.note")}
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-accent/20 bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-6 flex items-center space-x-3">
              <div className="rounded-2xl bg-brand-accent/20 p-3 text-brand-accent sm:p-4">
                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg font-display font-semibold text-brand-primary sm:text-xl">
                {t("scoring.title")}
              </h3>
            </div>
            <ul className="mb-6 space-y-3 text-sm font-semibold text-slate-600">
              {[t("scoring.item1"), t("scoring.item2"), t("scoring.item3")].map(
                (item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-accent" />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-brand-primary">
              {t("scoring.note")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
