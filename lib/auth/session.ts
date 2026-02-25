import { cookies } from "next/headers";

import { tokenConfig } from "./tokens";

export const ACCESS_COOKIE = "bond_access";
export const REFRESH_COOKIE = "bond_refresh";

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: tokenConfig.accessTokenTtlSeconds,
    path: "/"
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: tokenConfig.refreshTokenTtlDays * 24 * 60 * 60,
    path: "/"
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
  cookieStore.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function getAuthCookies() {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_COOKIE)?.value ?? null
  };
}
