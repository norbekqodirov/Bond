import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { OrganizerShell } from "@/components/organizer/OrganizerShell";
import { getServerSession } from "@/lib/auth/server";

export default async function OrganizerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/organizer/login`);
  }

  if (!session.permissions.has("olympiads.view")) {
    const locale = await getLocale();
    redirect(`/${locale}/organizer/unauthorized`);
  }

  return (
    <OrganizerShell
      user={{
        label: session.user.email ?? session.user.phone ?? "Organizer"
      }}
      permissions={Array.from(session.permissions)}
    >
      {children}
    </OrganizerShell>
  );
}
