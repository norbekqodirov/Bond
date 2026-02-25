import { requirePermission } from "@/lib/auth/server";
import { EventsPageClient } from "@/components/admin-v2/events/EventsPageClient";

export default async function EventsPage() {
  await requirePermission("events.view");
  return <EventsPageClient />;
}
