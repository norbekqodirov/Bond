"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import type { Subject, Format } from "@/lib/enums";
import { grades, subjects } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { submitRegistration, type RegistrationState } from "@/app/[locale]/actions/registration";
import { Trophy } from "lucide-react";

export type OlympiadOption = {
  id: string;
  title: string;
  type?: string;
  subject?: Subject;
  subjects?: Subject[];
  format?: Format;
  dateLabel: string;
  location: string;
};

const initialState: RegistrationState = { ok: false };

export function Registration({
  olympiads,
  selectedOlympiadId,
  eventId,
  hideOlympiadSelect,
  showSteps = true,
  variant = "section"
}: {
  olympiads: OlympiadOption[];
  selectedOlympiadId?: string | null;
  eventId?: string | null;
  hideOlympiadSelect?: boolean;
  showSteps?: boolean;
  variant?: "section" | "embedded";
}) {
  const t = useTranslations("registration");
  const enumT = useTranslations("enum");
  const [state, formAction] = useFormState(submitRegistration, initialState);
  const [showToast, setShowToast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedId, setSelectedId] = useState(selectedOlympiadId ?? "");

  const selectedItem = olympiads.find((item) => item.id === selectedId);
  const subjectOptions = selectedItem
    ? selectedItem.subjects && selectedItem.subjects.length > 0
      ? selectedItem.subjects
      : selectedItem.subject
        ? [selectedItem.subject]
        : []
    : subjects;
  const showSubjectSelect = subjectOptions.length > 0;
  const consentTypeLabel = selectedItem?.type
    ? enumT(`eventType.${selectedItem.type}`)
    : t("form.consentFallback");

  useEffect(() => {
    if (state.ok) {
      setShowToast(true);
      formRef.current?.reset();
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.ok]);

  useEffect(() => {
    if (selectedOlympiadId) {
      setSelectedId(selectedOlympiadId);
    }
  }, [selectedOlympiadId]);

  const containerClass = showSteps
    ? "grid gap-12 lg:grid-cols-2 lg:gap-16"
    : variant === "embedded"
    ? "w-full"
    : "mx-auto max-w-3xl";

  const content = (
    <div className={containerClass}>
      {showSteps ? (
        <div>
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-semibold text-brand-primary sm:text-3xl md:text-4xl">
                {t("title")}
              </h2>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary sm:h-12 sm:w-12">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-8 space-y-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-primary/10 bg-brand-primary/5 text-base font-semibold text-brand-primary sm:h-12 sm:w-12 sm:text-lg">
                    {step}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Step {step}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {t(`step${step}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[40px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8 md:p-12">
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary" />

        <form ref={formRef} action={formAction} className="space-y-6">
          {hideOlympiadSelect ? (
            <>
              {eventId ? (
                <input type="hidden" name="eventId" value={eventId} />
              ) : (
                <input type="hidden" name="olympiadId" value={selectedId} />
              )}
            </>
          ) : olympiads.length > 0 ? (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("form.olympiad")}
              </label>
              <NativeSelect
                name="olympiadId"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                <option value="">{t("form.select")}</option>
                {olympiads.map((olympiad) => (
                  <option key={olympiad.id} value={olympiad.id}>
                    {olympiad.title}
                  </option>
                ))}
              </NativeSelect>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("form.name")}
            </label>
            <Input name="full_name" required placeholder="John Doe" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("form.grade")}
              </label>
              <NativeSelect name="grade" required defaultValue={grades[0]}>
                {grades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {showSubjectSelect ? (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("form.subject")}
                </label>
                <NativeSelect
                  key={selectedId || "all"}
                  name="subject"
                  required
                  defaultValue={selectedItem?.subject ?? subjectOptions[0]}
                >
                  {subjectOptions.map((item) => (
                    <option key={item} value={item}>
                      {enumT(`subject.${item}`)}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("form.phone")}
            </label>
            <Input name="phone" required placeholder="+998 ..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("form.telegram")}
              </label>
              <Input name="telegram" placeholder="@username" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("form.email")}
              </label>
              <Input name="email" type="email" placeholder="email@example.com" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="consent" name="consent" required />
            <label htmlFor="consent" className="text-sm font-medium text-slate-500">
              {t("form.consent", { event: consentTypeLabel })}
            </label>
          </div>

          {state.message && !state.ok ? (
            <p className="text-sm font-semibold text-rose-500">
              {t("error")}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-[24px] bg-brand-primary py-5 text-sm font-semibold uppercase tracking-wide text-white shadow-soft transition-colors hover:bg-brand-accent"
          >
            {t("form.submit")}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <section
      id="registration"
      className={variant === "embedded" ? "relative" : "bg-slate-50 py-16 sm:py-20 lg:py-24"}
    >
      {showToast ? (
        <div className="fixed right-4 top-24 z-50 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-soft sm:right-6">
          {t("success")}
        </div>
      ) : null}
      {variant === "embedded" ? (
        content
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{content}</div>
      )}
    </section>
  );
}


