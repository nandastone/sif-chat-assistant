import { SessionData, User } from "@auth0/nextjs-auth0/types";
import { auth0 } from "../../lib/auth0";

const REQUIRED_MEMBERSHIP = "SIF AI Assistant";

/**
 * Decode JWT token to get claims.
 */
export function decodeJWT(token: string): any {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], "base64").toString()
      );
      return payload;
    }
  } catch (e) {
    console.error("Error decoding JWT:", e);
  }
  return undefined;
}

/**
 * Enrich session with app_metadata from ID token.
 */
export function enrichSessionWithAppMetadata(session: SessionData): void {
  const idToken = session.tokenSet?.idToken;

  if (idToken) {
    const idTokenPayload = decodeJWT(idToken);

    if (idTokenPayload) {
      const appMetadata = idTokenPayload["https://atma-id.com/app_metadata"];

      if (appMetadata) {
        session.user.app_metadata = appMetadata;
      }
    }
  }
}

/**
 * Get Auth0 session and verify membership for API routes.
 *
 * @returns The session and user objects if the user has the required membership, undefined otherwise.
 */
export async function getAuth0SessionAndVerifyMembership(): Promise<
  AuthResult | undefined
> {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return undefined;
    }

    // Enrich session with app_metadata from token.
    enrichSessionWithAppMetadata(session);

    if (!hasRequiredMembership(session.user)) {
      return undefined;
    }

    return { session, user: session.user };
  } catch (error) {
    console.error("Error getting Auth0 session:", error);
    return undefined;
  }
}

/**
 * Check if user has the required "SIF AI Assistant" membership.
 *
 * @param user - The user object.
 * @returns True if the user has the required membership, false otherwise.
 */
export function hasRequiredMembership(user: User): boolean {
  const appMetadata = user.app_metadata;
  if (!appMetadata?.memberships) {
    return false;
  }

  return appMetadata.memberships.includes(REQUIRED_MEMBERSHIP);
}

type AuthResult = {
  session: SessionData;
  user: User;
};
