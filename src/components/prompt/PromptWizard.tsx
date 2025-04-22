'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { InputField } from '@/components/ui/InputField';
import { Select, type SelectProps } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/context/AuthContext';
import { PlanTier } from '@/lib/planAccess';
import { usePrompt, type ToneOption, type EpisodeLength, type Visibility } from '@/hooks/usePrompt';
import { type FirestoreUser } from '@/lib/firestoreUser';
import {
  TONE_OPTIONS,
  AUDIENCE_OPTIONS,
  EPISODE_LENGTH_OPTIONS,
  EPISODE_COUNT_OPTIONS,
  VISIBILITY_OPTIONS,
  type SelectOption
} from '@/lib/promptOptions';
import { getAuth } from 'firebase/auth';
import { TonePicker } from '@/components/prompt/TonePicker';

// Maximum number of token refresh attempts
const MAX_TOKEN_REFRESH_ATTEMPTS = 2;
// Delay between refresh attempts (in milliseconds)
const REFRESH_RETRY_DELAY = 1000;

interface PromptWizardProps {
  className?: string;
}

export function PromptWizard({ className }: PromptWizardProps) {
  const { user, refreshToken, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const userPlan = ((user as unknown as FirestoreUser)?.plan === 'free' ? 'personal' : (user as unknown as FirestoreUser)?.plan || 'personal') as PlanTier;
  const { config, updateField, errors } = usePrompt();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameChoice, setNameChoice] = useState<'manual' | 'ai'>('ai');

  const handleToneChange = (value: ToneOption) => {
    updateField('tone', value);
  };

  const handleAudienceChange = (option: SelectOption<string> | null) => {
    if (option) {
      updateField('targetAudience', [option.value]);
    }
  };

  const handleEpisodeLengthChange = (option: SelectOption<EpisodeLength> | null) => {
    if (option) {
      updateField('episodeLength', option.value);
    }
  };

  const handleEpisodeCountChange = (option: SelectOption<number> | null) => {
    if (option) {
      updateField('episodeCount', option.value);
    }
  };

  const handleVisibilityChange = (option: SelectOption<Visibility> | null) => {
    if (option) {
      updateField('visibility', option.value);
    }
  };

  const isFormValid = () => {
    return !!(
      config.topic &&
      config.tone &&
      config.targetAudience?.length > 0 &&
      config.episodeLength &&
      config.episodeCount &&
      config.episodeCount >= 1 &&
      config.visibility
    );
  };

  const getValidToken = async (attempt = 1): Promise<string> => {
    const auth = getAuth();
    console.log(`[PromptWizard] Getting token (attempt ${attempt}/${MAX_TOKEN_REFRESH_ATTEMPTS})`);
    console.log('[PromptWizard] Auth state:', { 
      currentUser: auth.currentUser?.uid,
      emailVerified: auth.currentUser?.emailVerified,
      contextUser: user?.uid
    });

    // Wait for auth to initialize if needed
    if (!auth.currentUser && attempt === 1) {
      console.log('[PromptWizard] Waiting for auth to initialize...');
      await new Promise(resolve => setTimeout(resolve, REFRESH_RETRY_DELAY));
    }

    try {
      // First try refreshToken from context
      const token = await refreshToken();
      if (token) {
        console.log('[PromptWizard] Token refreshed successfully');
        return token;
      }

      // If context refresh failed, try direct refresh
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No Firebase user found');
      }

      const directToken = await currentUser.getIdToken(true);
      if (!directToken) {
        throw new Error('Token refresh returned null');
      }

      console.log('[PromptWizard] Token obtained directly from Firebase');
      return directToken;
    } catch (error) {
      console.error(`[PromptWizard] Token refresh failed (attempt ${attempt}):`, error);

      if (attempt < MAX_TOKEN_REFRESH_ATTEMPTS) {
        console.log(`[PromptWizard] Retrying after ${REFRESH_RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, REFRESH_RETRY_DELAY));
        return getValidToken(attempt + 1);
      }

      throw new Error('Failed to obtain valid authentication token');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let token: string;
      try {
        token = await getValidToken();
      } catch (tokenError) {
        console.error('[PromptWizard] Final token refresh failed:', tokenError);
        await signOut();
        router.push('/sign-in');
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please sign in again.',
          variant: 'error'
        });
        return;
      }

      const response = await fetch('/api/start-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          name: config.name || config.topic
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle 401 specifically
        if (response.status === 401) {
          console.error('[PromptWizard] API returned 401:', errorData);
          await signOut();
          router.push('/sign-in');
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error(errorData.details || 'Failed to start generation');
      }

      const data = await response.json();
      console.log('[PromptWizard] ✅ Generation started:', data);
      router.push(`/create/processing/${data.id}`);
      
    } catch (error) {
      console.error('[PromptWizard] Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to create podcast. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAudienceOption = AUDIENCE_OPTIONS.find(opt => opt.value === config.targetAudience[0]);
  const selectedToneOption = TONE_OPTIONS.find(opt => opt.value === config.tone);
  const selectedLengthOption = EPISODE_LENGTH_OPTIONS.find(opt => opt.value === config.episodeLength);
  const selectedCountOption = EPISODE_COUNT_OPTIONS.find(opt => opt.value === config.episodeCount);
  const selectedVisibilityOption = VISIBILITY_OPTIONS.find(opt => opt.value === config.visibility);

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Create Your Podcast</h2>
          <p className="text-gray-600">Let&apos;s create an engaging podcast episode together.</p>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-200">
            Podcast Name
          </label>
          
          <div className="flex space-x-4 mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={nameChoice === 'ai'}
                onChange={() => {
                  setNameChoice('ai');
                  updateField('name', '');
                }}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-sm text-gray-300">Let AI suggest names later</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={nameChoice === 'manual'}
                onChange={() => setNameChoice('manual')}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-sm text-gray-300">Enter name manually</span>
            </label>
          </div>

          {nameChoice === 'ai' ? (
            <InputField
              label="Podcast Name"
              placeholder="We'll suggest name options in the results screen"
              value=""
              onChange={() => {}}
              disabled
              className="w-full bg-gray-700/50 cursor-not-allowed"
            />
          ) : (
            <InputField
              label="Podcast Name"
              placeholder="Enter your podcast name"
              value={config.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              className="w-full"
            />
          )}
        </div>

        <InputField
          label="Topic"
          value={config.topic}
          onChange={(e) => updateField('topic', e.target.value)}
          placeholder="Enter your podcast topic"
          error={errors.topic}
        />

        <Select<string>
          placeholder="Select target audience"
          value={selectedAudienceOption}
          onChange={handleAudienceChange}
          options={AUDIENCE_OPTIONS}
          error={errors.targetAudience}
        />

        <TonePicker
          value={config.tone}
          onChange={handleToneChange}
          error={errors.tone}
        />

        <Select<EpisodeLength>
          placeholder="Select episode length"
          value={selectedLengthOption}
          onChange={handleEpisodeLengthChange}
          options={EPISODE_LENGTH_OPTIONS}
          error={errors.episodeLength}
        />

        <Select<number>
          placeholder="Select number of episodes"
          value={selectedCountOption}
          onChange={handleEpisodeCountChange}
          options={EPISODE_COUNT_OPTIONS}
          error={errors.episodeCount}
        />

        <Select<Visibility>
          placeholder="Select visibility"
          value={selectedVisibilityOption}
          onChange={handleVisibilityChange}
          options={VISIBILITY_OPTIONS}
          error={errors.visibility}
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid() || creditsLoading}
          className="w-full"
        >
          {isSubmitting ? 'Creating...' : creditsLoading ? 'Loading...' : 'Create Podcast'}
        </Button>
      </div>
    </div>
  );
}