import { requirePermission } from "@/lib/auth/server";
import { RegistrationsPageClient } from "@/components/admin-v2/registrations/RegistrationsPageClient";

export default async function RegistrationsPage() {
  await requirePermission("registrations.view");
  return <RegistrationsPageClient />;
}
