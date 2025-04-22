import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type StepStatus = 'queued' | 'in-progress' | 'complete' | 'error';

interface StepCardProps {
  title: string;
  emoji: string;
  status: StepStatus;
  error?: string;
  isGenZ?: boolean;
}

const statusConfig = {
  queued: {
    icon: '⏳',
    text: 'Queued',
    className: 'text-gray-400'
  },
  'in-progress': {
    icon: '🔄',
    text: 'In Progress',
    className: 'text-yellow-500'
  },
  complete: {
    icon: '✅',
    text: 'Complete',
    className: 'text-emerald-500'
  },
  error: {
    icon: '❌',
    text: 'Failed',
    className: 'text-red-500'
  }
};

export function StepCard({ title, emoji, status, error, isGenZ = false }: StepCardProps) {
  const { icon, text, className } = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-lg border",
        status === 'complete' && "border-emerald-500/20 bg-emerald-500/5",
        status === 'in-progress' && "border-yellow-500/20 bg-yellow-500/5",
        status === 'error' && "border-red-500/20 bg-red-500/5",
        status === 'queued' && "border-gray-700 bg-gray-800/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-2xl"
            animate={isGenZ && status === 'in-progress' ? {
              rotate: [0, 360],
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            } : {}}
          >
            {emoji}
          </motion.span>
          <div>
            <h3 className="font-medium text-gray-200">{title}</h3>
            <p className={cn("text-sm mt-1", className)}>
              {text}
              {status === 'in-progress' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              )}
            </p>
          </div>
        </div>
        <motion.span
          className={cn("text-xl", className)}
          animate={isGenZ && status === 'in-progress' ? {
            scale: [1, 1.2, 1],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        >
          {icon}
        </motion.span>
      </div>

      {error && status === 'error' && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-sm text-red-400 border-t border-red-500/20 pt-3"
        >
          Error: {error}
        </motion.p>
      )}
    </motion.div>
  );
} 