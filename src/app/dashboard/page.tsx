'use client';

import { useAuth } from '@/hooks/useAuth';
import { hasAccessToFeature, type PlanTier } from '@/lib/planAccess';
import PlanLockMessage from '@/components/access/PlanLockMessage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';

function DashboardContent() {
  const { user } = useAuth();
  const userPlan = (user?.firestoreData?.plan as PlanTier) || 'personal';
  const hasAdvancedDashboard = hasAccessToFeature(userPlan, 'advancedDashboard');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-textPrimary mb-4">
        Your Dashboard
      </h1>
      <p className="text-textSecondary">
        Welcome back, ready to create your next episode?
      </p>

      {/* Basic Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-surface rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-textPrimary mb-2">
            Quick Actions
          </h2>
          <p className="text-textSecondary">
            Create a new episode, edit drafts, or manage your content.
          </p>
        </div>

        <div className="p-6 bg-surface rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-textPrimary mb-2">
            Recent Episodes
          </h2>
          <p className="text-textSecondary">
            View and manage your latest podcast episodes.
          </p>
        </div>

        {hasAdvancedDashboard ? (
          <div className="p-6 bg-surface rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Analytics Overview
            </h2>
            <p className="text-textSecondary">
              Track your podcast's performance and audience engagement.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-surface rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Advanced Analytics
            </h2>
            <PlanLockMessage 
              feature="advanced analytics" 
              planRequired="creator"
              className="mt-2"
            />
          </div>
        )}
      </div>

      {/* Advanced Dashboard Features */}
      {hasAdvancedDashboard && (
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Performance Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface rounded-lg border border-border">
                <h3 className="font-medium mb-2">Total Listens</h3>
                <p className="text-3xl font-semibold">1,234</p>
                <p className="text-sm text-textSecondary mt-2">+12% from last month</p>
              </div>
              <div className="p-6 bg-surface rounded-lg border border-border">
                <h3 className="font-medium mb-2">Avg. Episode Length</h3>
                <p className="text-3xl font-semibold">24:30</p>
                <p className="text-sm text-textSecondary mt-2">Based on last 10 episodes</p>
              </div>
              <div className="p-6 bg-surface rounded-lg border border-border">
                <h3 className="font-medium mb-2">Engagement Rate</h3>
                <p className="text-3xl font-semibold">87%</p>
                <p className="text-sm text-textSecondary mt-2">Average completion rate</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Audience Demographics</h2>
            <div className="p-6 bg-surface rounded-lg border border-border">
              {/* Placeholder for demographics chart */}
              <div className="h-64 flex items-center justify-center bg-surface-hover rounded">
                <p className="text-textSecondary">Demographics visualization coming soon</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </RequireAuth>
  );
} 