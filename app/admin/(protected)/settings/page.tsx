import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
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
