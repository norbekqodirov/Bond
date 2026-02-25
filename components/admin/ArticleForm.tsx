"use client";

import { useFormState } from "react-dom";
import type { Article } from "@prisma/client";
import { articleStatuses } from "@/lib/enums";
import { createArticle, updateArticle, type ArticleFormState } from "@/app/admin/(protected)/articles/actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: ArticleFormState = {};

const toDateValue = (value?: Date | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return date.toISOString().split("T")[0];
};

export function ArticleForm({ article }: { article?: Article | null }) {
  const action = article ? updateArticle.bind(null, article.id) : createArticle;
  const [state, formAction] = useFormState(action, initialState);
  const safeState = state ?? initialState;

  return (
    <form action={formAction} className="space-y-8" encType="multipart/form-data">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Slug
          </label>
          <Input name="slug" required defaultValue={article?.slug ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Status
          </label>
          <Select name="status" defaultValue={article?.status ?? "DRAFT"}>
            {articleStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title (UZ)
          </label>
          <Input name="title_uz" required defaultValue={article?.title_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title (RU)
          </label>
          <Input name="title_ru" required defaultValue={article?.title_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title (EN)
          </label>
          <Input name="title_en" required defaultValue={article?.title_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Excerpt (UZ)
          </label>
          <Textarea name="excerpt_uz" defaultValue={article?.excerpt_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Excerpt (RU)
          </label>
          <Textarea name="excerpt_ru" defaultValue={article?.excerpt_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Excerpt (EN)
          </label>
          <Textarea name="excerpt_en" defaultValue={article?.excerpt_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Content (UZ)
          </label>
          <Textarea name="content_uz" required defaultValue={article?.content_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Content (RU)
          </label>
          <Textarea name="content_ru" required defaultValue={article?.content_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Content (EN)
          </label>
          <Textarea name="content_en" required defaultValue={article?.content_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cover Image File (optional)
          </label>
          <Input type="file" name="cover_image" accept="image/*" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cover Image URL (optional)
          </label>
          <Input name="cover_image_url" defaultValue={article?.cover_image_url ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Published At (optional)
          </label>
          <Input type="date" name="publishedAt" defaultValue={toDateValue(article?.publishedAt)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Title (UZ)
          </label>
          <Input name="seo_title_uz" defaultValue={article?.seo_title_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Title (RU)
          </label>
          <Input name="seo_title_ru" defaultValue={article?.seo_title_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Title (EN)
          </label>
          <Input name="seo_title_en" defaultValue={article?.seo_title_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Description (UZ)
          </label>
          <Textarea name="seo_description_uz" defaultValue={article?.seo_description_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Description (RU)
          </label>
          <Textarea name="seo_description_ru" defaultValue={article?.seo_description_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            SEO Description (EN)
          </label>
          <Textarea name="seo_description_en" defaultValue={article?.seo_description_en ?? ""} />
        </div>
      </div>

      {safeState.error ? (
        <p className="text-sm font-semibold text-rose-500">{safeState.error}</p>
      ) : null}

      <button
        type="submit"
        className="rounded-full bg-brand-primary px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-soft"
      >
        Save
      </button>
    </form>
  );
}
