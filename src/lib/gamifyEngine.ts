import { firestore } from 'firebase-admin';
import type { Transaction } from 'firebase-admin/firestore';

/**
 * Valid actions that can earn points
 */
export type GamifyAction = 'createEpisode' | 'shareEpisode' | 'publishEpisode' | 'rateEpisode';

/**
 * Point values for each action
 */
export const POINT_VALUES: Record<GamifyAction, number> = {
  createEpisode: 10,
  shareEpisode: 5,
  publishEpisode: 30,
  rateEpisode: 3
} as const;

/**
 * Badge definition with threshold and description
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  requirement: BadgeRequirement;
}

/**
 * Available badges in order of achievement
 */
export const BADGES: Badge[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Earned your first points',
    icon: '👶',
    requirement: {
      type: 'points',
      points: 10
    }
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reached 100 points',
    icon: '⭐',
    requirement: {
      type: 'points',
      points: 100
    }
  },
  {
    id: 'podcast_pro',
    name: 'Podcast Pro',
    description: 'Reached 500 points',
    icon: '👑',
    requirement: {
      type: 'points',
      points: 500
    }
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Created episodes for 7 consecutive days',
    icon: '🔥',
    requirement: {
      type: 'streak',
      days: 7
    }
  },
  {
    id: 'streak-14',
    name: '2-Week Streak',
    description: 'Created episodes for 14 consecutive days',
    icon: '🌟',
    requirement: {
      type: 'streak',
      days: 14
    }
  },
  {
    id: 'streak-30',
    name: 'Monthly Streak',
    description: 'Created episodes for 30 consecutive days',
    icon: '🏆',
    requirement: {
      type: 'streak',
      days: 30
    }
  },
  {
    id: 'streak-100',
    name: 'Centurion',
    description: 'Created episodes for 100 consecutive days',
    icon: '👑',
    requirement: {
      type: 'streak',
      days: 100
    }
  }
];

/**
 * Error thrown by the gamification engine
 */
export class GamifyError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly userId?: string
  ) {
    super(message);
    this.name = 'GamifyError';
  }
}

/**
 * Award points to a user for a specific action
 * @param userId - The ID of the user to award points to
 * @param action - The action that earned the points
 * @throws {GamifyError} If the operation fails
 */
