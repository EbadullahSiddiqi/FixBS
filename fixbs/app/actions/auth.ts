"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Retrieves the GitHub OAuth access token for the authenticated Clerk user.
 */
export async function getClerkGitHubAccessToken(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const client = await clerkClient();
    const tokenResponse = await client.users.getUserOauthAccessToken(
      userId,
      "oauth_github"
    );

    // Depending on Clerk version, tokenResponse can be { data: [...] } or an Array
    const tokens = Array.isArray(tokenResponse)
      ? tokenResponse
      : tokenResponse.data;

    if (tokens && tokens.length > 0 && tokens[0].token) {
      return tokens[0].token;
    }

    return null;
  } catch (error) {
    console.error("Error retrieving Clerk GitHub OAuth token:", error);
    return null;
  }
}
