"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation/settings";

export type SettingsFormState = {
  error?: string;
};

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const payload = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;

  const contact = {
    phone: data.phone,
    address: data.address,
    instagram: data.instagram ?? "",
    telegramChannel: data.telegram_channel ?? "",
    telegramAdmin: data.telegram_admin ?? "",
    email: data.email ?? ""
  };

  const about = {
    title: {
      uz: data.about_title_uz,
      ru: data.about_title_ru,
      en: data.about_title_en
    },
    quote: {
      uz: data.about_quote_uz,
      ru: data.about_quote_ru,
      en: data.about_quote_en
    },
    body: {
      uz: data.about_body_uz.split("\n").filter(Boolean),
      ru: data.about_body_ru.split("\n").filter(Boolean),
      en: data.about_body_en.split("\n").filter(Boolean)
    },
    highlight: {
      uz: data.about_highlight_uz,
      ru: data.about_highlight_ru,
      en: data.about_highlight_en
    }
  };

  const hero = {
    badge: {
      uz: data.hero_badge_uz,
      ru: data.hero_badge_ru,
      en: data.hero_badge_en
    },
    title: {
      uz: data.hero_title_uz,
      ru: data.hero_title_ru,
      en: data.hero_title_en
    },
    subtitle: {
      uz: data.hero_subtitle_uz,
      ru: data.hero_subtitle_ru,
      en: data.hero_subtitle_en
    }
  };

  const footer = {
    short: {
      uz: data.footer_short_uz,
      ru: data.footer_short_ru,
      en: data.footer_short_en
    },
    domain: data.footer_domain
  };

  const updates = [
    { key: "contact", value_json: contact },
    { key: "about", value_json: about },
    { key: "hero", value_json: hero },
    { key: "footer", value_json: footer }
  ];

  for (const item of updates) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value_json: item.value_json },
      create: item
    });
  }

  redirect("/admin/settings");
}
