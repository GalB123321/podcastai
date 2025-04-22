export type ProcessingStep = 'research' | 'script' | 'voice' | 'finalize' | 'ready' | 'error';

export interface GenerationStep {
  type: 'research' | 'script' | 'voice' | 'finalize';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
} 