import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { OlympiadForm } from "@/components/admin/OlympiadForm";

export default async function EditOlympiadPage({
  params
}: {
  params: { id: string };
}) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">Edit Olympiad</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  const olympiad = await prisma.olympiad.findUnique({
    where: { id: params.id }
  });

  if (!olympiad) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        Edit Olympiad
      </h1>
      <OlympiadForm olympiad={olympiad} />
    </div>
  );
}
