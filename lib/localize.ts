import type { Locale, LocalizedText } from "@/lib/settings";

export function localizeSetting(text: LocalizedText, locale: Locale) {
  return text[locale] ?? text.uz;
}

export function localizeField(
  record: Record<string, unknown>,
  base: string,
  locale: Locale
) {
  const key = `${base}_${locale}`;
  const fallbackKey = `${base}_uz`;
  const direct = (record[key] ?? record[fallbackKey]) as string | null | undefined;
  if (direct) {
    return direct;
  }

  const translations = record.translations;
  if (Array.isArray(translations)) {
    const normalizedLocale = locale.toLowerCase();
    const translation =
      translations.find(
        (item) => item?.locale?.toString().toLowerCase() === normalizedLocale
      ) ?? translations[0];

    if (translation) {
      const map: Record<string, string> = {
        title: "title",
        subtitle: "subtitle",
        description: "description",
        rules: "rules",
        content: "body",
        excerpt: "body",
        seo_title: "seoTitle",
        seo_description: "seoDescription"
      };
      const field = map[base] ?? base;
      const value = translation[field];
      if (typeof value === "string") {
        return base === "excerpt" ? value.slice(0, 160) : value;
      }
    }
  }

  if (base === "location" && typeof record.city === "string") {
    return record.city as string;
  }

  return null;
}
