import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

// This is a simple implementation. In production, you might want to use a library like react-hot-toast
// or create a more sophisticated toast system with a context provider
export function useToast() {
  const toast = useCallback(({ 
    title, 
    description, 
    variant = 'default',
    duration = 3000 
  }: ToastOptions) => {
    // For now, we'll just use the browser's built-in alert
    // In production, replace this with your preferred toast notification system
    alert(`${title}\n${description || ''}`);
  }, []);

  return { toast };
} 