'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/useToast';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import CreditMeter from '@/components/account/CreditMeter';
import { Toggle } from '@/components/ui/Toggle';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { PlanTier, planLimits, getAvailableFeatures, getFeatureDisplayName, hasAccessToFeature } from '@/lib/planAccess';
import { useRouter } from 'next/navigation';
import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import PlanLockMessage from '@/components/access/PlanLockMessage';
import type { Feature } from '@/lib/planAccess';

const PLAN_TIERS: PlanTier[] = ['personal', 'creator', 'business'];
const FEATURES: Feature[] = [
  'spotifyExport',
  'promotion',
  'advancedDashboard',
  'templates',
  'customBranding',
  'apiAccess',
  'prioritySupport',
  'teamManagement',
  'remix',
  'editing',
  'memoryAccess',
  'series'
];

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { credits, loading: isCreditsLoading, addCredits } = useCredits();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isGenZ, setIsGenZ] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('genz-mode') === 'true';
    }
    return false;
  });

  // Get user's plan from Firestore data with fallback to 'personal'
  const isFirestoreLoading = !user?.firestoreData;
  const userPlan = user?.firestoreData?.plan === 'free' ? 'personal' : (user?.firestoreData?.plan || 'personal');
  const currentPlan = userPlan as PlanTier;
  
  // Only compute these values if we have the plan
  const planFeatures = isFirestoreLoading ? [] : getAvailableFeatures(currentPlan);
  const limits = planLimits[currentPlan];

  // Show loading state if either credits or Firestore data is loading
  if (isCreditsLoading || isFirestoreLoading) {
    return (
      <RequireAuth>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto w-full px-4 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-surface rounded-lg"></div>
              <div className="h-64 bg-surface rounded-lg"></div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty',
        variant: 'error'
      });
      return;
    }

    try {
      // TODO: Implement name update logic
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'error'
      });
    }
  };

  const toggleGenZMode = (enabled: boolean) => {
    setIsGenZ(enabled);
    localStorage.setItem('genz-mode', enabled.toString());
  };

  const handleBuyCredits = () => {
    addCredits(10);
  };

  const isFeatureAvailable = (plan: PlanTier, feature: Feature) => {
    return hasAccessToFeature(plan, feature);
  };

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto w-full px-4 py-12 space-y-12">
          {/* Profile Section */}
          <section 
            className="space-y-6 bg-surface p-6 rounded-lg border border-muted"
            role="region" 
            aria-labelledby="profile-heading"
          >
            <h2 id="profile-heading" className="text-2xl font-semibold">Profile</h2>
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl text-white">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <InputField
                      label="Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      id="name-input"
                    />
                    <div className="flex gap-2">
                      <PrimaryButton onClick={handleNameSave}>Save</PrimaryButton>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{user?.displayName}</h3>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-muted-foreground hover:text-primary"
                        aria-label="Edit profile name"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Credits Section */}
          <section 
            className="space-y-6 bg-surface p-6 rounded-lg border border-muted"
            role="region" 
            aria-labelledby="credits-heading"
          >
            <h2 id="credits-heading" className="text-2xl font-semibold">Credits & Plan</h2>
            <div className="space-y-6">
              <CreditMeter
                credits={credits || 0}
                maxCredits={limits.monthlyCredits}
                onBuyMore={handleBuyCredits}
              />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Current Plan</h3>
                  <span className="text-primary font-semibold capitalize">{currentPlan}</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✨ {limits.monthlyCredits} credits per month</p>
                  <p>⏱️ Up to {limits.maxEpisodeLength} minute episodes</p>
                  <p>💾 {limits.storageLimit}GB storage</p>
                  <p>👥 Up to {limits.maxTeamMembers} team members</p>
                </div>
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Available Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {planFeatures.map(feature => (
                      <div 
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="w-4 h-4 text-green-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/plans">
                  <PrimaryButton>Upgrade Plan</PrimaryButton>
                </Link>
                <PrimaryButton
                  onClick={handleBuyCredits}
                  disabled={isCreditsLoading}
                >
                  Buy Extra Credits
                </PrimaryButton>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section 
            className="space-y-6 bg-surface p-6 rounded-lg border border-muted"
            role="region" 
            aria-labelledby="preferences-heading"
          >
            <h2 id="preferences-heading" className="text-2xl font-semibold">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Toggle
                  isChecked={theme === 'dark'}
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  label="Dark Mode"
                  name="dark-mode"
                />
              </div>
              <div className="flex items-center justify-between">
                <Toggle
                  isChecked={isGenZ}
                  onChange={toggleGenZMode}
                  label="Gen Z Mode"
                  name="genz-mode"
                />
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section 
            className="space-y-6 bg-surface p-6 rounded-lg border border-muted"
            role="region" 
            aria-labelledby="actions-heading"
          >
            <h2 id="actions-heading" className="text-2xl font-semibold">Account Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <SignOutButton />
              <Link href="/delete-account">
                <button 
                  className="text-red-500 hover:text-red-600 font-medium"
                  aria-label="Delete your PodcastAI account"
                >
                  Delete My Account
                </button>
              </Link>
            </div>
          </section>

          {/* Current Plan Header */}
          <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-display text-textPrimary mb-2">
                  Your Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h1>
                <p className="text-textSecondary">
                  {planLimits[currentPlan].monthlyCredits} credits/month • 
                  {planLimits[currentPlan].maxEpisodeLength} min episodes • 
                  {planLimits[currentPlan].storageLimit}GB storage
                </p>
              </div>
              <div className="flex-shrink-0">
                <CreditMeter 
                  credits={credits || 0}
                  maxCredits={limits.monthlyCredits}
                  onBuyMore={() => router.push('/plans')}
                />
              </div>
            </div>
            <PrimaryButton
              onClick={() => router.push('/plans')}
              className="w-full sm:w-auto"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Upgrade Plan
            </PrimaryButton>
          </div>

          {/* Feature Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-surface">Features</th>
                  {PLAN_TIERS.map((plan) => (
                    <th 
                      key={plan}
                      className={`text-center p-4 bg-surface ${
                        plan === currentPlan 
                          ? 'border-2 border-primary text-primary'
                          : ''
                      }`}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      {plan === currentPlan && (
                        <div className="text-xs text-primary mt-1">Current Plan</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature) => (
                  <tr key={feature} className="border-t border-border">
                    <td className="p-4 bg-surface">
                      {getFeatureDisplayName(feature)}
                    </td>
                    {PLAN_TIERS.map((plan) => (
                      <td 
                        key={`${feature}-${plan}`} 
                        className={`text-center p-4 bg-surface ${
                          plan === currentPlan 
                            ? 'border-x-2 border-primary'
                            : ''
                        }`}
                      >
                        {isFeatureAvailable(plan, feature) ? (
                          <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                        ) : (
                          <LockClosedIcon className="w-6 h-6 text-textSecondary mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Locked Features */}
          <div className="mt-8 space-y-6">
            {FEATURES.map((feature) => {
              if (!isFeatureAvailable(currentPlan, feature)) {
                return (
                  <PlanLockMessage 
                    key={feature}
                    feature={feature}
                  />
                );
              }
              return null;
            })}
          </div>

          {/* Sticky Upgrade CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden">
            <PrimaryButton
              onClick={() => router.push('/plans')}
              className="w-full"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Upgrade to Unlock More Features
            </PrimaryButton>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
} 