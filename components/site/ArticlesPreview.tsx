import Link from "next/link";
import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/site/SectionTitle";

export type ArticlePreview = {
  slug: string;
  title: string;
  excerpt?: string | null;
  dateLabel?: string | null;
  coverImageUrl?: string | null;
};

export function ArticlesPreview({
  locale,
  articles
}: {
  locale: string;
  articles: ArticlePreview[];
}) {
  const t = useTranslations("articles");

  return (
    <section id="news" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <SectionTitle title={t("title")} align="left" showLabel={false} />
          <Link
            href={`/${locale}/articles`}
            className="rounded-full border border-brand-primary px-4 py-2 text-xs font-semibold text-brand-primary"
          >
            {t("viewAll")}
          </Link>
        </div>
        {articles.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 text-sm font-semibold text-slate-500">
            {t("empty")}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/articles/${article.slug}`}
                className="group rounded-[28px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/40 sm:p-6"
              >
                <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {article.coverImageUrl ? (
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-40 w-full object-cover sm:h-44"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-primary/10 via-white to-brand-accent/10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:h-44">
                      BOND
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                  {article.dateLabel ?? "TBD"}
                </p>
                <h3 className="mt-3 text-lg font-display font-semibold text-slate-900 group-hover:text-brand-primary sm:text-xl">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
