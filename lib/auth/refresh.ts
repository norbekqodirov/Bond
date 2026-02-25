import crypto from "crypto";

export function generateTokenPair() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
