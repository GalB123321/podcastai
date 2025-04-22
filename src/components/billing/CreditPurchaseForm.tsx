import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RadioGroup } from '@headlessui/react';
import { SparklesIcon } from '@heroicons/react/24/solid';

const CREDIT_PACKAGES = [
  { credits: '10', price: 9, description: 'Perfect for a quick top-up' },
  { credits: '30', price: 25, description: 'Most popular choice' },
  { credits: '50', price: 40, description: 'Best value for power users' },
] as const;

interface CreditPurchaseFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface RadioOptionRenderProps {
  active: boolean;
  checked: boolean;
}

export default function CreditPurchaseForm({ onSuccess, className = '' }: CreditPurchaseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCredits, setSelectedCredits] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user || !selectedCredits) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          credits: selectedCredits.credits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to initiate credit purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate purchase. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <RadioGroup value={selectedCredits} onChange={setSelectedCredits}>
        <RadioGroup.Label className="sr-only">Select credit package</RadioGroup.Label>
        <div className="space-y-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <RadioGroup.Option
              key={pkg.credits}
              value={pkg}
              className={({ active, checked }: RadioOptionRenderProps) => `
                ${active ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${checked ? 'bg-primary/10 border-primary' : 'bg-surface border-border'}
                relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none
              `}
            >
              {({ checked }: { checked: boolean }) => (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className={`font-medium ${
                          checked ? 'text-primary' : 'text-textPrimary'
                        }`}
                      >
                        {pkg.credits} Credits
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="span"
                        className="text-textSecondary"
                      >
                        {pkg.description}
                      </RadioGroup.Description>
                    </div>
                  </div>
                  <div className="shrink-0 text-primary font-semibold">
                    ${pkg.price}
                  </div>
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      <PrimaryButton
        onClick={handlePurchase}
        disabled={!selectedCredits || isLoading}
        className="w-full mt-6"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        {selectedCredits
          ? `Buy ${selectedCredits.credits} Credits for $${selectedCredits.price}`
          : 'Select a credit package'}
      </PrimaryButton>
    </div>
  );
} 