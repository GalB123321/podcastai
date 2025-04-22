import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-card rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Dialog.Title className="text-xl font-semibold">
              Get More Credits
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-textSecondary hover:text-textPrimary transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Credit Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-accent mb-2">50 Credits</div>
                  <div className="text-lg font-medium mb-1">$25</div>
                  <p className="text-sm text-textSecondary">Perfect for small projects</p>
                </div>
                <div className="p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-accent mb-2">100 Credits</div>
                  <div className="text-lg font-medium mb-1">$45</div>
                  <p className="text-sm text-textSecondary">Best value for regular use</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Or Upgrade Your Plan</h3>
              <p className="text-sm text-textSecondary">
                Get more credits monthly plus additional features with our premium plans
              </p>
              <PrimaryButton
                onClick={() => {
                  onClose();
                  window.location.href = '/plans';
                }}
                className="w-full mt-4"
              >
                View Plans
              </PrimaryButton>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 