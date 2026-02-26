import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";
import { getSiteSettings, type Locale } from "@/lib/settings";
import { localizeField } from "@/lib/localize";
import { formatDateRange } from "@/lib/olympiad";
import { formats, gradeGroups, subjects } from "@/lib/enums";
import type { Format, GradeGroup, Subject } from "@/lib/enums";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Acronym } from "@/components/site/Acronym";
import { Subjects } from "@/components/site/Subjects";
import { GridDetails } from "@/components/site/GridDetails";
import { AwardsAndWhy } from "@/components/site/AwardsAndWhy";
import { Schedule } from "@/components/site/Schedule";
import { Registration } from "@/components/site/Registration";
import { ArticlesPreview } from "@/components/site/ArticlesPreview";
import { OlympiadBannerCarousel } from "@/components/site/OlympiadBannerCarousel";
import { RatingSection } from "@/components/site/RatingSection";
import { Footer } from "@/components/site/Footer";

type SearchParams = {
  subject?: string | string[];
  grade_group?: string | string[];
  format?: string | string[];
  olympiad?: string | string[];
};

type TranslationRecord = {
  locale: string;
  [key: string]: unknown;
};

type LocalizedFields = {
  uz: string;
  ru: string;
  en: string;
};

const safeParam = (value?: string | string[]) =>
  typeof value === "string" ? value : undefined;

function mapTranslations(translations: TranslationRecord[], key: string): LocalizedFields {
  const result: LocalizedFields = { uz: "", ru: "", en: "" };
  for (const translation of translations) {
    const locale = translation.locale?.toString().toLowerCase();
    if (locale === "uz" || locale === "ru" || locale === "en") {
      const value = translation[key];
      if (typeof value === "string") {
        result[locale] = value;
      }
    }
  }
  return result;
}

