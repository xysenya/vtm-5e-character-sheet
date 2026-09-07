import React from 'react';
import { Dices, AlertTriangle, Check, RotateCcw } from 'lucide-react';
import { Modal } from '../Modal';

interface RandomizeAttributesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark?: boolean;
}

export const RandomizeAttributesModal: React.FC<RandomizeAttributesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark = true,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      id="vtm-randomize-attributes-modal"
      title={
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-red-500" />
          <span className="font-serif text-lg tracking-wide uppercase font-bold text-red-200">
            Распределение характеристик
          </span>
        </div>
      }
      subtitle="Случайная генерация стартовых точек по правилам V5"
    >
      <div className="space-y-4 text-zinc-300 font-serif">
        {/* Warning banner */}
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-red-200">
              Вы хотите раскидать характеристики случайным образом?
            </p>
            <p className="text-zinc-300 font-sans">
              Текущие значения всех 9 характеристик будут перезаписаны в соответствии с официальным правилом создания персонажа V5.
            </p>
          </div>
        </div>

        {/* Rule breakdown card */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2.5">
          <div className="text-xs uppercase font-bold tracking-wider text-red-400 font-sans">
            Стартовый набор очков (всего 22 точки):
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
              <span>Одна характеристика:</span>
              <span className="font-bold text-red-400 font-mono">4 точки (••••)</span>
            </div>
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
              <span>Три характеристики:</span>
              <span className="font-bold text-red-400 font-mono">по 3 точки (•••)</span>
            </div>
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
              <span>Четыре характеристики:</span>
              <span className="font-bold text-red-400 font-mono">по 2 точки (••)</span>
            </div>
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
              <span>Одна характеристика:</span>
              <span className="font-bold text-red-400 font-mono">1 точка (•)</span>
            </div>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 pt-1 border-t border-zinc-800/80">
            Значения будут случайно распределены между физическими, социальными и ментальными атрибутами. Максимум Здоровья и Силы воли обновится автоматически.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-sans text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded text-xs font-serif font-bold uppercase tracking-wider bg-red-900 hover:bg-red-800 text-white shadow-md shadow-red-950 border border-red-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4" />
            Раскидать характеристики
          </button>
        </div>
      </div>
    </Modal>
  );
};
