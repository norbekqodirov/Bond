import crypto from "crypto";

type InitDataResult = {
  ok: boolean;
  data?: Record<string, string>;
};

export function verifyTelegramInitData(initData: string, botToken: string): InitDataResult {
  if (!initData || !botToken) {
    return { ok: false };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    return { ok: false };
  }

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) {
    return { ok: false };
  }

  const data: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }

  return { ok: true, data };
}
