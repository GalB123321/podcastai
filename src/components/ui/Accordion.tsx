import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { FaChevronDown } from 'react-icons/fa';

interface AccordionSingleProps {
  type: 'single';
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface AccordionMultipleProps {
  type: 'multiple';
  collapsible?: boolean;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

interface AccordionItemProps {
  value: string;
  title: string;
  content: string;
  className?: string;
}

export function Accordion(props: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={cn('space-y-2', props.className)}
    >
      {props.children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionItem({ value, title, content, className }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn(
        'border border-muted rounded-lg overflow-hidden',
        'focus-within:ring-2 focus-within:ring-accent/20',
        className
      )}
    >
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            'flex flex-1 items-center justify-between px-4 py-4 text-sm font-medium',
            'hover:bg-muted/5 transition-colors',
            'focus:outline-none'
          )}
        >
          <span className="text-textPrimary">{title}</span>
          <FaChevronDown
            className="h-4 w-4 text-textSecondary transition-transform duration-200"
            aria-hidden
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className={cn(
          'overflow-hidden text-sm transition-all',
          'data-[state=closed]:animate-accordion-up',
          'data-[state=open]:animate-accordion-down'
        )}
      >
        <div className="px-4 py-4 pt-0 text-textSecondary">
          {content}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
} 