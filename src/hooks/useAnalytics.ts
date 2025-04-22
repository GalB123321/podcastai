import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import posthog from 'posthog-js';

/**
 * Properties required for analytics initialization
 */
interface AnalyticsConfig {
  apiKey: string;
  apiHost: string;
  debug?: boolean;
}

/**
 * Return type for the useAnalytics hook
 */
interface UseAnalyticsReturn {
  isReady: boolean;
  error: Error | null;
  identifyUser: () => void;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  pageView: (path?: string) => void;
}

/**
 * Custom error for analytics operations
 */
class AnalyticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

/**
 * Validates required environment variables
 * @throws {AnalyticsError} If required env vars are missing
 */
function validateConfig(config: AnalyticsConfig): void {
  if (!config.apiKey) {
    throw new AnalyticsError('PostHog API key is required');
  }
}

/**
 * Hook for managing analytics tracking
 * @returns Object containing analytics state and operations
 */
export function useAnalytics(config: AnalyticsConfig): UseAnalyticsReturn {
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Initialize PostHog on mount
  React.useEffect(() => {
    try {
      validateConfig(config);

      // Initialize PostHog
      posthog.init(config.apiKey, {
        api_host: config.apiHost || 'https://app.posthog.com',
        loaded: (posthogInstance: typeof posthog) => {
          if (config.debug) {
            console.log('PostHog loaded successfully', posthogInstance);
          }
          setIsReady(true);
        },
        bootstrap: {
          distinctID: 'anonymous',
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize analytics');
      setError(error);
      setIsReady(false);
    }
  }, [config]);

  /**
   * Identifies the current user in PostHog
   */
  const identifyUser = React.useCallback(() => {
    if (!user?.uid || !isReady) return;

    try {
      posthog.identify(user.uid, {
        email: user.email ?? undefined,
        distinct_id: user.uid
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to identify user');
      setError(error);
      console.error('User identification failed:', err);
    }
  }, [user, isReady]);

  /**
   * Tracks a custom event with optional properties
   */
  const trackEvent = React.useCallback((
    event: string,
    properties: Record<string, any> = {}
  ) => {
    if (!isReady) return;

    try {
      posthog.capture(event, {
        ...properties,
        userId: user?.uid,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to track event');
      setError(error);
      console.error('Event tracking failed:', err);
    }
  }, [isReady, user]);

  /**
   * Tracks a page view event
   */
  const pageView = React.useCallback((
    path: string = typeof window !== 'undefined' ? window.location.pathname : '/'
  ) => {
    if (!isReady) return;

    try {
      posthog.capture('$pageview', {
        path,
        url: typeof window !== 'undefined' ? window.location.href : path,
        userId: user?.uid,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to track pageview');
      setError(error);
      console.error('Pageview tracking failed:', err);
    }
  }, [isReady, user]);

  // Auto-identify user when ready
  React.useEffect(() => {
    if (user && isReady) {
      identifyUser();
    }
  }, [user, isReady, identifyUser]);

  return {
    isReady,
    error,
    identifyUser,
    trackEvent,
    pageView
  };
} 