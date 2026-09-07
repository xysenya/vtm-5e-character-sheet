import React, { useState } from 'react';
import { CharacterSheet, BackgroundItem } from '../types';
import { DotRating } from './DotRating';
import { Compass, Plus, Trash2, BookOpen } from 'lucide-react';

interface BackgroundsSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateBackground: (id: string, updates: Partial<BackgroundItem>) => void;
  onAddCustomBackground: (name: string) => void;
  onDeleteBackground: (id: string) => void;
  onOpenLibrary: () => void;
}

export const BackgroundsSection: React.FC<BackgroundsSectionProps> = ({
  sheet,
  accentColor,
  onUpdateBackground,
  onAddCustomBackground,
  onDeleteBackground,
  onOpenLibrary,
}) => {
  const [customName, setCustomName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-red-900/20 gap-2">
        <div>
          <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-500" />
            Предыстории (Backgrounds)
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans">
            Ресурсы, влияние, связи, союзники и статус в обществе
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
            placeholder="Название предыстории..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customName.trim()) {
                onAddCustomBackground(customName.trim());
                setCustomName('');
                setShowAddCustom(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (customName.trim()) {
                onAddCustomBackground(customName.trim());
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sheet.backgrounds.map((bg) => (
          <div
            key={bg.id}
            className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80 flex flex-col justify-between hover:border-red-900/50 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif font-bold text-sm text-white truncate">
                {bg.name}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <DotRating
                  id={`bg-${bg.id}`}
                  value={bg.dots}
                  max={5}
                  min={0}
                  onChange={(val) => onUpdateBackground(bg.id, { dots: val })}
                  accentColor={accentColor}
                />
                <button
                  type="button"
                  onClick={() => onDeleteBackground(bg.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                  title="Удалить предысторию"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="Подробности (напр. 3 счета в банке, союзник-капитан полиции)..."
                value={bg.description || ''}
                onChange={(e) => onUpdateBackground(bg.id, { description: e.target.value })}
                className="w-full text-[11px] bg-transparent border-b border-zinc-850 focus:border-red-600 text-zinc-300 placeholder:text-zinc-600 px-1 py-0.5 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
