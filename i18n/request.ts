import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const detectedLocale = locale ?? defaultLocale;
  const resolvedLocale = locales.includes(detectedLocale as typeof locales[number])
    ? detectedLocale
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});
