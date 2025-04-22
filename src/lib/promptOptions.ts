import { LengthTier } from './creditUtils';
import { EpisodeLength } from '@/hooks/usePrompt';

export interface SelectOption<T> {
  value: T;
  label: string;
}

export type ToneOption = 'Professional' | 'Friendly' | 'Gen Z' | 'Funny' | 'Calm' | 'Motivational';
export type AudioOption = 'Marketers' | 'Parents' | 'Gen Z' | 'Therapists' | 'Entrepreneurs' | 'Tech Professionals' | 'Students' | 'Healthcare Workers';
export type Visibility = 'public' | 'private' | 'unlisted';

export interface LengthOption extends SelectOption<EpisodeLength> {
  tier: LengthTier;
}

export interface CountOption extends SelectOption<number> {}

// Available tone options
export const TONE_OPTIONS: SelectOption<ToneOption>[] = [
  { value: 'Professional', label: '👔 Professional' },
  { value: 'Friendly', label: '😊 Friendly' },
  { value: 'Gen Z', label: '🔥 Gen Z' },
  { value: 'Funny', label: '😂 Funny' },
  { value: 'Calm', label: '🌊 Calm' },
  { value: 'Motivational', label: '💪 Motivational' },
];

// Available audience options
export const AUDIENCE_OPTIONS: SelectOption<AudioOption>[] = [
  { value: 'Marketers', label: '📊 Marketers' },
  { value: 'Parents', label: '👨‍👩‍👧‍👦 Parents' },
  { value: 'Gen Z', label: '🎮 Gen Z' },
  { value: 'Therapists', label: '🧠 Therapists' },
  { value: 'Entrepreneurs', label: '💼 Entrepreneurs' },
  { value: 'Tech Professionals', label: '💻 Tech Professionals' },
  { value: 'Students', label: '📚 Students' },
  { value: 'Healthcare Workers', label: '⚕️ Healthcare Workers' },
];

// Episode length options
export const EPISODE_LENGTH_OPTIONS: LengthOption[] = [
  { value: 3 as EpisodeLength, label: 'Mini (3-5 min)', tier: 'mini' },
  { value: 7 as EpisodeLength, label: 'Standard (7-10 min)', tier: 'standard' },
  { value: 12 as EpisodeLength, label: 'Deep (12-15 min)', tier: 'deep' },
];

// Episode count options
export const EPISODE_COUNT_OPTIONS: CountOption[] = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} episode${i === 0 ? '' : 's'}`
}));

// Visibility options
export const VISIBILITY_OPTIONS: SelectOption<Visibility>[] = [
  { value: 'public', label: '🌎 Public - Anyone can listen' },
  { value: 'private', label: '🔒 Private - Only you can listen' },
  { value: 'unlisted', label: '🔗 Unlisted - Only accessible with link' },
]; 