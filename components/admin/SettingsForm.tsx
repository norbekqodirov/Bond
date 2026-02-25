"use client";

import { useFormState } from "react-dom";
import type { AboutSetting, ContactSetting, FooterSetting, HeroSetting } from "@/lib/settings";
import { updateSettings, type SettingsFormState } from "@/app/admin/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: SettingsFormState = {};

export function SettingsForm({
  about,
  hero,
  contact,
  footer
}: {
  about: AboutSetting;
  hero: HeroSetting;
  contact: ContactSetting;
  footer: FooterSetting;
}) {
  const [state, formAction] = useFormState(updateSettings, initialState);
  const safeState = state ?? initialState;

  return (
    <form action={formAction} className="space-y-10">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-display font-semibold text-brand-primary">
          Contact
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phone
            </label>
            <Input name="phone" required defaultValue={contact.phone} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Address
            </label>
            <Input name="address" required defaultValue={contact.address} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Instagram
            </label>
            <Input name="instagram" defaultValue={contact.instagram ?? ""} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Telegram Channel
            </label>
            <Input
              name="telegram_channel"
              defaultValue={contact.telegramChannel ?? ""}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Telegram Admin
            </label>
            <Input
              name="telegram_admin"
              defaultValue={contact.telegramAdmin ?? ""}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Email (optional)
          </label>
          <Input name="email" type="email" defaultValue={contact.email ?? ""} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-display font-semibold text-brand-primary">
          About
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (UZ)
            </label>
            <Input name="about_title_uz" required defaultValue={about.title.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (RU)
            </label>
            <Input name="about_title_ru" required defaultValue={about.title.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (EN)
            </label>
            <Input name="about_title_en" required defaultValue={about.title.en} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quote (UZ)
            </label>
            <Input name="about_quote_uz" required defaultValue={about.quote.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quote (RU)
            </label>
            <Input name="about_quote_ru" required defaultValue={about.quote.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quote (EN)
            </label>
            <Input name="about_quote_en" required defaultValue={about.quote.en} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Body (UZ)
            </label>
            <Textarea name="about_body_uz" required defaultValue={about.body.uz.join("\n")} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Body (RU)
            </label>
            <Textarea name="about_body_ru" required defaultValue={about.body.ru.join("\n")} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Body (EN)
            </label>
            <Textarea name="about_body_en" required defaultValue={about.body.en.join("\n")} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Highlight (UZ)
            </label>
            <Input name="about_highlight_uz" required defaultValue={about.highlight.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Highlight (RU)
            </label>
            <Input name="about_highlight_ru" required defaultValue={about.highlight.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Highlight (EN)
            </label>
            <Input name="about_highlight_en" required defaultValue={about.highlight.en} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-display font-semibold text-brand-primary">
          Hero
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Badge (UZ)
            </label>
            <Input name="hero_badge_uz" required defaultValue={hero.badge.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Badge (RU)
            </label>
            <Input name="hero_badge_ru" required defaultValue={hero.badge.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Badge (EN)
            </label>
            <Input name="hero_badge_en" required defaultValue={hero.badge.en} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (UZ)
            </label>
            <Input name="hero_title_uz" required defaultValue={hero.title.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (RU)
            </label>
            <Input name="hero_title_ru" required defaultValue={hero.title.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title (EN)
            </label>
            <Input name="hero_title_en" required defaultValue={hero.title.en} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subtitle (UZ)
            </label>
            <Textarea name="hero_subtitle_uz" required defaultValue={hero.subtitle.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subtitle (RU)
            </label>
            <Textarea name="hero_subtitle_ru" required defaultValue={hero.subtitle.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subtitle (EN)
            </label>
            <Textarea name="hero_subtitle_en" required defaultValue={hero.subtitle.en} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-display font-semibold text-brand-primary">
          Footer
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Short (UZ)
            </label>
            <Input name="footer_short_uz" required defaultValue={footer.short.uz} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Short (RU)
            </label>
            <Input name="footer_short_ru" required defaultValue={footer.short.ru} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Short (EN)
            </label>
            <Input name="footer_short_en" required defaultValue={footer.short.en} />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Domain
          </label>
          <Input name="footer_domain" required defaultValue={footer.domain} />
        </div>
      </section>

      {safeState.error ? (
        <p className="text-sm font-semibold text-rose-500">{safeState.error}</p>
      ) : null}

      <button
        type="submit"
        className="rounded-full bg-brand-primary px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-soft"
      >
        Save Settings
      </button>
    </form>
  );
}
