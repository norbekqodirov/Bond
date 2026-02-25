"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { subjects } from "@/lib/enums";

const locales = ["uz", "ru", "en"] as const;

type Translation = {
  title: string;
  subtitle: string;
  description: string;
  rules: string;
  seoTitle: string;
  seoDescription: string;
};

type EventFormState = {
  type: string;
  status: string;
  subjects: string[];
  startDate: string;
  endDate: string;
  city: string;
  price: string;
  currency: string;
  capacity: string;
  coverImageUrl: string;
  translations: Record<string, Translation>;
};

const emptyTranslation: Translation = {
  title: "",
  subtitle: "",
  description: "",
  rules: "",
  seoTitle: "",
  seoDescription: ""
};

export function EventForm({ eventId }: { eventId?: string }) {
  const [state, setState] = useState<EventFormState>({
    type: "olympiad",
    status: "draft",
    subjects: [],
    startDate: "",
    endDate: "",
    city: "",
    price: "",
    currency: "UZS",
    capacity: "",
    coverImageUrl: "",
    translations: {
      uz: { ...emptyTranslation },
      ru: { ...emptyTranslation },
      en: { ...emptyTranslation }
    }
  });
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const enumT = useTranslations("enum");

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        const event = data.data;
        const translations: Record<string, Translation> = {
          uz: { ...emptyTranslation },
          ru: { ...emptyTranslation },
          en: { ...emptyTranslation }
        };
        for (const translation of event.translations) {
          translations[translation.locale.toLowerCase()] = {
            title: translation.title ?? "",
            subtitle: translation.subtitle ?? "",
            description: translation.description ?? "",
            rules: translation.rules ?? "",
            seoTitle: translation.seoTitle ?? "",
            seoDescription: translation.seoDescription ?? ""
          };
        }
        setState({
          type: event.type.toLowerCase(),
          status: event.status.toLowerCase(),
          subjects: event.subjects ?? [],
          startDate: event.startDate ? event.startDate.slice(0, 10) : "",
          endDate: event.endDate ? event.endDate.slice(0, 10) : "",
          city: event.city ?? "",
          price: event.price ? String(event.price) : "",
          currency: event.currency ?? "UZS",
          capacity: event.capacity ? String(event.capacity) : "",
          coverImageUrl: event.coverImageUrl ?? "",
          translations
        });
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleTranslationChange = (localeKey: string, key: keyof Translation, value: string) => {
    setState((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [localeKey]: {
          ...prev.translations[localeKey],
          [key]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    const translationsPayload = locales
      .map((localeKey) => ({
        locale: localeKey,
        ...state.translations[localeKey]
      }))
      .filter((translation) => translation.title.trim().length > 0);

    if (translationsPayload.length === 0) {
      setError("At least one language title is required.");
      return;
    }

    const payload = {
      type: state.type,
      status: state.status,
      subjects: state.subjects.length ? state.subjects : null,
      startDate: state.startDate ? new Date(state.startDate).toISOString() : null,
      endDate: state.endDate ? new Date(state.endDate).toISOString() : null,
      city: state.city || null,
      price: state.price ? Number(state.price) : null,
      currency: state.currency || null,
      capacity: state.capacity ? Number(state.capacity) : null,
      coverImageUrl: state.coverImageUrl || null,
      translations: translationsPayload
    };

    const response = await fetch(eventId ? `/api/events/${eventId}` : "/api/events", {
      method: eventId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      router.push(`/${locale}/admin/events`);
    } else {
      setError("Failed to save event. Check required fields.");
    }
  };

  const uploadCover = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      setState((prev) => ({ ...prev, coverImageUrl: data.url }));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">{t("eventForm.type")}</label>
              <Select
                value={state.type}
                onValueChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    type: value,
                    subjects: value === "olympiad" || value === "contest" ? prev.subjects : []
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="olympiad">{enumT("eventType.OLYMPIAD")}</SelectItem>
                  <SelectItem value="contest">{enumT("eventType.CONTEST")}</SelectItem>
                  <SelectItem value="camp">{enumT("eventType.CAMP")}</SelectItem>
                  <SelectItem value="travel">{enumT("eventType.TRAVEL")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.status")}</label>
              <Select value={state.status} onValueChange={(value) => setState((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("status.draft")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="published">{t("status.published")}</SelectItem>
                  <SelectItem value="archived">{t("status.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state.type === "olympiad" || state.type === "contest" ? (
              <div className="md:col-span-2">
                <label className="text-sm font-medium">{t("eventForm.subjects")}</label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {subjects.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      <Checkbox
                        checked={state.subjects.includes(subject)}
                        onCheckedChange={(checked) => {
                          setState((prev) => {
                            const next = new Set(prev.subjects);
                            if (checked) {
                              next.add(subject);
                            } else {
                              next.delete(subject);
                            }
                            return { ...prev, subjects: Array.from(next) };
                          });
                        }}
                      />
                      {enumT(`subject.${subject}`)}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <label className="text-sm font-medium">{t("eventForm.city")}</label>
              <Input
                value={state.city}
                onChange={(event) => setState((prev) => ({ ...prev, city: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.startDate")}</label>
              <Input
                type="date"
                value={state.startDate}
                onChange={(event) => setState((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.endDate")}</label>
              <Input
                type="date"
                value={state.endDate}
                onChange={(event) => setState((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.price")}</label>
              <Input
                type="number"
                value={state.price}
                onChange={(event) => setState((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.currency")}</label>
              <Input
                value={state.currency}
                onChange={(event) => setState((prev) => ({ ...prev, currency: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.capacity")}</label>
              <Input
                type="number"
                value={state.capacity}
                onChange={(event) => setState((prev) => ({ ...prev, capacity: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("eventForm.coverImage")}</label>
              <Input
                value={state.coverImageUrl}
                onChange={(event) => setState((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                placeholder="Image URL"
              />
              <input
                type="file"
                className="mt-2 text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadCover(file);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="uz">
            <TabsList>
              {locales.map((localeKey) => (
              <TabsTrigger key={localeKey} value={localeKey}>
                {localeKey.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
            {locales.map((localeKey) => (
              <TabsContent key={localeKey} value={localeKey}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">{t("eventForm.title")}</label>
                    <Input
                      value={state.translations[localeKey].title}
                      onChange={(event) => handleTranslationChange(localeKey, "title", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("eventForm.subtitle")}</label>
                    <Input
                      value={state.translations[localeKey].subtitle}
                      onChange={(event) => handleTranslationChange(localeKey, "subtitle", event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">{t("eventForm.description")}</label>
                    <Textarea
                      value={state.translations[localeKey].description}
                      onChange={(event) => handleTranslationChange(localeKey, "description", event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">{t("eventForm.rules")}</label>
                    <Textarea
                      value={state.translations[localeKey].rules}
                      onChange={(event) => handleTranslationChange(localeKey, "rules", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("eventForm.seoTitle")}</label>
                    <Input
                      value={state.translations[localeKey].seoTitle}
                      onChange={(event) => handleTranslationChange(localeKey, "seoTitle", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("eventForm.seoDescription")}</label>
                    <Input
                      value={state.translations[localeKey].seoDescription}
                      onChange={(event) => handleTranslationChange(localeKey, "seoDescription", event.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          {eventId ? t("actions.update") : t("actions.create")}
        </Button>
      </div>
    </div>
  );
}
