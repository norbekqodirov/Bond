import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n/routing";
import { isDatabaseConfigured } from "./lib/database";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const dbConfigured = isDatabaseConfigured();
  const publicApiBypass = pathname === "/api/admin/login" || pathname === "/api/auth/logout";

  if (pathname.startsWith("/api/")) {
    if (!dbConfigured && !publicApiBypass) {
      return NextResponse.json(
        { error: "Database is not configured", code: "DATABASE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    return NextResponse.next();
  }

  // Keep legacy admin routes untouched (they use their own auth/session flow).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/organizer")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(uz|ru|en)/:path*", "/admin/:path*", "/organizer/:path*", "/api/:path*"]
};
