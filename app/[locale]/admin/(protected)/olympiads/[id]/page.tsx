import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { OlympiadForm } from "@/components/organizer/OlympiadForm";

export default async function AdminEditOlympiadPage({ params }: { params: { id: string } }) {
  await requirePermission("olympiads.edit");
  return (
    <div className="space-y-6">
      <PageHeader title="Edit olympiad" subtitle="Update olympiad details" />
      <OlympiadForm olympiadId={params.id} allowOrganizerSelect />
    </div>
  );
}
