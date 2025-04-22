'use client';

import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function UpgradeSuccessPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto px-4 py-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-display text-textPrimary mb-4">
              🎉 Upgrade Complete
            </h1>
            <p className="text-xl text-textSecondary">
              Your new plan is active and credits have been updated.
            </p>
          </div>

          <PrimaryButton
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </PrimaryButton>
        </div>
      </div>
    </MainLayout>
  );
} 