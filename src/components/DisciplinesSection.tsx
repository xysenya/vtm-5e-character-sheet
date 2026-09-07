import React, { useState } from 'react';
import { CharacterSheet, DisciplineItem } from '../types';
import { DotRating } from './DotRating';
import { Sparkles, Plus, Trash2, BookOpen } from 'lucide-react';

interface DisciplinesSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateDiscipline: (id: string, updates: Partial<DisciplineItem>) => void;
  onAddCustomDiscipline: (name: string) => void;
  onDeleteDiscipline: (id: string) => void;
  onOpenLibrary: () => void;
}

export const DisciplinesSection: React.FC<DisciplinesSectionProps> = ({
  sheet,
  accentColor,
  onUpdateDiscipline,
  onAddCustomDiscipline,
  onDeleteDiscipline,
  onOpenLibrary,
}) => {
  const [customName, setCustomName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-red-900/20 gap-2">
        <div>
          <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            Дисциплины (Disciplines)
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans">
            Сверхъестественные вампирские силы витэ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/70 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            Добавить из библиотеки
          </button>
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            Вручную
          </button>
        </div>
      </div>

      {showAddCustom && (
        <div className="mb-4 p-3 bg-zinc-950/90 rounded-lg border border-red-900/40 flex gap-2">
          <input
            type="text"
            placeholder="Название дисциплины..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customName.trim()) {
                onAddCustomDiscipline(customName.trim());
                setCustomName('');
                setShowAddCustom(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (customName.trim()) {
                onAddCustomDiscipline(customName.trim());
                setCustomName('');
                setShowAddCustom(false);
              }
            }}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-900/70 rounded text-xs cursor-pointer font-semibold"
          >
            Добавить
          </button>
          <button
            type="button"
            onClick={() => setShowAddCustom(false)}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
          >
            Отмена
          </button>
        </div>
      )}

      {sheet.disciplines.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500 italic border border-dashed border-red-900/20 rounded-lg">
          Дисциплины еще не добавлены. Нажмите «Добавить из библиотеки», чтобы выбрать клановые или внеклановые силы!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sheet.disciplines.map((disc) => (
            <div
              key={disc.id}
              className="bg-gradient-to-r from-red-950/20 via-zinc-950/60 to-transparent p-3.5 rounded-lg border border-red-900/30 flex flex-col justify-between hover:border-red-900/60 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif font-bold text-sm text-white truncate">
                  {disc.name}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <DotRating
                    id={`disc-${disc.id}`}
                    value={disc.dots}
                    max={5}
                    min={0}
                    onChange={(val) => onUpdateDiscipline(disc.id, { dots: val })}
                    accentColor={accentColor}
                  />
                  <button
                    type="button"
                    onClick={() => onDeleteDiscipline(disc.id)}
                    className="text-zinc-600 hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                    title="Удалить дисциплину"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notes or power names */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Изученные силы (напр. Кошачья грация, Рывок)..."
                  value={disc.notes || ''}
                  onChange={(e) => onUpdateDiscipline(disc.id, { notes: e.target.value })}
                  className="w-full text-[11px] bg-transparent border-b border-zinc-850 focus:border-red-600 text-zinc-400 placeholder:text-zinc-600 px-1 py-0.5 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
