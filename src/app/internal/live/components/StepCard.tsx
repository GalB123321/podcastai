'use client';

import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  step: string;
  index: number;
  status: {
    status: 'pending' | 'loading' | 'success' | 'error';
    duration?: number;
    payload?: any;
    error?: string;
  };
  isCurrent: boolean;
}

export function StepCard({ step, index, status, isCurrent }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusIcon = {
    pending: null,
    loading: <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-error" />
  }[status.status];

  const hasDetails = status.payload || status.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 rounded-xl border transition-colors",
        isCurrent ? "border-accent bg-accent/5" : "border-muted/20 bg-surface/50",
        hasDetails && "cursor-pointer hover:bg-surface/80"
      )}
      onClick={() => hasDetails && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
            isCurrent ? "border-accent text-accent" : "border-muted text-muted"
          )}>
            {index + 1}
          </div>
          <div>
            <h3 className="font-medium">{step}</h3>
            {status.duration && (
              <p className="text-sm text-muted">
                Duration: {(status.duration / 1000).toFixed(2)}s
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          {hasDetails && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted" />
            )
          )}
        </div>
      </div>

      {isExpanded && hasDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-4 pt-4 border-t border-muted/20"
        >
          {status.error ? (
            <div className="p-3 bg-error/10 rounded-lg text-sm text-error">
              {status.error}
            </div>
          ) : (
            <pre className="p-3 bg-surface rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(status.payload, null, 2)}
            </pre>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 