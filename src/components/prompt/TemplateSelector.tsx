import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Template {
  id: string;
  name: string;
  description: string;
  samplePrompt: string;
}

interface TemplateSelectorProps {
  templates: Template[];          // { id, name, description, samplePrompt }
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * TemplateSelector
 * 
 * Displays a grid of selectable template cards with sample prompts.
 * Supports keyboard navigation and accessibility features.
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  className = '',
}) => {
  // Handle keyboard navigation between cards
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, templateId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(templateId);
    }
  };

  return (
    <div 
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
      role="radiogroup"
      aria-label="Template Selection"
    >
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          onKeyDown={(e) => handleKeyDown(e, template.id)}
          aria-pressed={template.id === selectedId}
          className={cn(
            // Base styles
            'flex flex-col text-left',
            'p-4 rounded-lg border border-gray-200',
            'transition-all duration-200',
            'hover:shadow-lg focus:outline-none',
            // Dark mode
            'dark:border-gray-700 dark:bg-gray-800/50',
            'dark:hover:bg-gray-800/80',
            // Selected state
            template.id === selectedId && [
              'ring-2 ring-blue-500',
              'border-transparent',
              'bg-blue-50 dark:bg-blue-900/20'
            ],
            // Focus state
            'focus:ring-2 focus:ring-blue-500/50'
          )}
        >
          {/* Template Name */}
          <h3 className="text-lg font-medium mb-2">
            {template.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {template.description}
          </p>

          {/* Sample Prompt */}
          <div className="mt-auto">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Sample Prompt:
            </div>
            <pre className={cn(
              'text-xs font-mono p-2 rounded',
              'bg-gray-50 dark:bg-gray-900',
              'border border-gray-100 dark:border-gray-700',
              'overflow-x-auto'
            )}>
              {template.samplePrompt}
            </pre>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector; 