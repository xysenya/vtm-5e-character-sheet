import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
}) => {
  if (!isOpen) return null;

  const icon =
    type === 'success' ? (
      <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
    ) : type === 'warning' ? (
      <AlertTriangle className="w-7 h-7 text-amber-500 shrink-0" />
    ) : type === 'error' ? (
      <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
    ) : (
      <Info className="w-7 h-7 text-blue-400 shrink-0" />
    );

  return (
    <Modal
      id="vtm-alert-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="flex items-start gap-4 py-2">
        {icon}
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {message}
        </div>
      </div>
      <div className="flex justify-end pt-3 border-t border-red-900/20">
        <button
          id="vtm-alert-ok-btn"
          onClick={onClose}
          className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm rounded-lg transition-colors border border-zinc-800 cursor-pointer shadow-md"
        >
          Понятно
        </button>
      </div>
    </Modal>
  );
};
