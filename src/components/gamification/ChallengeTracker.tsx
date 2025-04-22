import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Mission {
  id: string;
  description: string;
  goal: number;
  progress: number;
  reward: string;
}

interface ChallengeTrackerProps {
  missions: Mission[];
  onToggleComplete: (missionId: string, completed: boolean) => void;
  className?: string;
}

const ChallengeTracker: React.FC<ChallengeTrackerProps> = ({
  missions,
  onToggleComplete,
  className = '',
}) => {
  // Memoize mission completion status
  const getMissionStatus = React.useCallback((mission: Mission) => {
    return {
      isComplete: mission.progress >= mission.goal,
      progressPercent: Math.min((mission.progress / mission.goal) * 100, 100)
    };
  }, []);

  if (missions.length === 0) {
    return (
      <div 
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg text-center',
          className
        )}
        role="status"
      >
        <span className="text-4xl mb-4">🎉</span>
        <p className="text-gray-900 dark:text-gray-100 font-semibold">
          All challenges complete!
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Check back next week for new missions.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg',
        className
      )}
      role="list"
      aria-label="Weekly Challenges"
    >
      {/* Header */}
      <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
        <h2>Weekly Challenges</h2>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Refresh challenges"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Mission List */}
      {missions.map((mission) => {
        const { isComplete, progressPercent } = getMissionStatus(mission);
        const missionId = `mission-${mission.id}`;

        return (
          <div
            key={mission.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            role="listitem"
          >
            <Checkbox
              id={missionId}
              checked={isComplete}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggleComplete(mission.id, e.target.checked)}
              disabled={!isComplete}
              aria-labelledby={`${missionId}-desc`}
              className="h-5 w-5"
            />

            <div className="flex-1 min-w-0">
              <p
                id={`${missionId}-desc`}
                className="text-sm text-gray-800 dark:text-gray-200"
              >
                {mission.description}
              </p>

              {/* Progress Section */}
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {mission.progress}/{mission.goal}
                </span>
              </div>
            </div>

            {/* Reward Badge */}
            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-800 
                           text-yellow-800 dark:text-yellow-200 rounded">
              {mission.reward}
            </span>

            {/* Claim Button */}
            {isComplete && (
              <button
                type="button"
                onClick={() => onToggleComplete(mission.id, true)}
                className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                         hover:underline focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`Claim reward for ${mission.description}`}
              >
                Claim
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChallengeTracker; 