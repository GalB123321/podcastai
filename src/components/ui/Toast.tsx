'use client';

import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';
import type { ReactNode } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: 'bg-surface text-textPrimary border border-border',
        duration: 5000,
        success: {
          className: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
        },
        error: {
          className: 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
        },
      }}
    />
  );
}

export function toast({ title, description, type = 'info', duration = 5000 }: ToastOptions): string {
  const content: ReactNode = (
    <div className="flex flex-col gap-1">
      <div className="font-medium">{title}</div>
      {description && <div className="text-sm text-textSecondary">{description}</div>}
    </div>
  );

  switch (type) {
    case 'success':
      return hotToast.success(content, { duration });
    case 'error':
      return hotToast.error(content, { duration });
    default:
      return hotToast(content, { duration });
  }
} 