import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { EventForm } from "@/components/admin-v2/events/EventForm";

export default async function NewEventPage() {
  await requirePermission("events.create");
  return (
    <div className="space-y-6">
      <PageHeader title="Create event" subtitle="Draft a new marketplace event" />
      <EventForm />
    </div>
  );
}
