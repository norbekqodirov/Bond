import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin-v2/PageHeader";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  await requirePermission("dashboard.view");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    totalRegistrations,
    totalArticles,
    newRegistrations,
    pendingOrganizers,
    pendingEvents,
    pendingRefunds
  ] = await Promise.all([
    prisma.event.count(),
    prisma.registration.count(),
    prisma.article.count(),
    prisma.registration.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.organization.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "PENDING" } })
  ]);

  const kpis = [
    { label: "Total events", value: totalEvents },
    { label: "Total registrations", value: totalRegistrations },
    { label: "New registrations (7d)", value: newRegistrations },
    { label: "Total articles", value: totalArticles }
  ];

  const actions = [
    { label: "Pending organizers", value: pendingOrganizers },
    { label: "Pending events", value: pendingEvents },
    { label: "Pending refunds", value: pendingRefunds }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Marketplace overview" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action Center</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {actions.map((item) => (
            <div key={item.label} className="rounded-xl border border-border/60 bg-white p-4">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-2xl font-semibold text-slate-900">{item.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
