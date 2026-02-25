import { CalendarCheck2, LayoutDashboard, ClipboardList, User } from "lucide-react";

export const organizerNav = [
  {
    key: "dashboard",
    href: "/organizer",
    icon: LayoutDashboard,
    permission: "olympiads.view"
  },
  {
    key: "olympiads",
    href: "/organizer/olympiads",
    icon: CalendarCheck2,
    permission: "olympiads.view"
  },
  {
    key: "registrations",
    href: "/organizer/registrations",
    icon: ClipboardList,
    permission: "registrations.view"
  },
  {
    key: "profile",
    href: "/organizer/profile",
    icon: User,
    permission: "olympiads.view"
  }
];
