import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip auth check in development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const basicAuth = request.headers.get("authorization");

  if (basicAuth) {
    try {
      const token = basicAuth.split(" ")[1];
      const decoded = Buffer.from(token, "base64").toString();
      const [, password] = decoded.split(":");

      if (password === process.env.AUTH_SECRET) {
        return NextResponse.next();
      }
    } catch {
      // Invalid auth header format
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|favicon.ico).*)",
};
