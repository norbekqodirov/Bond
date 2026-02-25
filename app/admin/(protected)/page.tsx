import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [olympiads, registrations, articles, newRegistrations] =
    await Promise.all([
      prisma.olympiad.count(),
      prisma.registration.count(),
      prisma.article.count(),
      prisma.registration.count({ where: { status: "NEW" } })
    ]);

  const cards = [
    { label: "Olympiads", value: olympiads, href: "/admin/olympiads" },
    { label: "Registrations", value: registrations, href: "/admin/registrations" },
    { label: "New Registrations", value: newRegistrations, href: "/admin/registrations" },
    { label: "Articles", value: articles, href: "/admin/articles" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-semibold text-brand-primary">
        Dashboard
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-all hover:-translate-y-1 hover:border-brand-primary/40">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-display font-semibold text-slate-900">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
