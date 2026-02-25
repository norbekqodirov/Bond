import { getTranslations } from "next-intl/server";

import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/settings";

export default async function ProfilePage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const t = await getTranslations({ locale: params.locale, namespace: "app" });

  const registrationsCount = await prisma.registration.count({
    where: { userId: session.user.id }
  });

  const fullName =
    [session.user.firstName, session.user.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("profileTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("profileSubtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("profileName")}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{fullName}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("profilePhone")}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{session.user.phone ?? "—"}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("profileLanguage")}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {session.user.preferredLanguage ?? params.locale.toUpperCase()}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("myOlympiadsTitle")}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{registrationsCount}</p>
        </div>
      </div>
    </div>
  );
}
