import { shouldEnforceAuth } from "./config";

export async function getAuthHeader(): Promise<string> {
  // Skip auth header in development unless explicitly enabled
  if (!shouldEnforceAuth) {
    return "";
  }

  // Make a test request to our own API to get the auth header
  const response = await fetch("/api/auth-test");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  const authHeader = response.headers.get("x-auth-header");
  if (!authHeader) {
    throw new Error("Auth header not found");
  }
  return authHeader;
}

export function verifyAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;

  try {
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Basic") return false;

    const decoded = Buffer.from(token, "base64").toString();
    const [, password] = decoded.split(":");
    return password === process.env.AUTH_SECRET;
  } catch {
    return false;
  }
}
