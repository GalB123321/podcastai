import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
 */
export function calculateCredits({
  lengthTier,
  episodes,
  wordCountForPromotion,
  scheduledEpisodes,
  plan
}: CreditCalculationParams): number {
  // Validate plan type and default to personal if invalid
  const validPlan = ['personal', 'creator', 'business', 'enterprise'].includes(plan) 
    ? plan 
    : 'personal';

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
  }[validPlan];

  const finalCost = Math.ceil(totalCost * planDiscount);
  
  // Ensure we never return NaN or negative values
  return Number.isFinite(finalCost) && finalCost > 0 ? finalCost : 1;
}

/**
 * Updates a user's credit balance using Firebase Admin SDK
 */
export async function updateUserCredits(uid: string, amount: number): Promise<void> {
  console.log('[updateUserCredits] Starting credit update for user:', uid);
  
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    // Check if user exists first
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.error('[updateUserCredits] User document not found:', uid);
      throw new Error('User not found in Firestore');
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits ?? 0;
    
    console.log('[updateUserCredits] Current credits:', currentCredits);
    console.log('[updateUserCredits] Deducting:', amount);
    
    // Perform the update
    await userRef.update({
      credits: FieldValue.increment(-amount),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log('[updateUserCredits] Credit update successful');
  } catch (error) {
    console.error('[updateUserCredits] Error updating credits:', error);
    throw error;
  }
}

/**
 * Returns the estimated duration range in minutes for a length tier
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