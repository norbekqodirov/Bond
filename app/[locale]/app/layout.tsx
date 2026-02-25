import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/server";
import type { Locale } from "@/lib/settings";
import { UserAppShell } from "@/components/user-app/UserAppShell";

export default async function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const session = await getServerSession();
  if (!session) {
    redirect(`/${params.locale}/auth/login`);
  }

  const user = session.user;

  return (
    <UserAppShell
      user={{
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phone: user.phone ?? null
      }}
    >
      {children}
    </UserAppShell>
  );
}
