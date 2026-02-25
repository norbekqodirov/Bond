"use client";

import { useFormState } from "react-dom";
import type { Olympiad } from "@prisma/client";
import { createOlympiad, updateOlympiad, type OlympiadFormState } from "@/app/admin/(protected)/olympiads/actions";
import { formats, gradeGroups, olympiadStatuses, subjects } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: OlympiadFormState = {};

const toDateValue = (value?: Date | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return date.toISOString().split("T")[0];
};

export function OlympiadForm({ olympiad }: { olympiad?: Olympiad | null }) {
  const action = olympiad
    ? updateOlympiad.bind(null, olympiad.id)
    : createOlympiad;
  const [state, formAction] = useFormState(action, initialState);
  const safeState = state ?? initialState;

  return (
    <form action={formAction} className="space-y-8" encType="multipart/form-data">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Slug
          </label>
          <Input name="slug" required defaultValue={olympiad?.slug ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Status
          </label>
          <Select name="status" defaultValue={olympiad?.status ?? "DRAFT"}>
            {olympiadStatuses.map((item) => (
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
          <Input name="title_uz" required defaultValue={olympiad?.title_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title (RU)
          </label>
          <Input name="title_ru" required defaultValue={olympiad?.title_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title (EN)
          </label>
          <Input name="title_en" required defaultValue={olympiad?.title_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description (UZ)
          </label>
          <Textarea name="description_uz" defaultValue={olympiad?.description_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description (RU)
          </label>
          <Textarea name="description_ru" defaultValue={olympiad?.description_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description (EN)
          </label>
          <Textarea name="description_en" defaultValue={olympiad?.description_en ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Subject
          </label>
          <Select name="subject" defaultValue={olympiad?.subject ?? subjects[0]}>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Grade Group
          </label>
          <Select name="grade_group" defaultValue={olympiad?.grade_group ?? gradeGroups[0]}>
            {gradeGroups.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Format
          </label>
          <Select name="format" defaultValue={olympiad?.format ?? formats[0]}>
            {formats.map((item) => (
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
            Date Start
          </label>
          <Input type="date" name="date_start" defaultValue={toDateValue(olympiad?.date_start)} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Date End
          </label>
          <Input type="date" name="date_end" defaultValue={toDateValue(olympiad?.date_end)} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Registration Deadline
          </label>
          <Input
            type="date"
            name="registration_deadline"
            defaultValue={toDateValue(olympiad?.registration_deadline)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fee Amount (optional)
          </label>
          <Input name="fee_amount" defaultValue={olympiad?.fee_amount?.toString() ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Capacity (optional)
          </label>
          <Input name="capacity" type="number" defaultValue={olympiad?.capacity ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          <Input name="cover_image_url" defaultValue={olympiad?.cover_image_url ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Location (UZ)
          </label>
          <Input name="location_uz" required defaultValue={olympiad?.location_uz ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Location (RU)
          </label>
          <Input name="location_ru" required defaultValue={olympiad?.location_ru ?? ""} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Location (EN)
          </label>
          <Input name="location_en" required defaultValue={olympiad?.location_en ?? ""} />
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
