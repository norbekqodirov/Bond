import { z } from "zod";

export const localeKeySchema = z.enum(["uz", "ru", "en"]);

export const siteBlockTranslationSchema = z.object({
  locale: localeKeySchema,
  data: z.record(z.string(), z.any())
});

export const siteBlockSchema = z.object({
  code: z.string().min(1),
  translations: z.array(siteBlockTranslationSchema).min(1)
});

export const siteBlockUpdateSchema = siteBlockSchema.partial().extend({
  translations: z.array(siteBlockTranslationSchema).optional()
});

export const siteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});
