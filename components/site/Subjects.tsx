import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/site/SectionTitle";

export function Subjects() {
  const t = useTranslations("subjects");
  const data = [
    {
      id: "english",
      title: t("english.title"),
      tagline: t("english.tagline"),
      items: t("english.items").split(", "),
      emoji: "📘",
      emojiLabel: "English"
    },
    {
      id: "math",
      title: t("math.title"),
      tagline: t("math.tagline"),
      items: t("math.items").split(", "),
      emoji: "🧮",
      emojiLabel: "Mathematics"
    },
    {
      id: "it",
      title: t("it.title"),
      tagline: t("it.tagline"),
      items: t("it.items").split(", "),
      emoji: "💻",
      emojiLabel: "IT & Coding"
    },
    {
      id: "mental",
      title: t("mental.title"),
      tagline: t("mental.tagline"),
      items: t("mental.items").split(", "),
      emoji: "🧠",
      emojiLabel: "Mental Arithmetic"
    }
  ];

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t("title")} showLabel={false} />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {data.map((subject) => {
            return (
              <div
                key={subject.id}
                className="group flex flex-col rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30 sm:p-8"
              >
                <div className="flex flex-col">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-primary/10 transition-transform group-hover:scale-110 sm:mb-6 sm:h-16 sm:w-16">
                    <span role="img" aria-label={subject.emojiLabel} className="text-2xl sm:text-3xl">
                      {subject.emoji}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-accent sm:text-xs">
                    {subject.tagline}
                  </span>
                  <h3 className="mt-2 text-xl font-display font-semibold text-brand-primary sm:text-2xl">
                    {subject.title}
                  </h3>
                </div>
                <ul className="mt-5 space-y-3 text-sm font-medium leading-relaxed text-slate-500">
                  {subject.items.map((item) => (
                    <li key={item} className="flex items-start break-words">
                      <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
