import { z } from "zod";
import { articleStatuses } from "@/lib/enums";

export const articleSchema = z.object({
  slug: z.string().min(2),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  excerpt_uz: z.string().optional().nullable(),
  excerpt_ru: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  content_uz: z.string().min(1),
  content_ru: z.string().min(1),
  content_en: z.string().min(1),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(articleStatuses),
  publishedAt: z.string().optional().nullable(),
  seo_title_uz: z.string().optional().nullable(),
  seo_title_ru: z.string().optional().nullable(),
  seo_title_en: z.string().optional().nullable(),
  seo_description_uz: z.string().optional().nullable(),
  seo_description_ru: z.string().optional().nullable(),
  seo_description_en: z.string().optional().nullable()
});

export type ArticleInput = z.infer<typeof articleSchema>;
