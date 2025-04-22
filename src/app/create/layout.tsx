'use client';

import { PromptProvider } from '@/hooks/usePrompt';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PromptProvider>
      {children}
    </PromptProvider>
  );
} 