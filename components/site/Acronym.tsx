import { Eye, Link2, Network, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function Acronym() {
  const t = useTranslations("acronym");
  const letters = [
    {
      char: "B",
      word: t("b.word"),
      translation: t("b.translation"),
      desc: t("b.desc"),
      Icon: Eye
    },
    {
      char: "O",
      word: t("o.word"),
      translation: t("o.translation"),
      desc: t("o.desc"),
      Icon: Link2
    },
    {
      char: "N",
      word: t("n.word"),
      translation: t("n.translation"),
      desc: t("n.desc"),
      Icon: Network
    },
    {
      char: "D",
      word: t("d.word"),
      translation: t("d.translation"),
      desc: t("d.desc"),
      Icon: TrendingUp
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#191e2b] via-[#1b2234] to-[#151a26] py-16 text-white sm:py-20 lg:py-24">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-[140px]" />
      <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-brand-accent/25 blur-[160px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-white sm:text-3xl md:text-5xl">
            {t("title")}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-accent" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {letters.map(({ char, word, translation, desc, Icon }) => (
            <div
              key={char}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur sm:p-6"
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-display font-semibold text-white/70 sm:text-4xl">
                    {char}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-white sm:text-sm">
                    <span>{word}</span>
                    <span className="text-white/50">-</span>
                    <span className="text-brand-accent">{translation}</span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-accent">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-white/70">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 w-full rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-center text-base font-display font-semibold text-white sm:px-10 sm:text-lg">
          {t("summary")}
        </div>
      </div>
    </section>
  );
}
