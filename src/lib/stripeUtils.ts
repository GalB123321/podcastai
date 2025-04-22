import { firestore } from 'firebase-admin';
import type { Transaction } from 'firebase-admin/firestore';

/**
 * Subscription tiers available in the system
 */
export type SubscriptionTier = 'free' | 'creator' | 'pro';

/**
 * User plan information
 */
export interface UserPlan {
  tier: SubscriptionTier;
  creditsRemaining: number;
}

/**
 * Error thrown when user has insufficient credits
 */
export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

/**
 * Error thrown when user data cannot be found
 */
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Charges (deducts) credits from a user's balance
 * @param userId - The ID of the user to charge
 * @param credits - Number of credits to deduct
 * @throws {InsufficientCreditsError} If user doesn't have enough credits
 * @throws {UserNotFoundError} If user cannot be found
 * @throws {DatabaseError} If database operation fails
 */
export async function chargeCredits(
  userId: string,
  credits: number
): Promise<void> {
  try {
    // Get user document reference
    const userRef = firestore().collection('users').doc(userId);
    
    // Run transaction to ensure atomic update
    await firestore().runTransaction(async (transaction: Transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new UserNotFoundError(userId);
      }

      const userData = userDoc.data();
      const currentCredits = userData?.creditsRemaining || 0;

      if (currentCredits < credits) {
        throw new InsufficientCreditsError(
          `Insufficient credits. Required: ${credits}, Available: ${currentCredits}`
        );
      }

      // Update credits atomically
      transaction.update(userRef, {
        creditsRemaining: currentCredits - credits,
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });
    });
  } catch (error: unknown) {
    if (error instanceof InsufficientCreditsError || 
        error instanceof UserNotFoundError) {
      throw error;
    }
    throw new DatabaseError(
      `Failed to charge credits: ${error instanceof Error ? error.message : 'Unknown error'}`,
      (error as { code?: string })?.code
    );
  }
}

/**
 * Fetches a user's current subscription plan and remaining credits
 * @param userId - The ID of the user to fetch plan for
 * @returns Object containing subscription tier and remaining credits
 * @throws {UserNotFoundError} If user cannot be found
 * @throws {DatabaseError} If database operation fails
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  try {
    // Get user document
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new UserNotFoundError(userId);
    }

    const userData = userDoc.data();
    
    // Get subscription data
    const subscriptionDoc = await firestore()
      .collection('subscriptions')
      .doc(userId)
      .get();

    const subscriptionData = subscriptionDoc.exists 
      ? subscriptionDoc.data() 
      : { tier: 'free' as SubscriptionTier };
    return {
      tier: subscriptionData?.tier ?? 'free',
      creditsRemaining: userData?.creditsRemaining ?? 0
    };
  } catch (error: unknown) {
    if (error instanceof UserNotFoundError) {
      throw error;
    }
    throw new DatabaseError(
      `Failed to fetch user plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      (error as { code?: string })?.code
    );
  }
}

/**
 * Utility function to validate credit amount
 * @param credits - Number of credits to validate
 * @returns boolean indicating if credit amount is valid
 */
function isValidCreditAmount(credits: number): boolean {
  return Number.isInteger(credits) && credits > 0;
} 