import { Select } from '@/components/ui/Select';
import { TONE_OPTIONS, type SelectOption } from '@/lib/promptOptions';
import { type ToneOption } from '@/hooks/usePrompt';

interface TonePickerProps {
  value: ToneOption;
  onChange: (value: ToneOption) => void;
  error?: string;
}

export function TonePicker({ value, onChange, error }: TonePickerProps) {
  const selectedOption = TONE_OPTIONS.find(opt => value === opt.value);

  const handleChange = (option: SelectOption<ToneOption> | null) => {
    if (option) {
      onChange(option.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">
        Tone of Voice
      </label>
      <Select<ToneOption>
        placeholder="Select tone"
        value={selectedOption}
        onChange={handleChange}
        options={TONE_OPTIONS}
        error={error}
      />
    </div>
  );
} 