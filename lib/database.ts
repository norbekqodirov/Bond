export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export const DATABASE_REQUIRED_MESSAGE =
  "Database is not configured on Vercel yet. Add DATABASE_URL and run migrations to enable admin data features.";
