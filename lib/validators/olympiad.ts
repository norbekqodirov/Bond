import { z } from "zod";

export const localeKeySchema = z.enum(["uz", "ru", "en"]);

export const olympiadTranslationSchema = z.object({
  locale: localeKeySchema,
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
  prizes: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
});

export const olympiadSchema = z.object({
  type: z.enum(["olympiad", "contest", "camp", "travel"]),
  status: z.enum(["draft", "pending", "published", "archived"]).optional(),
  subject: z.enum(["english", "math", "it", "mental"]),
  gradeGroup: z.enum(["g1_4", "g5_7", "g8_9", "g10_11"]),
  level: z.enum(["a2", "b1", "b2", "c1"]).optional().nullable(),
  format: z.enum(["online", "offline", "staged"]),
  region: z.string().optional().nullable(),
  language: localeKeySchema.optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
  prizes: z.string().optional().nullable(),
  certificateUrl: z.string().optional().nullable(),
  translations: z.array(olympiadTranslationSchema).min(1)
});

export const olympiadUpdateSchema = olympiadSchema.partial().extend({
  translations: z.array(olympiadTranslationSchema).optional()
});
