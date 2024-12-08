// src/appwrite/Services/authServices.js

import { account, teams } from "../config";
import { Query } from "appwrite";

export async function registerUser(username, email, password) {
  const user = await account.create("unique()", email, password, username);
  localStorage.setItem("authToken", user.$id);
  return user;
}

export const getUserRoles = async (userId) => {
  try {
    const DASHBOARD_TEAM_ID = '671ca690003781eae833';

    // Fetch all the memberships in the Dashboard team
    const limit = 25;
    let offset = 0;
    let memberships = [];
    let totalMemberships = [];

    do {
      const response = await teams.listMemberships(DASHBOARD_TEAM_ID, [
        Query.limit(limit),
        Query.offset(offset),
      ]);
      memberships = response.memberships;
      totalMemberships = totalMemberships.concat(memberships);
      offset += limit;
    } while (memberships.length === limit);

    // Find the membership for the user
    const userMembership = totalMemberships.find(
      (membership) => membership.userId === userId
    );

    if (!userMembership) {
      throw new Error('User is not a member of the Dashboard team');
    }

    // Normalize roles to lowercase
    const userRoles = userMembership.roles.map(role => role.toLowerCase());

    // Return the roles
    return userRoles;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

/**
 * Signs in a user and handles MFA if required.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The session object along with MFA requirement.
 */
export const signIn = async (email, password) => {
  try {
    // Delete existing session if any
    try {
      const currentSession = await account.getSession('current');
      if (currentSession) {
        await account.deleteSession('current');
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
      }
    } catch (error) {
      // No existing session
    }

    // Authenticate the user
    const session = await account.createEmailPasswordSession(email, password);

    // Check for multi-factor authentication requirement
    try {
      await account.get(); // Attempt to get user data
      // If successful, MFA is not required
      const user = await getCurrentUser();

      // Check if MFA is required but not enabled
      if (user.prefs.mfaRequired && !user.prefs.mfaEnabled) {
        return {
          session,
          userId: session.userId,
          requiresMfaSetup: true,
        };
      }

      // Proceed to normal login flow
      await handleSuccessfulLogin(session);
      return {
        session,
        userId: session.userId,
        roles: JSON.parse(localStorage.getItem("userRoles")),
        requiresMFA: false,
      };
    } catch (error) {
      if (error.type === 'user_more_factors_required') {
        // MFA is required
        return {
          session,
          userId: session.userId,
          requiresMFA: true,
        };
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Handle successful login
const handleSuccessfulLogin = async (session) => {
  localStorage.setItem("authToken", session.$id);
  localStorage.setItem("userId", session.userId);

  // Get user roles
  const userRoles = await getUserRoles(session.userId);

  if (!userRoles || userRoles.length === 0) {
    // Delete session if no roles assigned
    await account.deleteSession(session.$id);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    throw new Error("User has no roles assigned.");
  }

  // Store user roles
  localStorage.setItem("userRoles", JSON.stringify(userRoles));
};

/**
 * Creates an MFA challenge for the user.
 * @param {string} factor - The MFA factor to use ('email', 'phone', 'totp', 'recoverycode').
 * @returns {Promise<Object>} The challenge object.
 */
export const createMfaChallenge = async (factor) => {
  try {
    const challenge = await account.createMfaChallenge(factor);
    return challenge;
  } catch (error) {
    console.error("Error creating MFA challenge:", error);
    throw error;
  }
};

/**
 * Completes the MFA challenge by verifying the code.
 * @param {string} challengeId - The challenge ID.
 * @param {string} code - The code provided by the user.
 * @returns {Promise<Object>} The user object after successful verification.
 */
export const completeMfaChallenge = async (challengeId, code) => {
  try {
    await account.updateMfaChallenge(challengeId, code);

    // Fetch user to confirm authentication
    const user = await account.get();

    // Handle successful login
    await handleSuccessfulLogin({ $id: 'current', userId: user.$id });

    return {
      userId: user.$id,
      roles: JSON.parse(localStorage.getItem("userRoles")),
    };
  } catch (error) {
    console.error("Error completing MFA challenge:", error);
    throw error;
  }
};

/**
 * Enables MFA on the user's account.
 * @returns {Promise<void>}
 */
export const enableMfa = async () => {
  try {
    await account.updateMFA(true);
  } catch (error) {
    console.error("Error enabling MFA:", error);
    throw error;
  }
};

/**
 * Generates recovery codes for the user.
 * @returns {Promise<Array>} An array of recovery codes.
 */
export const generateRecoveryCodes = async () => {
  try {
    const response = await account.createMfaRecoveryCodes();
    return response.recoveryCodes;
  } catch (error) {
    console.error("Error generating recovery codes:", error);
    throw error;
  }
};

/**
 * Updates user preferences.
 * @param {Object} prefs - The preferences to update.
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (prefs) => {
  try {
    await account.updatePrefs(prefs);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await account.deleteSession('current');
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRoles");
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
};

export const sendPasswordRecoveryEmail = async (email) => {
  const resetPasswordUrl = `${window.location.origin}/reset-password`;
  try {
    await account.createRecovery(email, resetPasswordUrl);
  } catch (error) {
    throw error;
  }
};
