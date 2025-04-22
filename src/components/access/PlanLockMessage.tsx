import { useAuth } from '@/hooks/useAuth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRouter } from 'next/navigation';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getMinimumPlanForFeature, getFeatureDisplayName, type Feature, type PlanTier } from '@/lib/planAccess';

interface PlanLockMessageProps {
  feature: Feature;
  planRequired?: PlanTier;
  className?: string;
}

export default function PlanLockMessage({ 
  feature, 
  planRequired: explicitPlanRequired,
  className = ''
}: PlanLockMessageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const currentPlan = (user?.firestoreData?.plan as PlanTier) || 'personal';
  const planRequired = explicitPlanRequired || getMinimumPlanForFeature(feature);
  const featureName = getFeatureDisplayName(feature);

  return (
    <div className={`bg-surface rounded-lg p-8 border border-border ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <LockClosedIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display text-textPrimary">
            Upgrade Required
          </h2>
          <p className="text-textSecondary">
            {featureName} is available on the {planRequired} plan and above
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-textSecondary">
            Unlock {featureName && featureName.toLowerCase()} and other premium features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-textSecondary">
            Increase your monthly credits and episode length limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-textSecondary">
            Get access to advanced tools and priority support
          </p>
        </div>
      </div>

      <PrimaryButton 
        onClick={() => router.push('/plans')}
        className="w-full sm:w-auto"
      >
        <span>Upgrade to {planRequired}</span>
        <ArrowRightIcon className="w-4 h-4 ml-2" />
      </PrimaryButton>
    </div>
  );
} 