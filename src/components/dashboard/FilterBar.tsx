import * as React from 'react';
import { cn } from '@/lib/utils';
import { DropdownSelector } from '@/components/ui/DropdownSelector';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'draft' | 'published' | 'processing';
  onStatusChange: (status: 'all' | 'draft' | 'published' | 'processing') => void;
  sortBy: 'date' | 'duration' | 'title';
  onSortChange: (sortBy: 'date' | 'duration' | 'title') => void;
  className?: string;
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'processing', label: 'Processing' }
];

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'duration', label: 'Duration' },
  { value: 'title', label: 'Title' }
];

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  className = ''
}) => {
  const handleReset = () => {
    onSearchChange('');
    onStatusChange('all');
    onSortChange('date');
  };

  const hasActiveFilters = searchValue !== '' || statusFilter !== 'all' || sortBy !== 'date';

  return (
    <div 
      className={cn(
        'flex flex-wrap gap-4 items-center p-4',
        'bg-white dark:bg-gray-800 rounded-md shadow-sm',
        className
      )}
    >
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="episode-search" className="sr-only">
          Search episodes
        </label>
        <input
          type="search"
          id="episode-search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search episodes..."
          className={cn(
            'w-full px-3 py-2',
            'border border-gray-300 dark:border-gray-600',
            'rounded-lg',
            'bg-white dark:bg-gray-700',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition duration-150 ease-in-out'
          )}
        />
      </div>

      {/* Status Filter */}
      <DropdownSelector
        id="status-filter"
        label="Status"
        options={statusOptions}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as typeof statusFilter)}
        className="min-w-[140px]"
      />

      {/* Sort By */}
      <DropdownSelector
        id="sort-by"
        label="Sort by"
        options={sortOptions}
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
        className="min-w-[140px]"
      />

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className={cn(
            'px-3 py-2',
            'text-sm rounded-lg',
            'bg-gray-100 dark:bg-gray-600',
            'text-gray-700 dark:text-gray-200',
            'hover:bg-gray-200 dark:hover:bg-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'transition-colors duration-150'
          )}
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default FilterBar; 