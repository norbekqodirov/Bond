import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLocalizedAdmin = /^\/(uz|ru|en)\/admin(\/|$)/.test(pathname);
  const isLocalizedOrganizer = /^\/(uz|ru|en)\/organizer(\/|$)/.test(pathname);

  if (pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/organizer")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Admin/organizer locale routes rely on auth cookies; avoid middleware rewrites here.
  if (isLocalizedAdmin || isLocalizedOrganizer) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(uz|ru|en)/:path*", "/admin/:path*", "/organizer/:path*"]
};
