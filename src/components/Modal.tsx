import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  id?: string;
  bodyClassName?: string;
  containerClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  id,
  bodyClassName,
  containerClassName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id || 'vtm-modal-backdrop'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto overflow-x-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="vtm-modal-container"
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} bg-[#0d0d0d] border border-red-900/40 rounded-xl shadow-2xl shadow-black/90 text-zinc-200 relative overflow-hidden flex flex-col max-h-[92vh] my-auto ${
          containerClassName || ''
        }`}
      >
        {/* Ornate top blood-tinted border */}
        <div className="h-[2px] bg-gradient-to-r from-red-950 via-red-600 to-red-950" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-red-900/20 bg-[#0a0a0a]">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-wide text-white flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <div className="text-xs text-zinc-400 mt-1 font-serif">
                {subtitle}
              </div>
            )}
          </div>
          <button
            id="vtm-modal-close-btn"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div
          className={
            bodyClassName !== undefined
              ? bodyClassName
              : 'p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-[#0d0d0d]'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};
