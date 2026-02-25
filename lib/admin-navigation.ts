import {
  LayoutDashboard,
  CalendarRange,
  ClipboardList,
  Building2,
  CreditCard,
  FileText,
  Settings,
  ShieldCheck,
  FileWarning,
  Users,
  Bell
} from "lucide-react";

export type NavItem = {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission: string;
};

export const adminNav: NavItem[] = [
  {
    key: "dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "dashboard.view"
  },
  {
    key: "events",
    href: "/admin/events",
    icon: CalendarRange,
    permission: "events.view"
  },
  {
    key: "registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
    permission: "registrations.view"
  },
  {
    key: "users",
    href: "/admin/users",
    icon: Users,
    permission: "rbac.view"
  },
  {
    key: "organizations",
    href: "/admin/organizations",
    icon: Building2,
    permission: "organizations.view"
  },
  {
    key: "finance",
    href: "/admin/finance/transactions",
    icon: CreditCard,
    permission: "payments.view"
  },
  {
    key: "content",
    href: "/admin/content/articles",
    icon: FileText,
    permission: "content.view"
  },
  {
    key: "settings",
    href: "/admin/content/settings",
    icon: Settings,
    permission: "settings.view"
  },
  {
    key: "notifications",
    href: "/admin/notifications",
    icon: Bell,
    permission: "audit.view"
  },
  {
    key: "access",
    href: "/admin/access/roles",
    icon: ShieldCheck,
    permission: "rbac.view"
  },
  {
    key: "audit",
    href: "/admin/audit",
    icon: FileWarning,
    permission: "audit.view"
  }
];
