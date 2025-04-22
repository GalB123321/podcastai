import * as React from 'react';

interface CreditContextType {
  credits: number;
  setCredits: (credits: number) => void;
}

export const CreditContext = React.createContext<CreditContextType>({
  credits: 0,
  setCredits: () => {}
});

interface CreditProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for credit management
 */
export function CreditProvider({ children }: CreditProviderProps): React.JSX.Element {
  const [credits, setCredits] = React.useState(0);

  return React.createElement(
    CreditContext.Provider,
    {
      value: {
        credits,
        setCredits
      }
    },
    children
  );
} 