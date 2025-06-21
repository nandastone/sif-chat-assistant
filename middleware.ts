import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Intercept failed auth callback and redirect to logout to clear the session.
  if (pathname === "/auth/callback" && searchParams.has("error")) {
    const logoutUrl = new URL("/auth/logout", request.url);
    return NextResponse.redirect(logoutUrl);
  }

  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    // Authentication routes — let the middleware handle it.
    return authRes;
  }

  const { origin } = new URL(request.url);
  const session = await auth0.getSession();

  if (!session) {
    // User does not have a session — redirect to login.
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
