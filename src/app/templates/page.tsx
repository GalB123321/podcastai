'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import PlanLockMessage from '@/components/access/PlanLockMessage';

function TemplatesContent() {
  const { hasAccess, isLoading } = usePlanProtection({
    feature: 'templates',
    hardBlock: true
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <PlanLockMessage 
          feature="episode templates" 
          planRequired="creator"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-textPrimary mb-4">
        Episode Templates
      </h1>
      <p className="text-textSecondary mb-8">
        Create and manage your episode templates to streamline your podcast production.
      </p>

      {/* TODO: Implement templates functionality */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <p className="text-textSecondary">Templates functionality coming soon...</p>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <TemplatesContent />
      </DashboardLayout>
    </RequireAuth>
  );
} 