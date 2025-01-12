import { NextResponse } from "next/server";
import { verifyAuth } from "../../utils/auth-utils";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!verifyAuth(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Echo back the auth header for the client to use
  return new NextResponse("OK", {
    headers: {
      "x-auth-header": authHeader!,
    },
  });
}
