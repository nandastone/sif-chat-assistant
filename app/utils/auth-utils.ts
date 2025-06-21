import { SessionData, User } from "@auth0/nextjs-auth0/types";
import { auth0 } from "../../lib/auth0";

/**
 * Get Auth0 session for API routes.
 * Note: Membership validation is handled globally by Auth0 action.
 *
 * @returns The session and user objects if authenticated, undefined otherwise.
 */
export async function getAuth0Session(): Promise<AuthResult | undefined> {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return undefined;
    }

    return { session, user: session.user };
  } catch (error) {
    console.error("Error getting Auth0 session:", error);
    return undefined;
  }
}

type AuthResult = {
  session: SessionData;
  user: User;
};
