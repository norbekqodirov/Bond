import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { localizeField } from "@/lib/localize";
import type { Locale } from "@/lib/settings";
import { CatalogClient } from "@/components/user-app/CatalogClient";

export default async function AppHomePage({ params }: { params: { locale: Locale } }) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const locale = params.locale;

  const [events, olympiads, articles, registrations] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      include: { translations: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.olympiad.findMany({
      where: { status: "PUBLISHED" },
      include: { translations: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { translations: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.registration.findMany({
      where: { userId: session.user.id },
      select: {
        eventId: true,
        olympiadId: true,
        paymentStatus: true
      }
    })
  ]);

  const items = [
    ...events.map((event) => ({
      id: event.id,
      title: localizeField(event, "title", locale) ?? "Event",
      subtitle: localizeField(event, "subtitle", locale),
      type: event.type?.toString().toLowerCase(),
      subjects: event.subjects,
      city: event.city,
      price: event.price ? Number(event.price) : null,
      currency: event.currency,
      coverImageUrl: event.coverImageUrl,
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString()
    })),
    ...olympiads.map((olympiad) => ({
      id: olympiad.id,
      title: localizeField(olympiad, "title", locale) ?? "Olympiad",
      subtitle: localizeField(olympiad, "subtitle", locale),
      type: olympiad.type?.toString().toLowerCase(),
      subject: olympiad.subject,
      subjects: olympiad.subject ? [olympiad.subject] : [],
      format: olympiad.format,
      city: olympiad.location ?? olympiad.region ?? null,
      price: olympiad.price ? Number(olympiad.price) : null,
      currency: olympiad.currency,
      coverImageUrl: olympiad.coverImageUrl,
      startDate: olympiad.startDate?.toISOString(),
      endDate: olympiad.endDate?.toISOString()
    }))
  ];

  const articleItems = articles.map((article) => ({
    id: article.id,
    title: localizeField(article, "title", locale) ?? "News",
    coverImageUrl: article.coverImageUrl ?? null
  }));

  const registrationMap = registrations.reduce<Record<string, string>>((acc, item) => {
    const id = item.eventId ?? item.olympiadId;
    if (id) {
      acc[id] = item.paymentStatus;
    }
    return acc;
  }, {});

  return <CatalogClient items={items} articles={articleItems} registrationMap={registrationMap} />;
}
