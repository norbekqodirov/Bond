import { PageHeader } from "@/components/admin-v2/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getOrganizerForUser } from "@/lib/organizer";
import { getServerSession } from "@/lib/auth/server";

export default async function OrganizerDashboardPage() {
  const session = await getServerSession();
  const organizer = session ? await getOrganizerForUser(session.user.id) : null;

  const [olympiads, registrations] = organizer
    ? await Promise.all([
        prisma.olympiad.count({ where: { organizerId: organizer.id } }),
        prisma.registration.count({ where: { olympiad: { organizerId: organizer.id } } })
      ])
    : [0, 0];

  return (
    <div className="space-y-6">
      <PageHeader title="Organizer Dashboard" subtitle="Your marketplace overview" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total olympiads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{olympiads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{registrations}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
