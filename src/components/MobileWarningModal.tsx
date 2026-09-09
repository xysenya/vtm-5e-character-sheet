import React, { useState } from 'react';
import { Modal } from './Modal';
import { Smartphone, Monitor, AlertTriangle } from 'lucide-react';

interface MobileWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileWarningModal: React.FC<MobileWarningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('vtm_dismiss_mobile_warning', 'true');
      } catch (e) {
        console.error('Failed to save mobile warning dismissal preference', e);
      }
    }
    onClose();
  };

  return (
    <Modal
      id="vtm-mobile-warning-modal"
      isOpen={isOpen}
      onClose={handleConfirm}
      title="Мобильная версия сайта"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 py-2">
        {/* Visual Notice Header */}
        <div className="flex items-start gap-3.5 p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-zinc-200">
          <div className="relative shrink-0 mt-0.5">
            <Smartphone className="w-6 h-6 text-red-400" />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 absolute -bottom-1 -right-1" />
          </div>
          <p className="text-sm font-serif leading-relaxed text-zinc-200">
            В мобильной версии сайта возможности редактора крайне ограничены. Для полноценного заполнения листа персонажа рекомендуем открыть сайт на компьютере.
          </p>
        </div>

        {/* Suggestion block */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-400 font-sans">
          <Monitor className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>На ПК доступны интерактивная схема отношений, удобная печать в A4/PDF и все панели настройки.</span>
        </div>

        {/* Checkbox: "Больше не показывать это сообщение" */}
        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none group">
          <input
            type="checkbox"
            id="vtm-cb-dont-show-mobile-warning"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 focus:ring-offset-0 cursor-pointer accent-red-600"
          />
          <span className="text-xs font-serif text-zinc-300 group-hover:text-white transition-colors">
            Больше не показывать это сообщение
          </span>
        </label>
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end pt-3 border-t border-red-900/20">
        <button
          type="button"
          id="vtm-mobile-warning-ok-btn"
          onClick={handleConfirm}
          className="px-5 py-2 bg-red-900/90 hover:bg-red-800 text-white font-serif font-medium text-sm rounded-lg transition-colors border border-red-700 cursor-pointer shadow-md"
        >
          Понятно
        </button>
      </div>
    </Modal>
  );
};
