import { Select } from '@/components/ui/Select';
import { AUDIENCE_OPTIONS, type SelectOption } from '@/lib/promptOptions';

interface AudiencePickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function AudiencePicker({ value, onChange, error }: AudiencePickerProps) {
  const selectedOption = AUDIENCE_OPTIONS.find(opt => value[0] === opt.value);

  const handleChange = (option: SelectOption<string> | null) => {
    if (option) {
      onChange([option.value]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">
        Target Audience
      </label>
      <Select<string>
        placeholder="Select target audience"
        value={selectedOption}
        onChange={handleChange}
        options={AUDIENCE_OPTIONS}
        error={error}
      />
    </div>
  );
} 