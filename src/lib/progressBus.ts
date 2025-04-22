import { EventEmitter } from 'events';

export const progressBus = new EventEmitter();

export interface ProgressEvent {
  step: string;
  data: unknown;
  ts: number;
}

/**
 * Emits a progress event for a specific episode
 * @param episodeId The ID of the episode being processed
 * @param step The current processing step
 * @param data Additional data for the progress event
 */
export const emitProgress = (episodeId: string, step: string, data: unknown = {}) => {
  const event: ProgressEvent = {
    step,
    data,
    ts: Date.now()
  };
  progressBus.emit(episodeId, event);
}; 