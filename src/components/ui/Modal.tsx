import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Focus first focusable element
    const focusFirstElement = () => {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    focusFirstElement();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-0"
      onClick={onClose}
      data-testid="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative
          bg-[#121212] text-white
          rounded-xl p-6
          shadow-2xl
          w-full max-w-md
          max-h-[90vh] overflow-y-auto
          transition-all duration-300 ease-in-out
          motion-safe:opacity-0 motion-safe:scale-95
          motion-safe:animate-in
          motion-safe:fade-in
          motion-safe:zoom-in-95
          motion-safe:duration-200
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}

        {/* Title */}
        {title && (
          <h2 
            id="modal-title" 
            className="text-xl font-semibold mb-4 pr-8"
          >
            {title}
          </h2>
        )}

        {/* Content */}
        <div 
          className="space-y-4"
          id="modal-content"
          aria-describedby="modal-content"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
} 