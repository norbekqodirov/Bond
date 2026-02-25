import { Instagram, MapPin, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContactSetting, FooterSetting, Locale } from "@/lib/settings";
import { localizeSetting } from "@/lib/localize";

export function Footer({
  footer,
  contact,
  locale
}: {
  footer: FooterSetting;
  contact: ContactSetting;
  locale: Locale;
}) {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const contactT = useTranslations("contact");

  const normalizeHandle = (value: string) => value.replace(/^@/, "");
  const instagramHref = contact.instagram
    ? contact.instagram.startsWith("http")
      ? contact.instagram
      : `https://instagram.com/${normalizeHandle(contact.instagram)}`
    : "";
  const telegramChannelHref = contact.telegramChannel
    ? `https://t.me/${normalizeHandle(contact.telegramChannel)}`
    : "";
  const telegramAdminHref = contact.telegramAdmin
    ? `https://t.me/${normalizeHandle(contact.telegramAdmin)}`
    : "";

  return (
    <footer id="contact" className="border-t border-slate-100 bg-white pb-10 pt-16 sm:pb-12 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:items-start">
          <div>
            <h3 className="text-xl font-display font-semibold text-brand-primary">
              {t("name")}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {localizeSetting(footer.short, locale) ?? t("short")}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <a href={`/${locale}#schedule`} className="hover:text-brand-primary">
              {navT("schedule")}
            </a>
            <a href={`/${locale}#rating`} className="hover:text-brand-primary">
              {navT("rating")}
            </a>
            <a href={`/${locale}#about`} className="hover:text-brand-primary">
              {navT("about")}
            </a>
            <a href={`/${locale}#registration`} className="hover:text-brand-primary">
              {navT("registration")}
            </a>
            <a href={`/${locale}#news`} className="hover:text-brand-primary">
              {navT("news")}
            </a>
            <a href={`/${locale}#contact`} className="hover:text-brand-primary">
              {navT("contact")}
            </a>
          </div>

          <div className="grid gap-4 text-sm font-semibold text-slate-600 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {contactT("phone")}
                  </p>
                  <a href={`tel:${contact.phone}`} className="hover:text-brand-primary">
                    {contact.phone}
                  </a>
                </div>
              </div>

              {contact.telegramAdmin ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {contactT("telegramAdmin")}
                    </p>
                    <a href={telegramAdminHref} target="_blank" rel="noreferrer" className="hover:text-brand-primary">
                      {contact.telegramAdmin}
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {contactT("address")}
                  </p>
                  <p>{contact.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {contact.telegramChannel ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {contactT("telegramChannel")}
                    </p>
                    <a href={telegramChannelHref} target="_blank" rel="noreferrer" className="hover:text-brand-primary">
                      {contact.telegramChannel}
                    </a>
                  </div>
                </div>
              ) : null}

              {contact.instagram ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {contactT("instagram")}
                    </p>
                    <a href={instagramHref} target="_blank" rel="noreferrer" className="hover:text-brand-primary">
                      {contact.instagram}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-400 lg:flex-row">
          <span>© {new Date().getFullYear()} {footer.domain}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
