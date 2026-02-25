"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validation/article";
import { saveUploadedImage } from "@/lib/upload";

export type ArticleFormState = {
  error?: string;
};

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const payload = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string")
  );
  const parsed = articleSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;
  let coverImageUrl = data.cover_image_url || null;
  const coverImageFile = formData.get("cover_image");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      coverImageUrl = await saveUploadedImage(coverImageFile, "uploads/articles");
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  await prisma.article.create({
    data: {
      slug: data.slug,
      title_uz: data.title_uz,
      title_ru: data.title_ru,
      title_en: data.title_en,
      excerpt_uz: data.excerpt_uz || null,
      excerpt_ru: data.excerpt_ru || null,
      excerpt_en: data.excerpt_en || null,
      content_uz: data.content_uz,
      content_ru: data.content_ru,
      content_en: data.content_en,
      cover_image_url: coverImageUrl,
      status: data.status,
      publishedAt: parseDate(data.publishedAt),
      seo_title_uz: data.seo_title_uz || null,
      seo_title_ru: data.seo_title_ru || null,
      seo_title_en: data.seo_title_en || null,
      seo_description_uz: data.seo_description_uz || null,
      seo_description_ru: data.seo_description_ru || null,
      seo_description_en: data.seo_description_en || null
    }
  });

  redirect("/admin/articles");
}

export async function updateArticle(
  id: string,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const payload = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string")
  );
  const parsed = articleSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;
  let coverImageUrl = data.cover_image_url || null;
  const coverImageFile = formData.get("cover_image");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      coverImageUrl = await saveUploadedImage(coverImageFile, "uploads/articles");
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  await prisma.article.update({
    where: { id },
    data: {
      slug: data.slug,
      title_uz: data.title_uz,
      title_ru: data.title_ru,
      title_en: data.title_en,
      excerpt_uz: data.excerpt_uz || null,
      excerpt_ru: data.excerpt_ru || null,
      excerpt_en: data.excerpt_en || null,
      content_uz: data.content_uz,
      content_ru: data.content_ru,
      content_en: data.content_en,
      cover_image_url: coverImageUrl,
      status: data.status,
      publishedAt: parseDate(data.publishedAt),
      seo_title_uz: data.seo_title_uz || null,
      seo_title_ru: data.seo_title_ru || null,
      seo_title_en: data.seo_title_en || null,
      seo_description_uz: data.seo_description_uz || null,
      seo_description_ru: data.seo_description_ru || null,
      seo_description_en: data.seo_description_en || null
    }
  });

  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
  redirect("/admin/articles");
}
