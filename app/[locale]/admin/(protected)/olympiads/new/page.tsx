import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { OlympiadForm } from "@/components/organizer/OlympiadForm";

export default async function AdminNewOlympiadPage() {
  await requirePermission("olympiads.create");
  return (
    <div className="space-y-6">
      <PageHeader title="Create olympiad" subtitle="Create a new olympiad listing" />
      <OlympiadForm allowOrganizerSelect />
    </div>
  );
}
