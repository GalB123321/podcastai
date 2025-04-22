import { useState } from 'react';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Loader2 } from 'lucide-react';

interface PublishModalProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PublishModal({ id, title, isOpen, onClose }: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const { hasAccess } = usePlanProtection({
    feature: 'spotifyExport'
  });
  const { toast } = useToast();

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      const response = await fetch('/api/publish-spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        },
        body: JSON.stringify({ episodeId: id })
      });

      if (!response.ok) {
        if (response.status === 402) {
          toast({
            title: 'Upgrade Required',
            description: 'This feature requires a Creator or Business plan.',
            variant: 'error'
          });
          return;
        }
        throw new Error('Failed to publish');
      }

      const { link } = await response.json();
      
      // Copy link to clipboard
      await navigator.clipboard.writeText(link);

      // Show success toast with Gen-Z flair
      toast({
        title: '🎉 Published to Spotify!',
        description: 'Your episode is now live on Spotify! Link copied to clipboard ✨',
        variant: 'success'
      });

      onClose();
    } catch (error) {
      console.error('Error publishing:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish podcast',
        variant: 'error'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!hasAccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              Publishing to Spotify is available on Creator and Business plans.
              Upgrade now to unlock this feature!
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <PrimaryButton variant="outline" onClick={onClose}>
              Maybe Later
            </PrimaryButton>
            <PrimaryButton onClick={() => window.location.href = '/pricing'}>
              View Plans
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish to Spotify</DialogTitle>
          <DialogDescription>
            Are you sure you want to publish &quot;{title}&quot; to Spotify?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 pt-4">
          <PrimaryButton onClick={onClose} variant="outline">
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
} 