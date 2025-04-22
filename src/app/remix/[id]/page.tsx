'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import PlanLockMessage from '@/components/access/PlanLockMessage';

interface RemixPageProps {
  params: {
    id: string;
  };
}

function RemixContent({ id }: { id: string }) {
  const { hasAccess, isLoading } = usePlanProtection({
    feature: 'remix',
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
          feature="remix episodes" 
          planRequired="creator"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-textPrimary mb-4">
        Remix Episode
      </h1>
      <p className="text-textSecondary mb-8">
        Create a new version of this episode with your own twist.
      </p>

      {/* TODO: Implement remix functionality */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <p className="text-textSecondary">Remix functionality coming soon...</p>
      </div>
    </div>
  );
}

export default function RemixPage({ params }: RemixPageProps) {
  return (
    <RequireAuth>
      <DashboardLayout>
        <RemixContent id={params.id} />
      </DashboardLayout>
    </RequireAuth>
  );
} 