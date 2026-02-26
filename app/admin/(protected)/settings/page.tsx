import { getSiteSettings } from "@/lib/settings";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">Site Settings</h1>
        <DatabaseRequiredNotice description="Settings editing requires DATABASE_URL on Vercel. Public pages still use built-in fallback content." />
      </div>
    );
  }

  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        Site Settings
      </h1>
      <SettingsForm
        about={settings.about}
        hero={settings.hero}
        contact={settings.contact}
        footer={settings.footer}
      />
    </div>
  );
}
