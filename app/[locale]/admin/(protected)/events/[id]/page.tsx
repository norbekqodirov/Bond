import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { EventForm } from "@/components/admin-v2/events/EventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requirePermission("events.edit");
  return (
    <div className="space-y-6">
      <PageHeader title="Edit event" subtitle="Update event details" />
      <EventForm eventId={params.id} />
    </div>
  );
}
