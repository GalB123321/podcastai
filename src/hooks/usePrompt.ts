/** @jsxImportSource react */
'use client';

import * as React from 'react';

export type ToneOption = 'Professional' | 'Friendly' | 'Gen Z' | 'Funny' | 'Calm' | 'Motivational';
export type EpisodeLength = 3 | 7 | 12;
export type Visibility = 'public' | 'private' | 'unlisted';

export interface PromptConfig {
  name: string;
  topic: string;
  targetAudience: string[];
  customAudience?: string;
  tone: ToneOption;
  episodeLength: EpisodeLength;
  episodeCount: number;
  includePromo: boolean;
  promoText?: string;
  isCourse: boolean;
  courseTitle?: string;
  // Business plan features
  customLabel?: string;
  customInstructions?: string;
  // Scheduling and access fields
  scheduleEpisodes: boolean;
  episodeDates: (Date | null)[];
  visibility: Visibility;
  enableTeamAccess: boolean;
  teamEmails: string[];
}

interface PromptContextType {
  config: PromptConfig;
  updateField: <K extends keyof PromptConfig>(field: K, value: PromptConfig[K]) => void;
  resetConfig: () => void;
  isValid: boolean;
  errors: Record<string, string>;
  validateConfig: () => boolean;
}

const defaultConfig: PromptConfig = {
  name: '',
  topic: '',
  targetAudience: [],
  customAudience: '',
  tone: 'Professional',
  episodeLength: 3,
  episodeCount: 1,
  includePromo: false,
  promoText: '',
  isCourse: false,
  courseTitle: '',
  // Business plan features
  customLabel: '',
  customInstructions: '',
  // Default values for scheduling and access
  scheduleEpisodes: false,
  episodeDates: [],
  visibility: 'public',
  enableTeamAccess: false,
  teamEmails: []
};

const PromptContext = React.createContext<PromptContextType>({
  config: defaultConfig,
  updateField: () => {},
  resetConfig: () => {},
  isValid: false,
  errors: {},
  validateConfig: () => false
});

/**
 * Custom hook to access and modify prompt configuration
 * @throws {Error} If used outside of PromptProvider
 */
export function usePrompt(): PromptContextType {
  const context = React.useContext(PromptContext);
  if (!context) throw new Error('usePrompt must be used within PromptProvider');
  return context;
}

interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for prompt configuration
 * Wrap your app or wizard flow with this to enable prompt state management
 */
export function PromptProvider({ children }: ProviderProps): React.ReactElement {
  const [config, setConfig] = React.useState<PromptConfig>(defaultConfig);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);

  const validateConfig = React.useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!config.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    // Conditional validation
    if (config.isCourse && config.courseTitle && !config.courseTitle.trim()) {
      newErrors.courseTitle = 'Course title is required when creating a course';
    }

    if (config.includePromo && !config.promoText?.trim()) {
      newErrors.promoText = 'Promotion text is required when including a promotion';
    }

    // Range validation
    if (config.episodeCount < 1 || config.episodeCount > 10) {
      newErrors.episodeCount = 'Episode count must be between 1 and 10';
    }

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  }, [config]);

  React.useEffect(() => {
    validateConfig();
  }, [config, validateConfig]);

  const updateField = <K extends keyof PromptConfig>(field: K, value: PromptConfig[K]) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    setErrors({});
    setIsValid(false);
  };

  const value = React.useMemo(() => ({
    config,
    updateField,
    resetConfig,
    isValid,
    errors,
    validateConfig
  }), [config, isValid, errors, validateConfig]);

  return React.createElement(PromptContext.Provider, { value }, children);
} 