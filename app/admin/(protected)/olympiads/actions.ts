"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { olympiadSchema } from "@/lib/validation/olympiad";
import { saveUploadedImage } from "@/lib/upload";

export type OlympiadFormState = {
  error?: string;
};

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseIntValue = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export async function createOlympiad(
  _prevState: OlympiadFormState,
  formData: FormData
): Promise<OlympiadFormState> {
  const payload = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string")
  );
  const parsed = olympiadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;
  let coverImageUrl = data.cover_image_url || null;
  const coverImageFile = formData.get("cover_image");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      coverImageUrl = await saveUploadedImage(coverImageFile, "uploads/olympiads");
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  await prisma.olympiad.create({
    data: {
      slug: data.slug,
      title_uz: data.title_uz,
      title_ru: data.title_ru,
      title_en: data.title_en,
      description_uz: data.description_uz || null,
      description_ru: data.description_ru || null,
      description_en: data.description_en || null,
      cover_image_url: coverImageUrl,
      subject: data.subject,
      grade_group: data.grade_group,
      format: data.format,
      status: data.status,
      date_start: parseDate(data.date_start),
      date_end: parseDate(data.date_end),
      registration_deadline: parseDate(data.registration_deadline),
      fee_amount: data.fee_amount ? new Prisma.Decimal(data.fee_amount) : null,
      capacity: parseIntValue(data.capacity),
      location_uz: data.location_uz,
      location_ru: data.location_ru,
      location_en: data.location_en
    }
  });

  redirect("/admin/olympiads");
}

export async function updateOlympiad(
  id: string,
  _prevState: OlympiadFormState,
  formData: FormData
): Promise<OlympiadFormState> {
  const payload = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string")
  );
  const parsed = olympiadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;
  let coverImageUrl = data.cover_image_url || null;
  const coverImageFile = formData.get("cover_image");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      coverImageUrl = await saveUploadedImage(coverImageFile, "uploads/olympiads");
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  await prisma.olympiad.update({
    where: { id },
    data: {
      slug: data.slug,
      title_uz: data.title_uz,
      title_ru: data.title_ru,
      title_en: data.title_en,
      description_uz: data.description_uz || null,
      description_ru: data.description_ru || null,
      description_en: data.description_en || null,
      cover_image_url: coverImageUrl,
      subject: data.subject,
      grade_group: data.grade_group,
      format: data.format,
      status: data.status,
      date_start: parseDate(data.date_start),
      date_end: parseDate(data.date_end),
      registration_deadline: parseDate(data.registration_deadline),
      fee_amount: data.fee_amount ? new Prisma.Decimal(data.fee_amount) : null,
      capacity: parseIntValue(data.capacity),
      location_uz: data.location_uz,
      location_ru: data.location_ru,
      location_en: data.location_en
    }
  });

  redirect("/admin/olympiads");
}

export async function deleteOlympiad(id: string) {
  await prisma.olympiad.delete({ where: { id } });
  redirect("/admin/olympiads");
}
