import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Registrations", href: "/admin/registrations" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Settings", href: "/admin/settings" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-lg font-bold text-white shadow-soft">
              B
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">BOND Admin</p>
              <p className="text-xs text-slate-400">Content management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/logout"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-brand-primary"
            >
              Logout
            </Link>
          </div>
        </div>
        <nav className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-4 text-sm font-semibold text-slate-500 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
