import { PageHeader } from "@/components/admin-v2/PageHeader";
import { OlympiadForm } from "@/components/organizer/OlympiadForm";

export default function NewOrganizerOlympiadPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Create olympiad" subtitle="Draft a new listing" />
      <OlympiadForm />
    </div>
  );
}
