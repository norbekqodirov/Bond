"use client";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  const message = error?.message ?? "Unknown error";
  const looksLikeDatabaseIssue =
    message.includes("DATABASE_URL") ||
    message.includes("Prisma") ||
    message.includes("Can't reach database");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <h2 className="text-base font-semibold">Admin panel temporarily unavailable</h2>
        <p className="mt-2 text-sm">
          {looksLikeDatabaseIssue
            ? "Database is not configured on Vercel yet. Add DATABASE_URL and run migrations to enable admin pages."
            : "A server error occurred while loading this admin page."}
        </p>
        {error?.digest ? <p className="mt-1 text-xs opacity-80">Digest: {error.digest}</p> : null}
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}
