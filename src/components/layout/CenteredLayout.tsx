interface CenteredLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function CenteredLayout({ 
  children, 
  maxWidth = 'lg',
  className = '' 
}: CenteredLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div 
      className={`
        min-h-screen
        flex items-center justify-center
        bg-gray-50
        px-4 py-12 sm:px-6
        ${className}
      `}
    >
      <main 
        className={`
          w-full
          ${maxWidthClasses[maxWidth]}
          mx-auto
          bg-white
          rounded-lg
          shadow-sm
          p-6 sm:p-8
        `}
        role="main"
        aria-labelledby="page-title"
      >
        {children}
      </main>
    </div>
  );
} 