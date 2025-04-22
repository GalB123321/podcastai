'use client';

import * as React from 'react';

interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilters({ categories, activeCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="flex gap-4 justify-center mb-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeCategory === category
              ? 'bg-accent text-background'
              : 'bg-surface text-textSecondary hover:text-textPrimary'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
} 