import { z } from "zod";

export const localeKeySchema = z.enum(["uz", "ru", "en"]);

export const articleTranslationSchema = z.object({
  locale: localeKeySchema,
  title: z.string().min(1),
  body: z.string().min(1),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
});

export const articleSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  slug: z.string().min(1),
  coverImageUrl: z.string().min(1).optional().nullable(),
  translations: z.array(articleTranslationSchema).min(1)
});

export const articleUpdateSchema = articleSchema.partial().extend({
  translations: z.array(articleTranslationSchema).optional()
});
