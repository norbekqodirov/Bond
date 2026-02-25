import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { localizeField } from "@/lib/localize";
import { formatDateRange } from "@/lib/olympiad";
import type { Locale } from "@/lib/settings";
import { Registration } from "@/components/site/Registration";

export default async function EventRegistrationPage({
  params
}: {
  params: { locale: Locale; id: string };
}) {
  const locale = params.locale;
  const id = params.id;
  const t = await getTranslations({ locale, namespace: "registration" });
  const enumT = await getTranslations({ locale, namespace: "enum" });

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> = null;
  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: { translations: true }
    });
  } catch (error) {
    console.error("Failed to load event registration page data.", error);
  }

  if (event) {
    const title = localizeField(event, "title", locale) ?? "Event";
    const subtitle = localizeField(event, "subtitle", locale);
    const description = localizeField(event, "description", locale);
    const rules = localizeField(event, "rules", locale);
    const prizes = localizeField(event, "prizes", locale);
    const location = event.city ?? event.address ?? "TBD";
    const dateLabel = formatDateRange(locale, event.startDate, event.endDate);
    const priceLabel = event.price ? `${event.price} ${event.currency ?? "UZS"}` : null;
    const subjectLabels = Array.isArray(event.subjects)
      ? event.subjects.map((subject) => enumT(`subject.${subject}`)).join(", ")
      : null;
    const infoItems = [
      { label: t("details.date"), value: dateLabel },
      { label: t("details.location"), value: location },
      { label: t("details.subject"), value: subjectLabels },
      { label: t("details.price"), value: priceLabel }
    ].filter((item) => item.value);

    return (
      <div className="min-h-screen bg-slate-50">
        <section className="bg-white pb-10 pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] bg-slate-900">
                {event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-transparent" />
              </div>
              <div className="space-y-6">
                <div>
                  <h1 className="mt-3 text-3xl font-display font-semibold text-slate-900 sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {subtitle ?? t("details.subtitle")}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("details.info")}
                  </p>
                  <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
                    {infoItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4">
                        <span>{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                {description ? (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                    <h2 className="text-lg font-semibold text-slate-900">{t("details.description")}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                ) : null}
                {rules ? (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                    <h2 className="text-lg font-semibold text-slate-900">{t("details.rules")}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{rules}</p>
                  </div>
                ) : null}
                {prizes ? (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                    <h2 className="text-lg font-semibold text-slate-900">{t("details.prizes")}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{prizes}</p>
                  </div>
                ) : null}
              </div>
              <div className="space-y-6">
                <Registration
                olympiads={[
                  {
                    id: event.id,
                    title,
                    type: event.type,
                    subjects: event.subjects,
                    dateLabel,
                    location
                  }
                ]}
                  selectedOlympiadId={event.id}
                  eventId={event.id}
                  hideOlympiadSelect
                  showSteps={false}
                  variant="embedded"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  let olympiad: Awaited<ReturnType<typeof prisma.olympiad.findUnique>> = null;
  try {
    olympiad = await prisma.olympiad.findUnique({
      where: { id },
      include: { translations: true }
    });
  } catch (error) {
    console.error("Failed to load olympiad registration page data.", error);
  }

  if (!olympiad) {
    notFound();
  }

  const olympiadTitle = localizeField(olympiad, "title", locale) ?? "Olympiad";
  const olympiadSubtitle = localizeField(olympiad, "subtitle", locale);
  const olympiadDescription = localizeField(olympiad, "description", locale);
  const olympiadRules = localizeField(olympiad, "rules", locale) ?? olympiad.rules ?? null;
  const olympiadPrizes = localizeField(olympiad, "prizes", locale) ?? olympiad.prizes ?? null;
  const olympiadLocation = olympiad.location ?? olympiad.region ?? "TBD";
  const olympiadDate = formatDateRange(locale, olympiad.startDate, olympiad.endDate);
  const olympiadPrice = olympiad.price ? `${olympiad.price} ${olympiad.currency ?? "UZS"}` : null;
  const olympiadSubject = olympiad.subject ? enumT(`subject.${olympiad.subject}`) : null;
  const olympiadFormat = olympiad.format ? enumT(`format.${olympiad.format}`) : null;
  const olympiadInfo = [
    { label: t("details.date"), value: olympiadDate },
    { label: t("details.location"), value: olympiadLocation },
    { label: t("details.subject"), value: olympiadSubject },
    { label: t("details.format"), value: olympiadFormat },
    { label: t("details.price"), value: olympiadPrice }
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] bg-slate-900">
              {olympiad.coverImageUrl ? (
                <img
                  src={olympiad.coverImageUrl}
                  alt={olympiadTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-transparent" />
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="mt-3 text-3xl font-display font-semibold text-slate-900 sm:text-4xl">
                  {olympiadTitle}
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  {olympiadSubtitle ?? t("details.subtitle")}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("details.info")}
                </p>
                <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
                  {olympiadInfo.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {olympiadDescription ? (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">{t("details.description")}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{olympiadDescription}</p>
                </div>
              ) : null}
              {olympiadRules ? (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">{t("details.rules")}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{olympiadRules}</p>
                </div>
              ) : null}
              {olympiadPrizes ? (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">{t("details.prizes")}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{olympiadPrizes}</p>
                </div>
              ) : null}
            </div>
            <div className="space-y-6">
              <Registration
                olympiads={[
                  {
                    id: olympiad.id,
                    title: olympiadTitle,
                    type: olympiad.type,
                    subject: olympiad.subject,
                    subjects: olympiad.subject ? [olympiad.subject] : [],
                    format: olympiad.format,
                    dateLabel: olympiadDate,
                    location: olympiadLocation
                  }
                ]}
                selectedOlympiadId={olympiad.id}
                hideOlympiadSelect
                showSteps={false}
                variant="embedded"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
