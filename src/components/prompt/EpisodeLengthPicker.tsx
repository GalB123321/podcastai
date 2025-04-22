import { Select } from '@/components/ui/Select';
import { EPISODE_LENGTH_OPTIONS, type SelectOption } from '@/lib/promptOptions';

interface EpisodeLengthPickerProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function EpisodeLengthPicker({ value, onChange, error }: EpisodeLengthPickerProps) {
  const selectedOption = EPISODE_LENGTH_OPTIONS.find(opt => value === opt.value);

  const handleChange = (option: SelectOption<number> | null) => {
    if (option) {
      onChange(option.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">
        Episode Length
      </label>
      <Select<number>
        placeholder="Select length"
        value={selectedOption}
        onChange={handleChange}
        options={EPISODE_LENGTH_OPTIONS}
        error={error}
      />
    </div>
  );
} 