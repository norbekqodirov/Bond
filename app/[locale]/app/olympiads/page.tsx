import { getTranslations } from "next-intl/server";

import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { localizeField } from "@/lib/localize";
import { formatDateRange } from "@/lib/olympiad";
import type { Locale } from "@/lib/settings";

type RegistrationItem = {
  id: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  city: string | null;
  status: string;
  paymentStatus: string;
  type: string;
};

export default async function MyOlympiadsPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const t = await getTranslations({ locale: params.locale, namespace: "app" });
  const enumT = await getTranslations({ locale: params.locale, namespace: "enum" });

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: {
      event: { include: { translations: true } },
      olympiad: { include: { translations: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const items: RegistrationItem[] = registrations.map((registration) => {
    const record = registration.event ?? registration.olympiad;
    const title = record ? (localizeField(record, "title", params.locale) ?? "Event") : "Event";
    const startDate = registration.event?.startDate ?? registration.olympiad?.startDate ?? null;
    const endDate = registration.event?.endDate ?? registration.olympiad?.endDate ?? null;
    const city =
      registration.event?.city ??
      registration.olympiad?.location ??
      registration.olympiad?.region ??
      null;

    return {
      id: registration.id,
      title,
      startDate,
      endDate,
      city,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      type: (registration.event?.type ?? registration.olympiad?.type ?? "OLYMPIAD").toString()
    };
  });

  const now = new Date();
  const upcoming = items.filter((item) => !item.startDate || item.startDate >= now);
  const past = items.filter((item) => item.startDate && item.startDate < now);

  const renderCard = (item: RegistrationItem) => (
    <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.type}</p>
          <p className="text-lg font-semibold text-slate-900">{item.title}</p>
        </div>
        <div className="text-right text-xs font-semibold text-slate-500">
          {formatDateRange(params.locale, item.startDate, item.endDate)}
          {item.city ? ` - ${item.city}` : ""}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          {enumT(`registrationStatus.${item.status}`)}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {t(`payment.${item.paymentStatus.toLowerCase()}`)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("myOlympiadsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("statusLabel")} & {t("paymentLabel")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">{t("upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            {t("noRegistrations")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map(renderCard)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">{t("past")}</h2>
        {past.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            {t("noRegistrations")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {past.map(renderCard)}
          </div>
        )}
      </section>
    </div>
  );
}
