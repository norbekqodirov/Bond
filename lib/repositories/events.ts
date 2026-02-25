import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators/event";
import { eventStatusMap, eventTypeMap, localeMap } from "@/lib/mappers";

export async function createEvent(input: unknown) {
  const parsed = eventSchema.parse(input);

  return prisma.event.create({
    data: {
      type: eventTypeMap[parsed.type],
      status: parsed.status ? eventStatusMap[parsed.status] : "DRAFT",
      organizerOrgId: parsed.organizerOrgId ?? null,
      subjects: parsed.subjects ?? [],
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      city: parsed.city ?? null,
      address: parsed.address ?? null,
      mapUrl: parsed.mapUrl ?? null,
      price: parsed.price ?? null,
      currency: parsed.currency ?? null,
      capacity: parsed.capacity ?? null,
      coverImageUrl: parsed.coverImageUrl ?? null,
      translations: {
        create: parsed.translations.map((translation) => ({
          locale: localeMap[translation.locale],
          title: translation.title,
          subtitle: translation.subtitle ?? null,
          description: translation.description ?? null,
          rules: translation.rules ?? null,
          prizes: translation.prizes ?? null,
          levelInfo: translation.levelInfo ?? null,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        }))
      }
    },
    include: { translations: true }
  });
}
