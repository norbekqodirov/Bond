import { useTranslations } from "next-intl";

export default function OrganizerUnauthorizedPage() {
  const t = useTranslations("organizer");
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{t("unauthorized.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("unauthorized.subtitle")}</p>
      </div>
    </div>
  );
}
