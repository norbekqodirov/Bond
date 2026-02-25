"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizePhone = (value: string) => value.trim().replace(/[^\d+]/g, "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedPhone = normalizePhone(phone);
      const res = await fetch("/api/auth/web/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: normalizedPhone, password })
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError(t("invalidCredentials"));
        } else {
          setError(t("error"));
        }
        return;
      }
      router.push(`/${locale}/app`);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28">
      <div className="mx-auto w-full max-w-md rounded-[32px] border border-slate-100 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">{t("loginTitle")}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">{t("loginSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("phone")}
            </label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-brand-primary"
              placeholder="+998901234567"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("password")}
            </label>
            <div className="relative mt-2">
              <input
                value={password}
                type={showPassword ? "text" : "password"}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-20 text-sm font-medium text-slate-700 outline-none focus:border-brand-primary"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-primary"
              >
                {showPassword ? t("hidePassword") : t("showPassword")}
              </button>
            </div>
          </div>
          {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-primary px-4 py-3 text-xs font-semibold uppercase text-white shadow-soft transition disabled:opacity-60"
          >
            {t("submitLogin")}
          </button>
        </form>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/auth/register`} className="font-semibold text-brand-primary">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
