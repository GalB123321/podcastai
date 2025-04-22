'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import PlanLockMessage from '@/components/access/PlanLockMessage';

interface EditPageProps {
  params: {
    id: string;
  };
}

function EditContent({ id }: { id: string }) {
  const { hasAccess, isLoading } = usePlanProtection({
    feature: 'editing',
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
          feature="edit episodes" 
          planRequired="personal"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-textPrimary mb-4">
        Edit Episode
      </h1>
      <p className="text-textSecondary mb-8">
        Make changes to your episode content and settings.
      </p>

      {/* TODO: Implement edit functionality */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <p className="text-textSecondary">Edit functionality coming soon...</p>
      </div>
    </div>
  );
}

export default function EditPage({ params }: EditPageProps) {
  return (
    <RequireAuth>
      <DashboardLayout>
        <EditContent id={params.id} />
      </DashboardLayout>
    </RequireAuth>
  );
} 