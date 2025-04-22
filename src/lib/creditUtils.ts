import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { type PlanTier } from './planAccess';

export type LengthTier = 'mini' | 'standard' | 'deep';

export interface CreditCalculationParams {
  lengthTier: LengthTier;
  episodes: number;
  wordCountForPromotion: number;
  scheduledEpisodes: number;
  plan: PlanTier;
}

/**
 * Calculates the total credits required for a podcast generation job
 * @param params - Parameters affecting credit cost
 * @returns Total number of credits required
 * 
 * Credit calculation formula:
 * 1. Base cost: 30 credits
 * 2. Episode length cost: varies by tier (mini: 3, standard: 6, deep: 9) * number of episodes
 * 3. Promotion cost: 10 credits per 100 words (free for business plan)
 * 4. Scheduling cost: 5 credits per episode (free for business plan)
 * 5. Upsell cost: 15 credits per episode beyond 4
 */
export function calculateCredits({
  lengthTier,
  episodes,
  wordCountForPromotion,
  scheduledEpisodes,
  plan
}: CreditCalculationParams): number {
  // Base cost per episode based on length
  const baseCost = {
    mini: 1,
    standard: 2,
    deep: 3
  }[lengthTier];

  // Calculate total base cost for all episodes
  let totalCost = baseCost * episodes;

  // Add cost for promotion text (1 credit per 500 words)
  if (wordCountForPromotion > 0) {
    totalCost += Math.ceil(wordCountForPromotion / 500);
  }

  // Add cost for scheduled episodes
  if (scheduledEpisodes > 0) {
    totalCost += Math.ceil(scheduledEpisodes * 0.5); // 0.5 credits per scheduled episode
  }

  // Apply plan discounts
  const planDiscount = {
    personal: 1,    // No discount
    creator: 0.9,   // 10% discount
    business: 0.8,  // 20% discount
    enterprise: 0.7 // 30% discount
  }[plan];

  return Math.ceil(totalCost * planDiscount);
}

/**
 * Returns the estimated duration range in minutes for a length tier
 * @param lengthTier - The podcast length tier
 * @returns Tuple of [min, max] minutes
 */
export function getDurationRange(lengthTier: LengthTier): [number, number] {
  switch (lengthTier) {
    case 'mini':
      return [3, 5];
    case 'standard':
      return [7, 10];
    case 'deep':
      return [12, 15];
    default:
      throw new Error(`Invalid length tier: ${lengthTier}`);
  }
}

/**
 * Gets a user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().credits || 0) : 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

/**
 * Deducts credits from a user's balance
 */
export async function deductCredits(userId: string, amount: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    credits: increment(-amount)
  });
}

/**
 * Adds credits to a user's balance
 */
export async function addCredits(userId: string, amount: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    credits: increment(amount)
  });
} 