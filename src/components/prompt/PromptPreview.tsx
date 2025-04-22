import * as React from 'react';
import { usePrompt } from '@/hooks/usePrompt';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { promptHelpers } from '@/lib/promptHelpers';
import type { ChatCompletionMessageParam } from 'openai/resources';

interface PromptPreviewProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function PromptPreview({ onGenerate, isGenerating = false }: PromptPreviewProps) {
  const { config } = usePrompt();
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState('');

  // Generate the prompt when config changes
  React.useEffect(() => {
    const prompts = promptHelpers.buildScriptPrompt({
      researchJSON: {
        facts: [], // TODO: Add facts from research
      },
      tone: config.tone,
      audience: config.targetAudience.join(', '),
      lengthTier: 'standard', // TODO: Get from config
      episodes: 1,
      plan: 'personal', // TODO: Get from user's plan
    });
    
    // For preview, we'll just show the user message of the first episode
    const userMessage = prompts[0][1];
    if (typeof userMessage.content === 'string') {
      setPrompt(userMessage.content);
    } else if (Array.isArray(userMessage.content)) {
      setPrompt(userMessage.content.map(part => 
        'text' in part ? part.text : ''
      ).join(''));
    } else {
      setPrompt('');
    }
  }, [config]);

  // Handle copying prompt to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      // TODO: Show error toast
    }
  };

  // Render a section of the prompt with optional editing
  const renderSection = (title: string, content: string | string[]) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <button
          onClick={() => setEditingSection(editingSection === title ? null : title)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {editingSection === title ? 'Done' : 'Edit'}
        </button>
      </div>
      {editingSection === title ? (
        <textarea
          value={Array.isArray(content) ? content.join(', ') : content}
          onChange={(e) => {
            // TODO: Implement section editing logic
            console.log('Editing section:', title, e.target.value);
          }}
          className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
        />
      ) : (
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {Array.isArray(content) ? content.join(', ') : content}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Prompt Preview</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleCopy}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Copy prompt to clipboard"
          >
            Copy
          </button>
          <PrimaryButton
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Script'}
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-6 border-t pt-6 dark:border-gray-700">
        {renderSection('Topic', config.topic)}
        {renderSection('Tone', config.tone)}
        {renderSection('Target Audience', config.targetAudience)}
        {config.customInstructions && renderSection('Custom Instructions', config.customInstructions)}
        {config.isCourse && config.courseTitle && renderSection('Course Title', config.courseTitle)}
      </div>

      <div className="mt-6 border-t pt-6 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Complete Prompt</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{prompt}</pre>
        </div>
      </div>
    </div>
  );
} 