export default async function HomePage({
  params,
  searchParams
}: {
  params: { locale: Locale };
  searchParams?: SearchParams;
}) {
  const locale = params.locale;
  const subject = safeParam(searchParams?.subject);
  const grade_group = safeParam(searchParams?.grade_group);
  const format = safeParam(searchParams?.format);
  const selectedOlympiadId = safeParam(searchParams?.olympiad);

  const filters: {
    subject?: Subject;
    grade_group?: GradeGroup;
    format?: Format;
  } = {
    subject: subject && subjects.includes(subject as Subject) ? (subject as Subject) : undefined,
    grade_group:
      grade_group && gradeGroups.includes(grade_group as GradeGroup)
        ? (grade_group as GradeGroup)
        : undefined,
    format: format && formats.includes(format as Format) ? (format as Format) : undefined
  };

  const settings = await getSiteSettings();
  let olympiads: Awaited<ReturnType<typeof prisma.olympiad.findMany>> = [];
  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  if (isDatabaseConfigured()) {
    try {
      [olympiads, events, articles] = await Promise.all([
        prisma.olympiad.findMany({
          where: { status: "PUBLISHED" },
          include: { translations: true },
          orderBy: { createdAt: "desc" }
        }),
        prisma.event.findMany({
          where: { status: "PUBLISHED" },
          include: { translations: true },
          orderBy: { createdAt: "desc" }
        }),
        prisma.article.findMany({
          where: { status: "PUBLISHED" },
          include: { translations: true },
          orderBy: { createdAt: "desc" },
          take: 3
        })
      ]);
    } catch (error) {
      console.error("Failed to load homepage data. Rendering with fallback content.", error);
    }
  }

  const olympiadRows = olympiads.map((olympiad) => {
    const titles = mapTranslations(olympiad.translations as TranslationRecord[], "title");
    const location = olympiad.location ?? olympiad.region ?? "TBD";
    const status = olympiad.status === "ARCHIVED" ? "ARCHIVED" : "PUBLISHED";

    return {
      id: olympiad.id,
      type: olympiad.type,
      title_uz: titles.uz,
      title_ru: titles.ru,
      title_en: titles.en,
      location_uz: location,
      location_ru: location,
      location_en: location,
      subject: olympiad.subject,
      grade_group: olympiad.gradeGroup,
      format: olympiad.format,
      date_start: olympiad.startDate,
      date_end: olympiad.endDate,
      registration_deadline: olympiad.startDate,
      status
    };
  });

  const scheduleOlympiads = olympiadRows.filter((item) => {
    if (filters.subject && item.subject !== filters.subject) {
      return false;
    }
    if (filters.grade_group && item.grade_group !== filters.grade_group) {
      return false;
    }
    if (filters.format && item.format !== filters.format) {
      return false;
    }
    return true;
  });

  const allOlympiads = olympiadRows;
  const hasFilters = Boolean(filters.subject || filters.grade_group || filters.format);

  const scheduleEvents = events.map((event) => ({
    id: event.id,
    type: event.type,
    status: event.status,
    subjects: event.subjects ?? [],
    translations: event.translations,
    city: event.city ?? event.address ?? "TBD",
    date_start: event.startDate,
    date_end: event.endDate,
    registration_deadline: event.startDate,
    createdAt: event.createdAt
  }));

  const filteredEvents = scheduleEvents.filter((event) => {
    if (filters.grade_group || filters.format) {
      return false;
    }
    if (filters.subject && !event.subjects?.includes(filters.subject as Subject)) {
      return false;
    }
    return true;
  });

  const scheduleItems = [
    ...scheduleOlympiads,
    ...filteredEvents
  ];

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const articleRecords = articles.map((article) => {
    const titles = mapTranslations(article.translations as TranslationRecord[], "title");
    const bodies = mapTranslations(article.translations as TranslationRecord[], "body");
    const excerpt = {
      uz: bodies.uz.slice(0, 160),
      ru: bodies.ru.slice(0, 160),
      en: bodies.en.slice(0, 160)
    };

    return {
      slug: article.slug,
      title_uz: titles.uz,
      title_ru: titles.ru,
      title_en: titles.en,
      excerpt_uz: excerpt.uz,
      excerpt_ru: excerpt.ru,
      excerpt_en: excerpt.en,
      publishedAt: article.createdAt,
      cover_image_url: article.coverImageUrl
    };
  });

  const articleCards = articleRecords.map((article) => ({
    slug: article.slug,
    title: localizeField(article, "title", locale) ?? "",
    excerpt: localizeField(article, "excerpt", locale),
    dateLabel: article.publishedAt ? dateFormatter.format(article.publishedAt) : null,
    coverImageUrl: article.cover_image_url
  }));

  const bannerItems = [...olympiads, ...events]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      title: localizeField(item, "title", locale),
      subtitle: localizeField(item, "subtitle", locale) ?? localizeField(item, "description", locale),
      coverImageUrl: item.coverImageUrl,
      registrationDeadline: item.startDate?.toISOString() ?? null
    }));

  const olympiadOptions = allOlympiads.map((item) => ({
    id: item.id,
    title: localizeField(item, "title", locale) ?? "",
    type: item.type,
    subject: item.subject,
    subjects: item.subject ? [item.subject] : [],
    format: item.format,
    dateLabel: formatDateRange(locale, item.date_start, item.date_end),
    location: localizeField(item, "location", locale) ?? ""
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <OlympiadBannerCarousel items={bannerItems} locale={locale} />
        <Hero hero={settings.hero} locale={locale} />
        <Schedule olympiads={scheduleItems} locale={locale} filters={filters} />
        <RatingSection />
        <About about={settings.about} locale={locale} />
        <Acronym />
        <Subjects />
        <GridDetails />
        <AwardsAndWhy />
        <Registration olympiads={olympiadOptions} selectedOlympiadId={selectedOlympiadId} />
        <ArticlesPreview locale={locale} articles={articleCards} />
      </main>
      <Footer footer={settings.footer} contact={settings.contact} locale={locale} />
    </div>
  );
}
