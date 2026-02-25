"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutGrid,
  CalendarCheck,
  Trophy,
  Bell,
  User,
  LogOut
} from "lucide-react";

import { cn } from "@/lib/utils";

type UserInfo = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

const navItems = [
  { key: "catalog", href: "/app", icon: LayoutGrid },
  { key: "olympiads", href: "/app/olympiads", icon: CalendarCheck },
  { key: "results", href: "/app/results", icon: Trophy },
  { key: "notifications", href: "/app/notifications", icon: Bell },
  { key: "profile", href: "/app/profile", icon: User }
];

export function UserAppShell({
  user,
  children
}: {
  user: UserInfo;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("app");

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.phone || "BOND";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push(`/${locale}/auth/login`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-64 flex-col border-r border-slate-100 bg-white px-5 py-8 lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
              B
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("appName")}
              </div>
              <div className="text-lg font-semibold text-slate-900">BOND</div>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const href = `/${locale}${item.href}`;
              const active = pathname === href || (item.href !== "/app" && pathname.startsWith(href));
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 px-5 py-4 backdrop-blur-lg lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("greeting")}
                </p>
                <p className="text-lg font-semibold text-slate-900">{displayName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/app/notifications`}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:text-brand-primary"
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs font-semibold uppercase text-slate-500 shadow-sm transition hover:text-brand-primary lg:flex"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>

          <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/90 px-6 py-3 shadow-lg backdrop-blur lg:hidden">
            <div className="flex items-center justify-between">
              {navItems.map((item) => {
                const Icon = item.icon;
                const href = `/${locale}${item.href}`;
                const active = pathname === href || (item.href !== "/app" && pathname.startsWith(href));
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 text-[11px] font-semibold",
                      active ? "text-brand-primary" : "text-slate-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
