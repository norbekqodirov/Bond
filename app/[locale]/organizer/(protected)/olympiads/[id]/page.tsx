import { PageHeader } from "@/components/admin-v2/PageHeader";
import { OlympiadForm } from "@/components/organizer/OlympiadForm";

export default function EditOrganizerOlympiadPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Edit olympiad" subtitle="Update listing details" />
      <OlympiadForm olympiadId={params.id} />
    </div>
  );
}
