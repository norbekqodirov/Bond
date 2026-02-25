import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/server";
import { localizeField } from "@/lib/localize";
import type { Locale } from "@/lib/settings";

export default async function ProfilePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("profile");
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const user = session.user!;
  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    include: {
      olympiad: { include: { translations: true } },
      event: { include: { translations: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl font-display font-semibold text-brand-primary">{t("title")}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{t("subtitle")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("fullName")}</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("phone")}</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{user.phone ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-display font-semibold text-brand-primary">{t("registrations")}</h2>
          <div className="mt-6 space-y-4">
            {registrations.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
                  {t("empty")}
                </div>
            ) : (
              registrations.map((registration) => {
                const eventTitle = registration.olympiad
                  ? localizeField(registration.olympiad, "title", locale)
                  : registration.event
                  ? localizeField(registration.event, "title", locale)
                  : null;
                return (
                  <div
                    key={registration.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {eventTitle ?? "Olimpiada"}
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-500">
                      Status: {registration.status} · Payment: {registration.paymentStatus}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
