import { SessionData, User } from "@auth0/nextjs-auth0/types";
import { auth0 } from "../../lib/auth0";

const REQUIRED_MEMBERSHIP = "SIF AI Assistant";

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
  console.log("user", user);
  if (!user?.app_metadata?.memberships) {
    return false;
  }

  console.log("user.app_metadata.memberships", user.app_metadata.memberships);

  return user.app_metadata.memberships.includes(REQUIRED_MEMBERSHIP);
}

type AuthResult = {
  session: SessionData;
  user: User;
};
