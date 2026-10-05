import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

// Edge middleware can't run jsonwebtoken (it needs Node's crypto module), so
// this only checks whether a session cookie is present. The cookie's
// signature is fully verified server-side in Node-runtime code via
// getSessionUser() before any data is returned, so this is a UX redirect,
// not the security boundary.
export function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
