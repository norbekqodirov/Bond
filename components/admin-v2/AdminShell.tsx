"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Menu, User } from "lucide-react";

import { adminNav } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export type AdminShellProps = {
  user: { email: string };
  permissions: string[];
  children: React.ReactNode;
};

export function AdminShell({ user, permissions, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("admin");
  const locale = useLocale();

  const visibleNav = adminNav.filter((item) => permissions.includes(item.permission));
  const basePath = `/${locale}`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={cn(
          "flex flex-col border-r border-border/70 bg-white transition-all",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className={cn("text-sm font-semibold text-slate-900", collapsed && "hidden")}>
            {t("title")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((prev) => !prev)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-2 pb-6">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname?.endsWith(item.href);
            return (
              <Link
                key={item.key}
                href={`${basePath}${item.href}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100",
                  active && "bg-slate-100 text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className={cn(collapsed && "hidden")}>{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 pb-4 text-xs text-muted-foreground">v2.0</div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/70 bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = `/${locale}/admin/login`;
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <Separator />
        <main className="flex-1 space-y-6 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
