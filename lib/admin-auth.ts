import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "bond_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  email: string;
  iat: number;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return "bond-local-admin-session-secret";
    }
    throw new Error("ADMIN_SESSION_SECRET is not set.");
  }
  return secret.trim();
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function createSessionToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email,
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  };
  const secret = getSecret();
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const secret = getSecret();
  const expected = sign(encoded, secret);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim();
  const expectedPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (!expectedEmail || !expectedPassword) {
    return false;
  }
  const emailMatch = safeEqual(email.trim(), expectedEmail);
  const passwordMatch = safeEqual(password, expectedPassword);
  return emailMatch && passwordMatch;
}

export function setAdminSession(email: string) {
  const token = createSessionToken(email);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export function clearAdminSession() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function getAdminSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
