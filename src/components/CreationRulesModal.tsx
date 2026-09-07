import React from 'react';
import { Modal } from './Modal';
import { CharacterSheet } from '../types';
import { calculateCreationDots } from '../utils/calculations';
import { Calculator, CheckCircle, AlertTriangle } from 'lucide-react';

interface CreationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  id?: string;
}

export const CreationRulesModal: React.FC<CreationRulesModalProps> = ({
  isOpen,
  onClose,
  sheet,
}) => {
  const dots = calculateCreationDots(sheet);

  // Classic creation dots targets
  // Attributes: 7 / 5 / 3 (primary / secondary / tertiary)
  const attrSpent = [dots.attributes.physical, dots.attributes.social, dots.attributes.mental].sort((a, b) => b - a);

  // Abilities: 13 / 9 / 5
  const abilSpent = [dots.abilities.talents, dots.abilities.skills, dots.abilities.knowledges].sort((a, b) => b - a);

  return (
    <Modal
      id="vtm-creation-calc-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-red-500" />
          Калькулятор и аудит очков создания персонажа
        </span>
      }
      subtitle="Автоматический расчет распределения точек по классическим правилам VTM"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Attributes section */}
        <div className="bg-[#0a0a0a] p-3.5 rounded-xl border border-red-900/20 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
            <span className="font-bold text-white uppercase font-serif tracking-wide">
              Характеристики (Норма 7 / 5 / 3 точек)
            </span>
            <span className="text-zinc-400">
              Потрачено точек: <strong className="text-red-500 font-mono">{dots.attributes.total}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Физические:</span>
              <span className="text-base font-bold text-white font-mono">{dots.attributes.physical}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Социальные:</span>
              <span className="text-base font-bold text-white font-mono">{dots.attributes.social}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Ментальные:</span>
              <span className="text-base font-bold text-white font-mono">{dots.attributes.mental}</span>
            </div>
          </div>
        </div>

        {/* Abilities section */}
        <div className="bg-[#0a0a0a] p-3.5 rounded-xl border border-red-900/20 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
            <span className="font-bold text-white uppercase font-serif tracking-wide">
              Способности (Норма 13 / 9 / 5 точек)
            </span>
            <span className="text-zinc-400">
              Потрачено точек: <strong className="text-red-500 font-mono">{dots.abilities.total}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Таланты:</span>
              <span className="text-base font-bold text-white font-mono">{dots.abilities.talents}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Навыки:</span>
              <span className="text-base font-bold text-white font-mono">{dots.abilities.skills}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <span className="text-zinc-400 block font-sans">Познания:</span>
              <span className="text-base font-bold text-white font-mono">{dots.abilities.knowledges}</span>
            </div>
          </div>
        </div>

        {/* Disciplines, Backgrounds, Virtues */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] p-3 rounded-xl border border-red-900/20 text-center">
            <span className="text-zinc-400 block font-sans">Дисциплины (Норма 3):</span>
            <span className="text-lg font-bold text-red-400 font-mono">{dots.disciplines}</span>
          </div>
          <div className="bg-[#0a0a0a] p-3 rounded-xl border border-red-900/20 text-center">
            <span className="text-zinc-400 block font-sans">Предыстории (Норма 5):</span>
            <span className="text-lg font-bold text-red-400 font-mono">{dots.backgrounds}</span>
          </div>
          <div className="bg-[#0a0a0a] p-3 rounded-xl border border-red-900/20 text-center">
            <span className="text-zinc-400 block font-sans">Добродетели (Норма 7):</span>
            <span className="text-lg font-bold text-red-400 font-mono">{dots.virtues}</span>
          </div>
        </div>

        {/* Merits & Flaws balance */}
        <div className="bg-[#0a0a0a] p-3.5 rounded-xl border border-red-900/20 flex items-center justify-between">
          <div>
            <span className="font-bold text-white block font-serif">Баланс Достоинств и Недостатков:</span>
            <span className="text-zinc-400">
              Достоинства: <strong className="text-emerald-400 font-mono">+{dots.merits}</strong> • Недостатки:{' '}
              <strong className="text-red-400 font-mono">-{dots.flaws}</strong>
            </span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg font-bold text-sm font-mono ${
              dots.flawBalance >= 0
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                : 'bg-red-950/70 text-red-300 border border-red-800'
            }`}
          >
            {dots.flawBalance > 0 ? `+${dots.flawBalance} очков` : `${dots.flawBalance} очков`}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-3 border-t border-red-900/20">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold rounded-lg cursor-pointer transition-colors"
        >
          Закрыть
        </button>
      </div>
    </Modal>
  );
};
