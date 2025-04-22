'use client';

import { PromptWizard } from '@/components/prompt/PromptWizard';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import { usePrompt } from '@/hooks/usePrompt';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export function CreatePageClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const { config, isValid } = usePrompt();
  
  // Protect the page with plan access
  usePlanProtection({
    feature: 'createPodcast',
    redirectTo: '/plans'
  });

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid) {
      showToast({
        title: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      // Save the prompt configuration
      await fetch('/api/save-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      // Start the generation process
      const response = await fetch('/api/start-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const { podcastId } = await response.json();
      
      // Redirect to processing page
      router.push(`/create/processing/${podcastId}`);
    } catch (error) {
      showToast({
        title: 'Failed to create podcast',
        description: error instanceof Error ? error.message : 'Please try again',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PromptWizard 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
} 