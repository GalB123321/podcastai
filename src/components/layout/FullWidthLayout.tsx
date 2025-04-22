interface FullWidthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function FullWidthLayout({ children, className = '' }: FullWidthLayoutProps) {
  return (
    <div 
      className={`
        min-h-screen w-full
        bg-white
        ${className}
      `}
    >
      <main 
        className="
          w-full max-w-full
          px-4 sm:px-6 lg:px-8
          py-6 sm:py-8 lg:py-12
        "
      >
        {children}
      </main>
    </div>
  );
} 