import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RegistrationDetailForm } from "@/components/admin/RegistrationDetailForm";

export default async function RegistrationDetailPage({
  params
}: {
  params: { id: string };
}) {
  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    include: { olympiad: true }
  });

  if (!registration) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        Registration Detail
      </h1>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Full Name
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.full_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phone
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.phone}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Telegram
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.telegram ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.email ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subject
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.subject}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Grade Group
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.grade_group}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Format Preference
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.format_preference}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Olympiad
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {registration.olympiad?.title_en ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <RegistrationDetailForm registration={registration} />
      </div>
    </div>
  );
}