export async function awardPoints(
  userId: string,
  action: GamifyAction
): Promise<void> {
  try {
    // Validate action
    if (!Object.keys(POINT_VALUES).includes(action)) {
      throw new GamifyError(
        `Invalid action: ${action}`,
        'INVALID_ACTION',
        userId
      );
    }

    const pointsToAward = POINT_VALUES[action];
    const userRef = firestore()
      .collection('users')
      .doc(userId);

    // Run in transaction to ensure atomic update
    await firestore().runTransaction(async (transaction: Transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new GamifyError(
          `User ${userId} not found`,
          'USER_NOT_FOUND',
          userId
        );
      }

      const userData = userDoc.data();
      const currentPoints = userData?.points || 0;
      const newPoints = currentPoints + pointsToAward;

      // Update points and add to action history
      transaction.update(userRef, {
        points: newPoints,
        lastUpdated: firestore.FieldValue.serverTimestamp(),
        [`actionHistory.${action}`]: firestore.FieldValue.arrayUnion({
          timestamp: new Date(),
          points: pointsToAward
        })
      });
    });
  } catch (error: unknown) {
    if (error instanceof GamifyError) {
      throw error;
    }
    throw new GamifyError(
      `Failed to award points: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'AWARD_POINTS_FAILED',
      userId
    );
  }
}

export type BadgeRequirement = {
  type: 'points' | 'streak';
  points?: number;
  days?: number;
};

/**
 * Checks if a user has unlocked a badge based on their streak
 * @param badge - The badge to check
 * @param streakData - The user's streak data
 * @returns Whether the badge is unlocked
 */
function checkStreakBadge(badge: Badge, streakData: StreakData): boolean {
  if (badge.requirement.type !== 'streak' || !badge.requirement.days) {
    return false;
  }
  return streakData.currentStreak >= badge.requirement.days;
}

/**
 * Checks if a user has unlocked a badge based on their points
 * @param badge - The badge to check
 * @param points - The user's current points
 * @returns Whether the badge is unlocked
 */
function checkPointsBadge(badge: Badge, points: number): boolean {
  if (badge.requirement.type !== 'points' || !badge.requirement.points) {
    return false;
  }
  return points >= badge.requirement.points;
}

/**
 * Checks which badges a user has unlocked based on their points and streak data
 * @param points - The user's current points
 * @param streakData - The user's streak data
 * @returns Array of unlocked badge IDs
 */
export function checkUnlockedBadges(points: number, streakData: StreakData): string[] {
  return BADGES.filter(badge => {
    if (badge.requirement.type === 'points') {
      return checkPointsBadge(badge, points);
    } else if (badge.requirement.type === 'streak') {
      return checkStreakBadge(badge, streakData);
    }
    return false;
  }).map(badge => badge.id);
}

/**
 * Get badge details by ID
 * @param badgeId - The ID of the badge to look up
 * @returns Badge details or undefined if not found
 */
export function getBadgeDetails(badgeId: string): Badge | undefined {
  return BADGES.find(badge => badge.id === badgeId);
}

/**
 * Get all available badges and their thresholds
 * @returns Array of all badge definitions
 */
export function getAllBadges(): Badge[] {
  return [...BADGES];
}

/**
 * Interface for streak data
 */
export interface StreakData {
  currentStreak: number;
  lastActionDate: Date;
  longestStreak: number;
  streakStartDate: Date;
}

/**
 * Updates a user's streak based on their latest action
 * @param userId - The ID of the user to update streak for
 * @returns The updated streak data
 * @throws {GamifyError} If the operation fails
 */
export async function updateStreak(userId: string): Promise<StreakData> {
  try {
    const userRef = firestore()
      .collection('users')
      .doc(userId);

    // Run in transaction to ensure atomic update
    return await firestore().runTransaction(async (transaction: Transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new GamifyError(
          `User ${userId} not found`,
          'USER_NOT_FOUND',
          userId
        );
      }

      const userData = userDoc.data();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get existing streak data or initialize new
      const streakData: StreakData = {
        currentStreak: userData?.streak?.currentStreak || 0,
        lastActionDate: userData?.streak?.lastActionDate?.toDate() || new Date(0),
        longestStreak: userData?.streak?.longestStreak || 0,
        streakStartDate: userData?.streak?.streakStartDate?.toDate() || today
      };

      // Convert lastActionDate to start of day for comparison
      const lastActionDay = new Date(
        streakData.lastActionDate.getFullYear(),
        streakData.lastActionDate.getMonth(),
        streakData.lastActionDate.getDate()
      );

      // Calculate days between last action and today
      const daysDiff = Math.floor((today.getTime() - lastActionDay.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already acted today, no streak update needed
        return streakData;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        streakData.currentStreak++;
        streakData.lastActionDate = now;
        
        // Update longest streak if current is higher
        if (streakData.currentStreak > streakData.longestStreak) {
          streakData.longestStreak = streakData.currentStreak;
        }
      } else {
        // Streak broken, reset
        streakData.currentStreak = 1;
        streakData.lastActionDate = now;
        streakData.streakStartDate = today;
      }

      // Update streak data in Firestore
      transaction.update(userRef, {
        streak: {
          currentStreak: streakData.currentStreak,
          lastActionDate: firestore.Timestamp.fromDate(streakData.lastActionDate),
          longestStreak: streakData.longestStreak,
          streakStartDate: firestore.Timestamp.fromDate(streakData.streakStartDate)
        },
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });

      return streakData;
    });
  } catch (error: unknown) {
    if (error instanceof GamifyError) {
      throw error;
    }
    throw new GamifyError(
      `Failed to update streak: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UPDATE_STREAK_FAILED',
      userId
    );
  }
}

/**
 * Fetches user data and checks which badges they have unlocked
 * @param userId - The ID of the user to check badges for
 * @returns Array of unlocked badge IDs
 * @throws {GamifyError} If the operation fails
 */
export async function checkUserBadges(userId: string): Promise<string[]> {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new GamifyError(
        `User ${userId} not found`,
        'USER_NOT_FOUND',
        userId
      );
    }

    const userData = userDoc.data();
    const points = userData?.points || 0;
    const streakData: StreakData = {
      currentStreak: userData?.streak?.currentStreak || 0,
      lastActionDate: userData?.streak?.lastActionDate?.toDate() || new Date(0),
      longestStreak: userData?.streak?.longestStreak || 0,
      streakStartDate: userData?.streak?.streakStartDate?.toDate() || new Date()
    };

    return checkUnlockedBadges(points, streakData);
  } catch (error: unknown) {
    if (error instanceof GamifyError) {
      throw error;
    }
    throw new GamifyError(
      `Failed to check badges: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CHECK_BADGES_FAILED',
      userId
    );
  }
} 