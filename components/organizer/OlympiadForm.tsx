"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const locales = ["uz", "ru", "en"] as const;

type Translation = {
  title: string;
  subtitle: string;
  description: string;
  rules: string;
  prizes: string;
  seoTitle: string;
  seoDescription: string;
};

type OlympiadFormState = {
  organizerId: string;
  type: string;
  status: string;
  subject: string;
  gradeGroup: string;
  level: string;
  format: string;
  region: string;
  language: string;
  startDate: string;
  endDate: string;
  location: string;
  price: string;
  currency: string;
  capacity: string;
  coverImageUrl: string;
  certificateUrl: string;
  translations: Record<string, Translation>;
};

const emptyTranslation: Translation = {
  title: "",
  subtitle: "",
  description: "",
  rules: "",
  prizes: "",
  seoTitle: "",
  seoDescription: ""
};

export function OlympiadForm({
  olympiadId,
  allowOrganizerSelect = false
}: {
  olympiadId?: string;
  allowOrganizerSelect?: boolean;
}) {
  const [state, setState] = useState<OlympiadFormState>({
    organizerId: "",
    type: "olympiad",
    status: "draft",
    subject: "english",
    gradeGroup: "g5_7",
    level: "a2",
    format: "offline",
    region: "",
    language: "uz",
    startDate: "",
    endDate: "",
    location: "",
    price: "",
    currency: "UZS",
    capacity: "",
    coverImageUrl: "",
    certificateUrl: "",
    translations: {
      uz: { ...emptyTranslation },
      ru: { ...emptyTranslation },
      en: { ...emptyTranslation }
    }
  });
  const [loading, setLoading] = useState(Boolean(olympiadId));
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!olympiadId) return;
    fetch(`/api/olympiads/${olympiadId}`)
      .then((res) => res.json())
      .then((data) => {
        const olympiad = data.data;
        const translations: Record<string, Translation> = {
          uz: { ...emptyTranslation },
          ru: { ...emptyTranslation },
          en: { ...emptyTranslation }
        };
        for (const translation of olympiad.translations) {
          translations[translation.locale.toLowerCase()] = {
            title: translation.title ?? "",
            subtitle: translation.subtitle ?? "",
            description: translation.description ?? "",
            rules: translation.rules ?? "",
            prizes: translation.prizes ?? "",
            seoTitle: translation.seoTitle ?? "",
            seoDescription: translation.seoDescription ?? ""
          };
        }
        setState({
          organizerId: olympiad.organizerId ?? "",
          type: olympiad.type.toLowerCase(),
          status: olympiad.status.toLowerCase(),
          subject: olympiad.subject.toLowerCase(),
          gradeGroup: olympiad.gradeGroup.toLowerCase(),
          level: olympiad.level ? olympiad.level.toLowerCase() : "a2",
          format: olympiad.format.toLowerCase(),
          region: olympiad.region ?? "",
          language: olympiad.language ? olympiad.language.toLowerCase() : "uz",
          startDate: olympiad.startDate ? olympiad.startDate.slice(0, 10) : "",
          endDate: olympiad.endDate ? olympiad.endDate.slice(0, 10) : "",
          location: olympiad.location ?? "",
          price: olympiad.price ? String(olympiad.price) : "",
          currency: olympiad.currency ?? "UZS",
          capacity: olympiad.capacity ? String(olympiad.capacity) : "",
          coverImageUrl: olympiad.coverImageUrl ?? "",
          certificateUrl: olympiad.certificateUrl ?? "",
          translations
        });
      })
      .finally(() => setLoading(false));
  }, [olympiadId]);

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

    const primaryTranslation = translationsPayload[0];

    const payload = {
      organizerId: allowOrganizerSelect ? state.organizerId || null : undefined,
      type: state.type,
      status: state.status,
      subject: state.subject,
      gradeGroup: state.gradeGroup,
      level: state.level || null,
      format: state.format,
      region: state.region || null,
      language: state.language || null,
      startDate: state.startDate ? new Date(state.startDate).toISOString() : null,
      endDate: state.endDate ? new Date(state.endDate).toISOString() : null,
      location: state.location || null,
      price: state.price ? Number(state.price) : null,
      currency: state.currency || null,
      capacity: state.capacity ? Number(state.capacity) : null,
      coverImageUrl: state.coverImageUrl || null,
      certificateUrl: state.certificateUrl || null,
      rules: primaryTranslation.rules || null,
      prizes: primaryTranslation.prizes || null,
      translations: translationsPayload
    };

    const response = await fetch(olympiadId ? `/api/olympiads/${olympiadId}` : "/api/olympiads", {
      method: olympiadId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      router.push(`/${locale}/organizer/olympiads`);
    } else {
      setError("Failed to save olympiad. Check required fields.");
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
          <div className="grid gap-4 md:grid-cols-3">
            {allowOrganizerSelect ? (
              <div>
                <label className="text-sm font-medium">Organizer ID</label>
                <Input
                  value={state.organizerId}
                  onChange={(event) => setState((prev) => ({ ...prev, organizerId: event.target.value }))}
                />
              </div>
            ) : null}
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={state.type} onValueChange={(value) => setState((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="olympiad">Olympiad</SelectItem>
                  <SelectItem value="contest">Contest</SelectItem>
                  <SelectItem value="camp">Camp</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={state.status} onValueChange={(value) => setState((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={state.subject} onValueChange={(value) => setState((prev) => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="mental">Mental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Grade group</label>
              <Select
                value={state.gradeGroup}
                onValueChange={(value) => setState((prev) => ({ ...prev, gradeGroup: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Grade group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g1_4">1-4</SelectItem>
                  <SelectItem value="g5_7">5-7</SelectItem>
                  <SelectItem value="g8_9">8-9</SelectItem>
                  <SelectItem value="g10_11">10-11</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Level</label>
              <Select value={state.level} onValueChange={(value) => setState((prev) => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a2">A2</SelectItem>
                  <SelectItem value="b1">B1</SelectItem>
                  <SelectItem value="b2">B2</SelectItem>
                  <SelectItem value="c1">C1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Format</label>
              <Select value={state.format} onValueChange={(value) => setState((prev) => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="staged">Staged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <Input value={state.region} onChange={(event) => setState((prev) => ({ ...prev, region: event.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select value={state.language} onValueChange={(value) => setState((prev) => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">UZ</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Start date</label>
              <Input
                type="date"
                value={state.startDate}
                onChange={(event) => setState((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <Input
                type="date"
                value={state.endDate}
                onChange={(event) => setState((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={state.location}
                onChange={(event) => setState((prev) => ({ ...prev, location: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                value={state.price}
                onChange={(event) => setState((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Input
                value={state.currency}
                onChange={(event) => setState((prev) => ({ ...prev, currency: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input
                type="number"
                value={state.capacity}
                onChange={(event) => setState((prev) => ({ ...prev, capacity: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cover image</label>
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
            <div>
              <label className="text-sm font-medium">Certificate URL</label>
              <Input
                value={state.certificateUrl}
                onChange={(event) => setState((prev) => ({ ...prev, certificateUrl: event.target.value }))}
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
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={state.translations[localeKey].title}
                      onChange={(event) => handleTranslationChange(localeKey, "title", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subtitle</label>
                    <Input
                      value={state.translations[localeKey].subtitle}
                      onChange={(event) => handleTranslationChange(localeKey, "subtitle", event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={state.translations[localeKey].description}
                      onChange={(event) => handleTranslationChange(localeKey, "description", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rules</label>
                    <Textarea
                      value={state.translations[localeKey].rules}
                      onChange={(event) => handleTranslationChange(localeKey, "rules", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prizes</label>
                    <Textarea
                      value={state.translations[localeKey].prizes}
                      onChange={(event) => handleTranslationChange(localeKey, "prizes", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SEO title</label>
                    <Input
                      value={state.translations[localeKey].seoTitle}
                      onChange={(event) => handleTranslationChange(localeKey, "seoTitle", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SEO description</label>
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
        <Button onClick={handleSubmit}>{olympiadId ? "Update" : "Create"}</Button>
      </div>
    </div>
  );
}
