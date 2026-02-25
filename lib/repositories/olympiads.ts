import { prisma } from "@/lib/prisma";
import { olympiadSchema, olympiadUpdateSchema } from "@/lib/validators/olympiad";
import {
  eventStatusMap,
  eventTypeMap,
  gradeGroupMap,
  localeMap,
  olympiadFormatMap,
  olympiadLevelMap,
  subjectMap
} from "@/lib/mappers";

export async function createOlympiad(input: unknown, organizerId: string) {
  const parsed = olympiadSchema.parse(input);

  return prisma.olympiad.create({
    data: {
      organizerId,
      type: eventTypeMap[parsed.type],
      status: parsed.status ? eventStatusMap[parsed.status] : "DRAFT",
      subject: subjectMap[parsed.subject],
      gradeGroup: gradeGroupMap[parsed.gradeGroup],
      level: parsed.level ? olympiadLevelMap[parsed.level] : null,
      format: olympiadFormatMap[parsed.format],
      region: parsed.region ?? null,
      language: parsed.language ? localeMap[parsed.language] : null,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      location: parsed.location ?? null,
      price: parsed.price ?? null,
      currency: parsed.currency ?? null,
      capacity: parsed.capacity ?? null,
      coverImageUrl: parsed.coverImageUrl ?? null,
      rules: parsed.rules ?? null,
      prizes: parsed.prizes ?? null,
      certificateUrl: parsed.certificateUrl ?? null,
      translations: {
        create: parsed.translations.map((translation) => ({
          locale: localeMap[translation.locale],
          title: translation.title,
          subtitle: translation.subtitle ?? null,
          description: translation.description ?? null,
          rules: translation.rules ?? null,
          prizes: translation.prizes ?? null,
          seoTitle: translation.seoTitle ?? null,
          seoDescription: translation.seoDescription ?? null
        }))
      }
    },
    include: { translations: true }
  });
}

export async function updateOlympiad(id: string, input: unknown) {
  const parsed = olympiadUpdateSchema.parse(input);

  return prisma.olympiad.update({
    where: { id },
    data: {
      type: parsed.type ? eventTypeMap[parsed.type] : undefined,
      status: parsed.status ? eventStatusMap[parsed.status] : undefined,
      subject: parsed.subject ? subjectMap[parsed.subject] : undefined,
      gradeGroup: parsed.gradeGroup ? gradeGroupMap[parsed.gradeGroup] : undefined,
      level: parsed.level ? olympiadLevelMap[parsed.level] : undefined,
      format: parsed.format ? olympiadFormatMap[parsed.format] : undefined,
      region: parsed.region ?? undefined,
      language: parsed.language ? localeMap[parsed.language] : undefined,
      startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
      endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
      location: parsed.location ?? undefined,
      price: parsed.price ?? undefined,
      currency: parsed.currency ?? undefined,
      capacity: parsed.capacity ?? undefined,
      coverImageUrl: parsed.coverImageUrl ?? undefined,
      rules: parsed.rules ?? undefined,
      prizes: parsed.prizes ?? undefined,
      certificateUrl: parsed.certificateUrl ?? undefined,
      translations: parsed.translations
        ? {
            deleteMany: {},
            create: parsed.translations.map((translation) => ({
              locale: localeMap[translation.locale],
              title: translation.title,
              subtitle: translation.subtitle ?? null,
              description: translation.description ?? null,
              rules: translation.rules ?? null,
              prizes: translation.prizes ?? null,
              seoTitle: translation.seoTitle ?? null,
              seoDescription: translation.seoDescription ?? null
            }))
          }
        : undefined
    },
    include: { translations: true }
  });
}
