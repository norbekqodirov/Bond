import { PageHeader } from "@/components/admin-v2/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizerForUser } from "@/lib/organizer";
import { getServerSession } from "@/lib/auth/server";

export default async function OrganizerProfilePage() {
  const session = await getServerSession();
  const organizer = session ? await getOrganizerForUser(session.user.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Organizer profile" subtitle="Your organization details" />
      <Card>
        <CardContent className="space-y-2 pt-6">
          <div className="text-sm text-muted-foreground">Legal name</div>
          <div className="text-base font-semibold text-slate-900">{organizer?.legalName ?? "-"}</div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-base font-semibold text-slate-900">{organizer?.status ?? "-"}</div>
          <div className="text-sm text-muted-foreground">Organization ID</div>
          <div className="text-xs text-slate-500">{organizer?.organizationId ?? "-"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
