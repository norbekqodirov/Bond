import { getTranslations } from "next-intl/server";

import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/settings";

export default async function NotificationsPage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const t = await getTranslations({ locale: params.locale, namespace: "app" });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const typeLabels: Record<string, string> = {
    payment_confirmed: t("notifications.payment_confirmed"),
    event_reminder: t("notifications.event_reminder"),
    venue_update: t("notifications.venue_update"),
    registration_confirmed: t("notifications.registration_confirmed")
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("notificationsTitle")}</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
          {t("notificationsEmpty")}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const label = typeLabels[item.type] ?? item.type;
            return (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Intl.DateTimeFormat(params.locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(item.createdAt)}
                    </p>
                  </div>
                  {item.readAt ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {t("readLabel")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                      {t("newLabel")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
