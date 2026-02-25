export const locales = ["uz", "ru", "en"] as const;
export type LocaleKey = (typeof locales)[number];

export const localeToDb: Record<LocaleKey, "UZ" | "RU" | "EN"> = {
  uz: "UZ",
  ru: "RU",
  en: "EN"
};

export const dbToLocale: Record<"UZ" | "RU" | "EN", LocaleKey> = {
  UZ: "uz",
  RU: "ru",
  EN: "en"
};
