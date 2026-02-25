"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navKeys = [
  { key: "schedule", href: "#schedule" },
  { key: "rating", href: "#rating" },
  { key: "about", href: "#about" },
  { key: "registration", href: "#registration" },
  { key: "news", href: "#news" },
  { key: "contact", href: "#contact" }
];

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ firstName?: string | null; lastName?: string | null } | null>(null);

  const basePath = pathname.replace(`/${locale}`, "") || "";
  const query = searchParams.toString();

  const localeHref = (target: string) =>
    `/${target}${basePath}${query ? `?${query}` : ""}`;

  useEffect(() => {
    let ignore = false;
    fetch("/api/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        const payload = await res.json();
        return payload.data ?? null;
      })
      .then((data) => {
        if (!ignore) {
          setUser(data);
        }
      })
      .catch(() => null);
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center">
          <Image
            src="/img/logo/logo.png"
            alt="BOND"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <div className="flex items-center gap-1.5">
            {navKeys.map((item) => (
              <a
                key={item.key}
                href={`/${locale}${item.href}`}
                className="rounded-full px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200/70" />
          {user ? (
            <Link
              href={`/${locale}/app`}
              className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase text-brand-primary transition hover:border-brand-primary/40 hover:bg-brand-primary/15"
            >
              {t("nav.profile")}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase text-slate-600 transition hover:border-brand-primary hover:text-brand-primary"
              >
                {t("nav.login")}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold uppercase text-white shadow-soft transition hover:bg-brand-accent"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
          <div className="relative border-l border-slate-200/70 pl-4">
            <div className="group relative pb-2">
              <button
                type="button"
                className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase text-slate-600 transition hover:border-brand-primary"
              >
                {locale.toUpperCase()}
              </button>
              <div className="absolute right-0 top-full z-50 hidden w-24 rounded-2xl border border-slate-100 bg-white p-2 shadow-soft group-hover:block group-focus-within:block">
                {locales
                  .filter((item) => item !== locale)
                  .map((item) => (
                    <Link
                      key={item}
                      href={localeHref(item)}
                      className={cn(
                        "flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {item}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-6 py-6 md:hidden">
          <div className="space-y-4">
            {navKeys.map((item) => (
              <a
                key={item.key}
                href={`/${locale}${item.href}`}
                onClick={() => setOpen(false)}
                className="block text-lg font-semibold text-slate-700"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
            {user ? (
              <Link
                href={`/${locale}/app`}
                onClick={() => setOpen(false)}
                className="block rounded-full border border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600"
              >
                {t("nav.profile")}
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setOpen(false)}
                  className="block text-lg font-semibold text-slate-700"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-brand-primary px-4 py-2 text-center text-xs font-semibold uppercase text-white shadow-soft"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              {locales.map((item) => (
                <Link
                  key={item}
                  href={localeHref(item)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold uppercase",
                    locale === item
                      ? "border-brand-primary text-brand-primary"
                      : "border-slate-200 text-slate-500"
                  )}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
