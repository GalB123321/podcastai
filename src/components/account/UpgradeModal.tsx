import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface PlanOption {
  id: string;
  name: string;
  price: string;        // e.g. '$14'
  credits: number;      // e.g. 30
  perks: string[];      // list of key features
}

interface UpgradeModalProps {
  isOpen: boolean;               // controls visibility
  plans: PlanOption[];          // available plans
  currentPlanId: string;        // to highlight current plan
  onClose: () => void;          // close handler
  onSelectPlan: (planId: string) => void; // callback when a plan is selected
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  plans,
  currentPlanId,
  onClose,
  onSelectPlan,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Your Plan"
      className="max-w-3xl"
    >
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          
          return (
            <div
              key={plan.id}
              className={cn(
                'border rounded-lg p-4 flex flex-col justify-between',
                'transition-all duration-200',
                isCurrentPlan 
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' 
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {/* Plan Header */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {plan.name}
                </h2>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Credits: {plan.credits}
                </p>
              </div>

              {/* Perks List */}
              <ul className="mt-4 space-y-2">
                {plan.perks.map((perk, index) => (
                  <li 
                    key={index}
                    className="flex items-start"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                disabled={isCurrentPlan}
                className={cn(
                  'mt-4 px-4 py-2 text-sm font-semibold rounded w-full',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  isCurrentPlan
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                )}
                aria-label={isCurrentPlan ? 'Current plan' : `Select ${plan.name} plan`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your subscription in Stripe Dashboard
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal; 