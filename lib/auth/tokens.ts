import { SignJWT, jwtVerify } from "jose";

const ACCESS_COOKIE_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_COOKIE_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export const tokenConfig = {
  accessTokenTtlSeconds: ACCESS_COOKIE_TTL_SECONDS,
  refreshTokenTtlDays: REFRESH_COOKIE_TTL_DAYS
};

export async function signAccessToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_COOKIE_TTL_SECONDS}s`)
    .sign(getAccessSecret());
}

export async function signRefreshToken(userId: string) {
  return new SignJWT({ tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_COOKIE_TTL_DAYS}d`)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  return payload;
}
