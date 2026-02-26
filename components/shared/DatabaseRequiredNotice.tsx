type DatabaseRequiredNoticeProps = {
  title?: string;
  description?: string;
};

export function DatabaseRequiredNotice({
  title = "Database setup required",
  description = "This admin page needs a configured database. Add DATABASE_URL in Vercel, run Prisma migrations, and redeploy."
}: DatabaseRequiredNoticeProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{description}</p>
      <div className="mt-3 text-xs opacity-80">
        Required next step: set <code>DATABASE_URL</code> in Vercel project settings.
      </div>
    </div>
  );
}
