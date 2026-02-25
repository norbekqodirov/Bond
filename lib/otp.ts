import crypto from "crypto";

import { getRedisClient } from "@/lib/redis";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES ?? 5);
const OTP_RATE_LIMIT = Number(process.env.OTP_RATE_LIMIT ?? 5);

function otpKey(phone: string) {
  return `otp:${phone}`;
}

function otpRateKey(phone: string) {
  return `otp:rate:${phone}`;
}

export function hashOtpCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtpCode(phone: string) {
  const redis = await getRedisClient();
  const ttlSeconds = OTP_TTL_MINUTES * 60;

  const rateCount = await redis.incr(otpRateKey(phone));
  if (rateCount === 1) {
    await redis.expire(otpRateKey(phone), ttlSeconds);
  }
  if (rateCount > OTP_RATE_LIMIT) {
    throw new Error("Too many OTP requests");
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  await redis.set(otpKey(phone), codeHash, { EX: ttlSeconds });

  return { code, codeHash, ttlSeconds };
}

export async function verifyOtpCode(phone: string, code: string) {
  const redis = await getRedisClient();
  const storedHash = await redis.get(otpKey(phone));
  if (!storedHash) {
    return false;
  }
  if (storedHash !== hashOtpCode(code)) {
    return false;
  }
  await redis.del(otpKey(phone));
  return true;
}
