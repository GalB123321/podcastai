import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { hasAccessToFeature, type Feature, type PlanTier } from '@/lib/planAccess';

interface UsePlanProtectionOptions {
  feature: Feature;
  hardBlock?: boolean;
  redirectTo?: string;
  showToast?: boolean;
}

export function usePlanProtection({
  feature,
  hardBlock = true,
  redirectTo = '/plans',
  showToast = true
}: UsePlanProtectionOptions) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [plan, setPlan] = useState<PlanTier>('personal');
  const [hasAccessValue, setHasAccessValue] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccessValue(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const newPlan = (data.plan as PlanTier) || 'personal';
          setPlan(newPlan);
          setHasAccessValue(hasAccessToFeature(newPlan, feature));
        }
      }
    );

    return () => unsubscribe();
  }, [user, feature]);

  useEffect(() => {
    if (hardBlock && !hasAccessValue) {
      if (showToast) {
        toast({
          title: 'Feature not available',
          description: `This feature requires a higher plan. Please upgrade to access it.`,
          variant: 'error'
        });
      }
      router.push(redirectTo);
    }
  }, [hardBlock, hasAccessValue, router, redirectTo, showToast, toast]);

  return { hasAccess: hasAccessValue, plan };
} 