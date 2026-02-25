import { requirePermission } from "@/lib/auth/server";
import { SettingsPageClient } from "@/components/admin-v2/content/SettingsPageClient";

export default async function SettingsPage() {
  await requirePermission("settings.view");
  return <SettingsPageClient />;
}
