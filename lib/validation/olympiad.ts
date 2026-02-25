import { z } from "zod";
import { formats, gradeGroups, olympiadStatuses, subjects } from "@/lib/enums";

export const olympiadSchema = z.object({
  slug: z.string().min(2),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  description_uz: z.string().optional().nullable(),
  description_ru: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  subject: z.enum(subjects),
  grade_group: z.enum(gradeGroups),
  format: z.enum(formats),
  status: z.enum(olympiadStatuses),
  date_start: z.string().optional().nullable(),
  date_end: z.string().optional().nullable(),
  registration_deadline: z.string().optional().nullable(),
  fee_amount: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  location_uz: z.string().min(1),
  location_ru: z.string().min(1),
  location_en: z.string().min(1)
});

export type OlympiadInput = z.infer<typeof olympiadSchema>;
