import { z } from 'zod';

// Define plan types
export const PlanTier = z.enum(['personal', 'creator', 'business', 'enterprise']);
export type PlanTier = z.infer<typeof PlanTier>;

// Define feature types
export const Feature = z.enum([
  'promotion',
  'spotifyExport', 
  'advancedDashboard',
  'templates',
  'customBranding',
  'apiAccess',
  'prioritySupport',
  'teamManagement',
  'remix',
  'editing',
  'memoryAccess',
  'series',
  'scheduleEpisodes'
]);
export type Feature = z.infer<typeof Feature>;

// Define plan limits
export const planLimits = {
  personal: {
    monthlyCredits: 100,
    maxEpisodeLength: 30, // in minutes
    storageLimit: 1, // in GB
    maxTeamMembers: 1
  },
  creator: {
    monthlyCredits: 500,
    maxEpisodeLength: 60,
    storageLimit: 5,
    maxTeamMembers: 3
  },
  business: {
    monthlyCredits: 2000,
    maxEpisodeLength: 120,
    storageLimit: 20,
    maxTeamMembers: 10
  },
  enterprise: {
    monthlyCredits: 5000,
    maxEpisodeLength: 240,
    storageLimit: 100,
    maxTeamMembers: 25
  }
} as const;

// Define access matrix
const accessMatrix: Record<PlanTier, Record<Feature, boolean>> = {
  personal: {
    promotion: false,
    spotifyExport: false,
    advancedDashboard: false,
    templates: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    teamManagement: false,
    remix: false,
    editing: true,
    memoryAccess: false,
    series: false,
    scheduleEpisodes: false
  },
  creator: {
    promotion: false,
    spotifyExport: true,
    advancedDashboard: true,
    templates: true,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    teamManagement: true,
    remix: true,
    editing: true,
    memoryAccess: true,
    series: true,
    scheduleEpisodes: true
  },
  business: {
    promotion: true,
    spotifyExport: true,
    advancedDashboard: true,
    templates: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    teamManagement: true,
    remix: true,
    editing: true,
    memoryAccess: true,
    series: true,
    scheduleEpisodes: true
  },
  enterprise: {
    promotion: true,
    spotifyExport: true,
    advancedDashboard: true,
    templates: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    teamManagement: true,
    remix: true,
    editing: true,
    memoryAccess: true,
    series: true,
    scheduleEpisodes: true
  }
};

/**
 * Check if a user's plan has access to a specific feature
 * @param plan The user's current plan tier
 * @param feature The feature to check access for
 * @returns boolean indicating if the user has access
 */
export const hasAccessToFeature = (
  plan: PlanTier,
  feature: Feature
): boolean => {
  return accessMatrix[plan]?.[feature] ?? false;
};

/**
 * Get the minimum plan tier required for a feature
 * @param feature The feature to check
 * @returns The minimum plan tier required
 */
export const getMinimumPlanForFeature = (feature: Feature): PlanTier => {
  const tiers: PlanTier[] = ['personal', 'creator', 'business', 'enterprise'];
  return tiers.find(tier => accessMatrix[tier][feature]) || 'enterprise';
};

/**
 * Check if a plan meets or exceeds a required plan level
 * @param userPlan The user's current plan
 * @param requiredPlan The minimum required plan
 * @returns boolean indicating if the user's plan is sufficient
 */
export const meetsMinimumPlan = (userPlan: PlanTier, requiredPlan: PlanTier): boolean => {
  const tiers: PlanTier[] = ['personal', 'creator', 'business', 'enterprise'];
  return tiers.indexOf(userPlan) >= tiers.indexOf(requiredPlan);
};

/**
 * Get all features available for a plan
 * @param plan The plan tier to check
 * @returns Array of features available for the plan
 */
export const getAvailableFeatures = (plan: PlanTier): Feature[] => {
  return Object.entries(accessMatrix[plan])
    .filter(([_, hasAccess]) => hasAccess)
    .map(([feature]) => feature as Feature);
};

/**
 * Get a human-readable name for a feature
 */
export const getFeatureDisplayName = (feature: Feature): string => {
  const displayNames: Record<Feature, string> = {
    promotion: 'Promotion Insertion',
    spotifyExport: 'Spotify Export',
    advancedDashboard: 'Advanced Dashboard',
    templates: 'Episode Templates',
    customBranding: 'Custom Branding',
    apiAccess: 'API Access',
    prioritySupport: 'Priority Support',
    teamManagement: 'Team Management',
    remix: 'Episode Remixing',
    editing: 'Episode Editing',
    memoryAccess: 'Memory Access',
    series: 'Series Management',
    scheduleEpisodes: 'Schedule Episodes'
  };
  return displayNames[feature];
};

/**
 * Get all features that would be unlocked by upgrading to a specific plan
 */
export const getNewFeaturesForPlan = (currentPlan: PlanTier, targetPlan: PlanTier): Feature[] => {
  if (!meetsMinimumPlan(targetPlan, currentPlan)) {
    return [];
  }
  
  const currentFeatures = new Set(getAvailableFeatures(currentPlan));
  const targetFeatures = getAvailableFeatures(targetPlan);
  
  return targetFeatures.filter(feature => !currentFeatures.has(feature));
};

/**
 * Get plan limits comparison between current and target plan
 */
export const getPlanLimitsComparison = (currentPlan: PlanTier, targetPlan: PlanTier) => {
  const current = planLimits[currentPlan];
  const target = planLimits[targetPlan];
  
  return {
    monthlyCredits: {
      current: current.monthlyCredits,
      target: target.monthlyCredits,
      increase: target.monthlyCredits - current.monthlyCredits
    },
    maxEpisodeLength: {
      current: current.maxEpisodeLength,
      target: target.maxEpisodeLength,
      increase: target.maxEpisodeLength - current.maxEpisodeLength
    },
    storageLimit: {
      current: current.storageLimit,
      target: target.storageLimit,
      increase: target.storageLimit - current.storageLimit
    },
    maxTeamMembers: {
      current: current.maxTeamMembers,
      target: target.maxTeamMembers,
      increase: target.maxTeamMembers - current.maxTeamMembers
    }
  };
};

export type PlanType = 'personal' | 'pro' | 'enterprise'; 