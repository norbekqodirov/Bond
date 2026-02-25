import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizeField } from "@/lib/localize";
import { getSiteSettings, type Locale } from "@/lib/settings";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export async function generateMetadata({
  params
}: {
  params: { locale: Locale; slug: string };
}) {
  let article: Awaited<ReturnType<typeof prisma.article.findUnique>> = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { translations: true }
    });
  } catch (error) {
    console.error("Failed to load article metadata.", error);
    return {};
  }

  if (!article || article.status !== "PUBLISHED") {
    return {};
  }

  const title =
    localizeField(article, "seo_title", params.locale) ??
    localizeField(article, "title", params.locale) ??
    undefined;
  const description =
    localizeField(article, "seo_description", params.locale) ??
    localizeField(article, "excerpt", params.locale) ??
    undefined;

  return {
    title,
    description
  };
}

export default async function ArticleDetailPage({
  params
}: {
  params: { locale: Locale; slug: string };
}) {
  const locale = params.locale;
  const t = await getTranslations("articles");
  const settings = await getSiteSettings();
  let article: Awaited<ReturnType<typeof prisma.article.findUnique>> = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { translations: true }
    });
  } catch (error) {
    console.error("Failed to load article detail.", error);
    notFound();
  }

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const title = localizeField(article, "title", locale) ?? "";
  const content = localizeField(article, "content", locale) ?? "";
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
          {article.createdAt ? dateFormatter.format(article.createdAt) : "TBD"}
        </p>
        <h1 className="mt-4 text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-5xl">
          {title}
        </h1>
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={title}
              className="h-52 w-full object-cover sm:h-72"
              loading="lazy"
            />
          ) : (
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-brand-primary/10 via-white to-brand-accent/10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:h-72">
              BOND
            </div>
          )}
        </div>
        <div className="mt-8 space-y-6 text-base font-medium leading-relaxed text-slate-600">
          {content
            .split("\n\n")
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
      </main>
      <Footer footer={settings.footer} contact={settings.contact} locale={locale} />
    </div>
  );
}
