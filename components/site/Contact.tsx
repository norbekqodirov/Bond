import { Instagram, MapPin, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContactSetting } from "@/lib/settings";
import { SectionTitle } from "@/components/site/SectionTitle";

export function Contact({ contact }: { contact: ContactSetting }) {
  const t = useTranslations("contact");
  const normalizeHandle = (value: string) => value.replace(/^@/, "");

  return (
    <section id="contact" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <SectionTitle title={t("title")} showLabel={false} />
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="group rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30">
            <div className="mb-6 inline-flex rounded-2xl bg-white p-5 text-brand-primary shadow-sm transition-transform group-hover:scale-110">
              <Phone className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800">{t("phone")}</h4>
            <p className="mt-2 text-sm font-semibold text-slate-500">{contact.phone}</p>
          </div>
          <div className="group rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30">
            <div className="mb-6 inline-flex rounded-2xl bg-white p-5 text-slate-500 shadow-sm transition-transform group-hover:scale-110">
              <MapPin className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800">{t("address")}</h4>
            <p className="mt-2 text-sm font-semibold text-slate-500">{contact.address}</p>
          </div>
          <div className="group rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30">
            <div className="mb-6 inline-flex rounded-2xl bg-white p-5 text-brand-accent shadow-sm transition-transform group-hover:scale-110">
              <Send className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800">{t("telegramAdmin")}</h4>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {contact.telegramAdmin}
            </p>
          </div>
          {contact.instagram ? (
            <a
              href={`https://instagram.com/${normalizeHandle(contact.instagram)}`}
              target="_blank"
              className="group rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30"
            >
              <div className="mb-6 inline-flex rounded-2xl bg-white p-5 text-brand-accent shadow-sm transition-transform group-hover:scale-110">
                <Instagram className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800">{t("instagram")}</h4>
              <p className="mt-2 text-sm font-semibold text-slate-500">{contact.instagram}</p>
            </a>
          ) : null}
          {contact.telegramChannel ? (
            <a
              href={`https://t.me/${normalizeHandle(contact.telegramChannel)}`}
              target="_blank"
              className="group rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30"
            >
              <div className="mb-6 inline-flex rounded-2xl bg-white p-5 text-brand-accent shadow-sm transition-transform group-hover:scale-110">
                <Send className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800">{t("telegramChannel")}</h4>
              <p className="mt-2 text-sm font-semibold text-slate-500">{contact.telegramChannel}</p>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
