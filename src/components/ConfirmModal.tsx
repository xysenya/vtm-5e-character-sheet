import React from 'react';
import { Modal } from './Modal';
import { HelpCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      id="vtm-confirm-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="flex items-start gap-4 py-2">
        <HelpCircle
          className={`w-7 h-7 shrink-0 ${isDestructive ? 'text-red-500' : 'text-amber-400'}`}
        />
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {message}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-red-900/20">
        <button
          id="vtm-confirm-cancel-btn"
          onClick={onClose}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
        >
          {cancelText}
        </button>
        <button
          id="vtm-confirm-action-btn"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-lg ${
            isDestructive
              ? 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-800'
              : 'bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-900/80 font-bold'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
