import { z } from "zod";
import { subjects } from "@/lib/enums";

export const localeKeySchema = z.enum(["uz", "ru", "en"]);

export const eventTranslationSchema = z.object({
  locale: localeKeySchema,
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
  prizes: z.string().optional().nullable(),
  levelInfo: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
});

export const eventSchema = z.object({
  type: z.enum(["olympiad", "contest", "camp", "travel"]),
  status: z.enum(["draft", "pending", "published", "archived"]).optional(),
  organizerOrgId: z.string().optional().nullable(),
  subjects: z.array(z.enum(subjects)).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  coverImageUrl: z.string().min(1).optional().nullable(),
  translations: z.array(eventTranslationSchema).min(1)
});

export const eventUpdateSchema = eventSchema.partial().extend({
  translations: z.array(eventTranslationSchema).optional()
});
