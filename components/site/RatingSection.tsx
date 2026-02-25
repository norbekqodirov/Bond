import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

const participants = [
  { id: 1, name: "Azizbek Umarov", school: "Samarkand Lyceum", points: 985 },
  { id: 2, name: "Madina Karimova", school: "Tashkent School 12", points: 970 },
  { id: 3, name: "Diyor Alljonov", school: "Nukus Academic Lyceum", points: 940 },
  { id: 4, name: "Laylo Ergasheva", school: "Navoiy IT School", points: 920 },
  { id: 5, name: "Sardor Rustamov", school: "Presidential School", points: 905 }
];

export function RatingSection() {
  const t = useTranslations("rating");
  const maxPoints = Math.max(...participants.map((item) => item.points));

  return (
    <section id="rating" className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
                {t("live")}
              </p>
              <h2 className="mt-3 text-2xl font-display font-semibold text-brand-primary sm:text-3xl">
                {t("title")}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Trophy className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      #{index + 1} {participant.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {participant.school}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-brand-primary">
                    {participant.points} {t("points")}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-brand-primary"
                    style={{ width: `${(participant.points / maxPoints) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h3 className="text-lg font-semibold text-slate-900">{t("subtitle")}</h3>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {t("note")}
          </p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("top")}
              </div>
              <div className="mt-3 text-2xl font-semibold text-brand-primary">985</div>
              <div className="mt-2 text-sm font-medium text-slate-500">
                {t("topLabel")}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("total")}
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">2 430</div>
              <div className="mt-2 text-sm font-medium text-slate-500">
                {t("totalLabel")}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("updated")}
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">
                {t("updatedValue")}
              </div>
              <div className="mt-2 text-sm font-medium text-slate-500">
                {t("updatedLabel")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
