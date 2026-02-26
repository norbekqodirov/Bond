export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return false;
  }

  const isHostedRuntime = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  if (isHostedRuntime) {
    const lower = url.toLowerCase();
    if (lower.includes("localhost") || lower.includes("127.0.0.1")) {
      return false;
    }
  }

  return true;
}

export const DATABASE_REQUIRED_MESSAGE =
  "Database is not configured on Vercel yet. Add DATABASE_URL and run migrations to enable admin data features.";
