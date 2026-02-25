"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

type Olympiad = {
  id: string;
  startDate?: string | null;
  endDate?: string | null;
  region?: string | null;
  price?: string | number | null;
  currency?: string | null;
  coverImageUrl?: string | null;
  translations?: Array<{
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
  }>;
};

type Registration = {
  id: string;
  status: string;
  paymentStatus: string;
  olympiad?: Olympiad;
};

type TelegramUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

const tabs = ["catalog", "my", "profile"] as const;
type Tab = (typeof tabs)[number];

const localeMap: Record<string, "uz" | "ru" | "en"> = {
  uz: "uz",
  ru: "ru",
  en: "en"
};

function resolveAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function MiniAppPage() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<TelegramUser | null>(null);
  const [locale, setLocale] = useState<"uz" | "ru" | "en">("uz");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [events, setEvents] = useState<Olympiad[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Olympiad | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("miniapp_access_token");
    if (stored) {
      setAuthToken(stored);
    }
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    const initData = tg?.initData;
    const initUser = (tg?.initDataUnsafe?.user ?? null) as TelegramUser | null;
    if (initUser) {
      setProfile(initUser);
      const nextLocale = initUser.language_code ? localeMap[initUser.language_code] : undefined;
      if (nextLocale) {
        setLocale(nextLocale);
      }
      setFormName([initUser.first_name, initUser.last_name].filter(Boolean).join(" "));
    }

    if (!initData) {
      setStatus("ready");
      return;
    }

    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Auth failed");
        }
        return res.json();
      })
      .then((payload) => {
        setAuthToken(payload.accessToken);
        window.localStorage.setItem("miniapp_access_token", payload.accessToken);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    fetch(`/api/catalog/olympiads?locale=${locale}`)
      .then(async (res) => {
        const payload = await res.json();
        return payload.data ?? [];
      })
      .then(setEvents)
      .catch(() => null);
  }, [locale, status]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`/api/registrations?scope=me&locale=${locale}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(async (res) => {
        const payload = await res.json();
        return payload.data ?? [];
      })
      .then(setRegistrations)
      .catch(() => null);
  }, [authToken, locale]);

  const selectedTitle = selected?.translations?.[0]?.title ?? "Event";
  const selectedDesc =
    selected?.translations?.[0]?.description ?? selected?.translations?.[0]?.subtitle ?? "";
  const selectedImage = resolveAssetUrl(selected?.coverImageUrl);

  const headerLabel = useMemo(() => {
    if (tab === "catalog") return "Catalog";
    if (tab === "my") return "My registrations";
    return "Profile";
  }, [tab]);

  const handleRegister = async () => {
    if (!selected || !formName || !formPhone) {
      setMessage("Please enter name and phone.");
      return;
    }
    setMessage("");
    const res = await fetch(`/api/catalog/olympiads/${selected.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantName: formName,
        phone: formPhone
      })
    });
    if (!res.ok) {
      setMessage("Registration failed.");
      return;
    }
    setMessage("Registration created.");
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-10 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
              BOND Mini App
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{headerLabel}</h1>
          </div>
          {profile?.username ? (
            <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-soft">
              @{profile.username}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          {tabs.map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                tab === key
                  ? "bg-brand-primary text-white"
                  : "border border-slate-200 bg-white text-slate-500"
              }`}
            >
              {key === "catalog" ? "Catalog" : key === "my" ? "My" : "Profile"}
            </button>
          ))}
        </div>

        {status === "loading" ? (
          <div className="mt-10 text-sm text-slate-500">Loading...</div>
        ) : status === "error" ? (
          <div className="mt-10 text-sm text-rose-500">
            Telegram auth failed. Please reopen the mini app.
          </div>
        ) : null}

        {status === "ready" && tab === "catalog" ? (
          <div className="mt-8 grid gap-4">
            {events.map((event) => {
              const title = event.translations?.[0]?.title ?? "Event";
              const subtitle = event.translations?.[0]?.subtitle ?? "";
              const cover = resolveAssetUrl(event.coverImageUrl);
              return (
                <button
                  key={event.id}
                  className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5"
                  onClick={() => setSelected(event)}
                >
                  <div className="h-20 w-28 overflow-hidden rounded-2xl bg-slate-100">
                    {cover ? <img src={cover} alt={title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-900">{title}</div>
                    <div className="text-xs font-medium text-slate-500">{subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {status === "ready" && tab === "my" ? (
          <div className="mt-8 space-y-3">
            {registrations.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                No registrations yet.
              </div>
            ) : (
              registrations.map((reg) => (
                <div key={reg.id} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {reg.olympiad?.translations?.[0]?.title ?? "Olympiad"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Status: {reg.status} • Payment: {reg.paymentStatus}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {status === "ready" && tab === "profile" ? (
          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Telegram</div>
            <div className="mt-2 text-xs text-slate-500">
              {profile?.first_name} {profile?.last_name}
            </div>
            <div className="mt-1 text-xs text-slate-500">{profile?.username ?? "No username"}</div>
            <div className="mt-4 text-xs text-slate-400">Locale: {locale}</div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">{selectedTitle}</div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            {selectedImage ? (
              <img src={selectedImage} alt={selectedTitle} className="mt-4 h-44 w-full rounded-2xl object-cover" />
            ) : null}
            <p className="mt-4 text-sm text-slate-600">{selectedDesc}</p>

            <div className="mt-6 grid gap-3">
              <input
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
              <input
                value={formPhone}
                onChange={(event) => setFormPhone(event.target.value)}
                placeholder="Phone"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
              {message ? <div className="text-xs text-rose-500">{message}</div> : null}
              <button
                onClick={handleRegister}
                className="rounded-2xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
