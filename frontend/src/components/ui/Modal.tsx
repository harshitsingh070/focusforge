import React, { useCallback, useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const widthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'lg' }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-[ff-fade-in_180ms_ease_both] backdrop-blur-md"
        style={{ background: 'var(--ff-ui-overlay)' }}
      />

      {/* Panel */}
      <div
        className={`
          ff-modal-panel relative z-10 w-full ${widthMap[maxWidth]}
          max-h-[92vh] overflow-y-auto
          rounded-t-[1.75rem] sm:rounded-[1.75rem]
          p-6 shadow-2xl
          animate-[ff-modal-enter_200ms_cubic-bezier(0.22,1,0.36,1)_both]
        `}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-[-0.03em]" style={{ color: 'var(--ff-ui-text)' }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="ff-modal-close flex h-9 w-9 items-center justify-center"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
