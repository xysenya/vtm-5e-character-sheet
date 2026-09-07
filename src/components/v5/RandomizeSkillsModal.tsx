import React, { useState } from 'react';
import { Dices, AlertTriangle, Check, Award } from 'lucide-react';
import { Modal } from '../Modal';

export type SkillDistributionTemplate = 'jack' | 'balanced' | 'specialist';

interface RandomizeSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: SkillDistributionTemplate, clearSpecialties: boolean) => void;
  isDark?: boolean;
}

export const RandomizeSkillsModal: React.FC<RandomizeSkillsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark = true,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<SkillDistributionTemplate>('balanced');
  const [clearSpecialties, setClearSpecialties] = useState<boolean>(false);

  const templates: {
    id: SkillDistributionTemplate;
    title: string;
    formula: string;
    pointsCount: number;
    activeSkillsCount: number;
    description: string;
  }[] = [
    {
      id: 'jack',
      title: '1. Мастер на все руки',
      formula: '1x3, 8x2, 10x1',
      pointsCount: 29,
      activeSkillsCount: 19,
      description: 'Большой охват умений начального и базового уровня (19 навыков с точками, 8 навыков без точек).',
    },
    {
      id: 'balanced',
      title: '2. Гармоничное развитие',
      formula: '3x3, 5x2, 7x1',
      pointsCount: 26,
      activeSkillsCount: 15,
      description: 'Сбалансированное развитие с тремя ключевыми компетенциями (15 навыков с точками, 12 без точек).',
    },
    {
      id: 'specialist',
      title: '3. Узкий специалист',
      formula: '1x4, 3x3, 3x2, 3x1',
      pointsCount: 22,
      activeSkillsCount: 10,
      description: 'Глубокая экспертность в одной выбранной сфере на 4 точки (10 навыков с точками, 17 без точек).',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      id="vtm-randomize-skills-modal"
      title={
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-red-500" />
          <span className="font-serif text-lg tracking-wide uppercase font-bold text-red-200">
            Распределение навыков
          </span>
        </div>
      }
      subtitle="Выберите шаблон для случайного распределения точек навыков"
    >
      <div className="space-y-4 text-zinc-300 font-serif">
        {/* Warning banner */}
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-red-200">
              Вы хотите раскидать навыки случайным образом?
            </p>
            <p className="text-zinc-300 font-sans">
              Текущие значения всех 27 навыков будут перезаписаны случайным образом в соответствии с выбранным шаблоном V5.
            </p>
          </div>
        </div>

        {/* Radio options for distribution templates */}
        <div className="space-y-2.5">
          <div className="text-xs uppercase font-bold tracking-wider text-red-400 font-sans">
            Выберите один из официальных шаблонов распределения:
          </div>

          <div className="space-y-2">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-red-950/40 border-red-600/90 text-white shadow-md shadow-red-950/40'
                      : 'bg-zinc-900/50 hover:bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="skillTemplate"
                    checked={isSelected}
                    onChange={() => setSelectedTemplate(tpl.id)}
                    className="mt-1 accent-red-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-serif font-bold text-sm text-red-100">
                        {tpl.title}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 border border-red-900/50 text-red-400">
                        {tpl.formula}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans mt-1">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkbox for specialties */}
        <label className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80 text-xs font-sans text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={clearSpecialties}
            onChange={(e) => setClearSpecialties(e.target.checked)}
            className="rounded accent-red-600 cursor-pointer"
          />
          <span>Очистить текстовые специализации навыков при перераспределении</span>
        </label>

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
              onConfirm(selectedTemplate, clearSpecialties);
              onClose();
            }}
            className="px-4 py-2 rounded text-xs font-serif font-bold uppercase tracking-wider bg-red-900 hover:bg-red-800 text-white shadow-md shadow-red-950 border border-red-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4" />
            Раскидать навыки
          </button>
        </div>
      </div>
    </Modal>
  );
};
