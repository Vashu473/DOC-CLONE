import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("ajaia_session")?.value;
  const path = request.nextUrl.pathname;
  if (path.startsWith("/docs") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/docs", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/docs/:path*", "/login"],
};
