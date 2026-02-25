import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizeField } from "@/lib/localize";
import { getSiteSettings, type Locale } from "@/lib/settings";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export default async function ArticlesPage({
  params
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const t = await getTranslations("articles");
  const settings = await getSiteSettings();
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: true },
    orderBy: { createdAt: "desc" }
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 lg:px-8">
        <h1 className="text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-5xl">
          {t("title")}
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {articles.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 text-sm font-semibold text-slate-500">
              {t("empty")}
            </div>
          ) : (
            articles.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/articles/${article.slug}`}
                className="group rounded-[28px] border border-slate-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/40 sm:p-6"
              >
                <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {article.coverImageUrl ? (
                    <img
                      src={article.coverImageUrl}
                      alt={localizeField(article, "title", locale) ?? "Article"}
                      className="h-40 w-full object-cover sm:h-48"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-primary/10 via-white to-brand-accent/10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:h-48">
                      BOND
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                  {article.createdAt ? dateFormatter.format(article.createdAt) : "TBD"}
                </p>
                <h2 className="mt-3 text-lg font-display font-semibold text-slate-900 group-hover:text-brand-primary sm:text-xl">
                  {localizeField(article, "title", locale) ?? ""}
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  {localizeField(article, "excerpt", locale)}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
      <Footer footer={settings.footer} contact={settings.contact} locale={locale} />
    </div>
  );
}
