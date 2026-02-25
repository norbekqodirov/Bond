import { requirePermission } from "@/lib/auth/server";
import { RegistrationDetailClient } from "@/components/admin-v2/registrations/RegistrationDetailClient";

export default async function RegistrationDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("registrations.view");
  return <RegistrationDetailClient id={params.id} />;
}
