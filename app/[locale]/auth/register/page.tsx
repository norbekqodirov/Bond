"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizePhone = (value: string) => value.trim().replace(/[^\d+]/g, "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const normalizedPhone = normalizePhone(phone);
      const res = await fetch("/api/auth/web/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          phone: normalizedPhone,
          password,
          passwordConfirm
        })
      });
      if (!res.ok) {
        if (res.status === 409) {
          setError(t("phoneExists"));
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
        <h1 className="text-2xl font-display font-semibold text-brand-primary">{t("registerTitle")}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">{t("registerSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("firstName")}
            </label>
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-brand-primary"
              placeholder="Ali"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("lastName")}
            </label>
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-brand-primary"
              placeholder="Karimov"
            />
          </div>
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
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("passwordConfirm")}
            </label>
            <div className="relative mt-2">
              <input
                value={passwordConfirm}
                type={showPasswordConfirm ? "text" : "password"}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-20 text-sm font-medium text-slate-700 outline-none focus:border-brand-primary"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-primary"
              >
                {showPasswordConfirm ? t("hidePassword") : t("showPassword")}
              </button>
            </div>
          </div>
          {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-primary px-4 py-3 text-xs font-semibold uppercase text-white shadow-soft transition disabled:opacity-60"
          >
            {t("submitRegister")}
          </button>
        </form>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/auth/login`} className="font-semibold text-brand-primary">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
