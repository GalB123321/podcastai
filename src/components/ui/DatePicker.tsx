import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Popover } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(value);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      onChange(date);
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors",
          className
        )}
      >
        <CalendarIcon className="w-5 h-5 text-textSecondary" />
        <span className="text-sm">
          {selected ? format(selected, 'PPP') : 'Pick a date'}
        </span>
      </Popover.Button>

      <Popover.Panel className="absolute z-50 mt-2 p-4 bg-card rounded-lg shadow-lg border border-border">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          className="bg-card"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-textSecondary rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
            ),
            day_selected:
              "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
            day_today: "bg-accent/20 text-accent",
            day_outside: "text-textSecondary opacity-50",
            day_disabled: "text-textSecondary opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </Popover.Panel>
    </Popover>
  );
} 