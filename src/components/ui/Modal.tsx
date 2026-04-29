import { type ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'ai-header';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', className, variant = 'default' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative w-full bg-white rounded-xl shadow-lg',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className={clsx(
            'flex items-center justify-between px-6 py-4',
            variant === 'ai-header' ? 'modal-ai-header' : 'border-b border-secondary-100'
          )}>
            <div className={clsx(
              variant === 'ai-header' ? 'modal-ai-header-content' : ''
            )}>
              {variant === 'ai-header' ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-300">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" fillOpacity="0.9"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-xs text-blue-200/70">Análisis inteligente de sesiones</p>
                  </div>
                </div>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
            </div>
            <button
              onClick={onClose}
              className={clsx(
                'p-1 rounded-lg transition-colors',
                variant === 'ai-header'
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100'
              )}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={clsx(
          'max-h-[70vh] overflow-y-auto',
          variant === 'ai-header' ? 'px-6 py-5 ai-content-bg' : 'px-6 py-4'
        )}>
          {variant === 'ai-header' ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl">{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
