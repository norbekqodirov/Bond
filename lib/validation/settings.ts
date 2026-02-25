import { z } from "zod";

export const settingsSchema = z.object({
  phone: z.string().min(1),
  address: z.string().min(1),
  instagram: z.string().optional().or(z.literal("")),
  telegram_channel: z.string().optional().or(z.literal("")),
  telegram_admin: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  about_title_uz: z.string().min(1),
  about_title_ru: z.string().min(1),
  about_title_en: z.string().min(1),
  about_quote_uz: z.string().min(1),
  about_quote_ru: z.string().min(1),
  about_quote_en: z.string().min(1),
  about_body_uz: z.string().min(1),
  about_body_ru: z.string().min(1),
  about_body_en: z.string().min(1),
  about_highlight_uz: z.string().min(1),
  about_highlight_ru: z.string().min(1),
  about_highlight_en: z.string().min(1),
  hero_badge_uz: z.string().min(1),
  hero_badge_ru: z.string().min(1),
  hero_badge_en: z.string().min(1),
  hero_title_uz: z.string().min(1),
  hero_title_ru: z.string().min(1),
  hero_title_en: z.string().min(1),
  hero_subtitle_uz: z.string().min(1),
  hero_subtitle_ru: z.string().min(1),
  hero_subtitle_en: z.string().min(1),
  footer_short_uz: z.string().min(1),
  footer_short_ru: z.string().min(1),
  footer_short_en: z.string().min(1),
  footer_domain: z.string().min(1)
});

export type SettingsInput = z.infer<typeof settingsSchema>;
