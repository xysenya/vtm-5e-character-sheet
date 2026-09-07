import React from 'react';
import { CharacterSheet } from '../types';
import { DotRating } from './DotRating';
import { SquareBoxes } from './SquareBoxes';
import { Heart, Sparkles, Shield, Compass } from 'lucide-react';

interface VirtuesAndMoralityProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateVirtues: (updates: Partial<CharacterSheet['virtues']>) => void;
  onUpdateHumanity: (updates: Partial<CharacterSheet['humanity']>) => void;
  onUpdateWillpower: (updates: Partial<CharacterSheet['willpower']>) => void;
  onOpenLibraryTab: (tab: 'paths') => void;
}

export const VirtuesAndMorality: React.FC<VirtuesAndMoralityProps> = ({
  sheet,
  accentColor,
  onUpdateVirtues,
  onUpdateHumanity,
  onUpdateWillpower,
  onOpenLibraryTab,
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Virtues */}
      <div className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
            <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Добродетели (Virtues)
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">1-5 точек</span>
          </div>

          <div className="space-y-3.5">
            {/* Conscience / Conviction */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateVirtues({
                      conscienceType:
                        sheet.virtues.conscienceType === 'Совесть' ? 'Убежденность' : 'Совесть',
                    })
                  }
                  className="text-xs font-serif font-bold text-zinc-200 hover:text-red-400 underline decoration-dotted cursor-pointer"
                  title="Нажмите для переключения между Совестью и Убежденностью"
                >
                  {sheet.virtues.conscienceType}
                </button>
              </div>
              <DotRating
                id="virtue-conscience"
                value={sheet.virtues.conscience}
                max={5}
                min={1}
                onChange={(val) => onUpdateVirtues({ conscience: val })}
                accentColor={accentColor}
              />
            </div>

            {/* Self-Control / Instinct */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateVirtues({
                      selfControlType:
                        sheet.virtues.selfControlType === 'Самоконтроль' ? 'Инстинкт' : 'Самоконтроль',
                    })
                  }
                  className="text-xs font-serif font-bold text-zinc-200 hover:text-red-400 underline decoration-dotted cursor-pointer"
                  title="Нажмите для переключения между Самоконтролем и Инстинктом"
                >
                  {sheet.virtues.selfControlType}
                </button>
              </div>
              <DotRating
                id="virtue-self-control"
                value={sheet.virtues.selfControl}
                max={5}
                min={1}
                onChange={(val) => onUpdateVirtues({ selfControl: val })}
                accentColor={accentColor}
              />
            </div>

            {/* Courage */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="text-xs font-serif font-bold text-zinc-200">
                Мужество (Courage)
              </span>
              <DotRating
                id="virtue-courage"
                value={sheet.virtues.courage}
                max={5}
                min={1}
                onChange={(val) => onUpdateVirtues({ courage: val })}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Humanity / Path */}
      <div className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
            <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Мораль и Путь
            </h2>
            <button
              type="button"
              onClick={() => onOpenLibraryTab('paths')}
              className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Выбрать Путь
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <input
                  type="text"
                  value={sheet.humanity.pathName}
                  onChange={(e) => onUpdateHumanity({ pathName: e.target.value })}
                  className="bg-transparent text-sm font-bold font-serif text-white focus:outline-none focus:border-b border-red-600 flex-1"
                />
                <span className="text-xs font-mono font-bold text-red-500">
                  {sheet.humanity.rating} / 10
                </span>
              </div>

              {/* Progress bar visual as in Elegant Dark design */}
              <div className="grid grid-cols-10 gap-1 mb-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-xs transition-colors ${
                      i < sheet.humanity.rating ? 'bg-red-800' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center py-1">
                <DotRating
                  id="humanity-rating"
                  value={sheet.humanity.rating}
                  max={10}
                  min={0}
                  onChange={(val) => onUpdateHumanity({ rating: val })}
                  accentColor={accentColor}
                  size="sm"
                />
              </div>
            </div>

            <div className="pt-2.5 border-t border-zinc-900">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">
                Аура / Влияние (Bearing):
              </label>
              <input
                type="text"
                placeholder="Нормальность (Штраф 0)..."
                value={sheet.humanity.bearing || ''}
                onChange={(e) => onUpdateHumanity({ bearing: e.target.value })}
                className="w-full text-xs bg-zinc-950/60 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 focus:border-red-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Willpower */}
      <div className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
            <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              Сила Воли (Willpower)
            </h2>
            <span className="text-xs font-mono font-bold text-red-500">
              {sheet.willpower.current} / {sheet.willpower.permanent}
            </span>
          </div>

          <div className="space-y-3">
            {/* Permanent dots */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">
                Постоянный рейтинг (точки):
              </span>
              <div className="flex justify-center py-1">
                <DotRating
                  id="willpower-perm"
                  value={sheet.willpower.permanent}
                  max={10}
                  min={1}
                  onChange={(val) => {
                    onUpdateWillpower({
                      permanent: val,
                      current: Math.min(sheet.willpower.current, val),
                    });
                  }}
                  accentColor="#b91c1c"
                  size="sm"
                />
              </div>
            </div>

            {/* Current pool boxes */}
            <div className="pt-2.5 border-t border-zinc-900">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">
                Текущий запас (ячейки):
              </span>
              <div className="flex justify-center py-1">
                <SquareBoxes
                  current={sheet.willpower.current}
                  max={sheet.willpower.permanent}
                  onChange={(val) => onUpdateWillpower({ current: val })}
                  color="#b91c1c"
                  idPrefix="wp-box"
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateWillpower({
                    current: Math.max(0, sheet.willpower.current - 1),
                  })
                }
                disabled={sheet.willpower.current <= 0}
                className="px-2.5 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded border border-zinc-800 cursor-pointer transition-colors"
              >
                -1 Воля
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateWillpower({
                    current: Math.min(sheet.willpower.permanent, sheet.willpower.current + 1),
                  })
                }
                disabled={sheet.willpower.current >= sheet.willpower.permanent}
                className="px-2.5 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded border border-zinc-800 cursor-pointer transition-colors"
              >
                +1 Воля
              </button>
              <button
                type="button"
                onClick={() => onUpdateWillpower({ current: sheet.willpower.permanent })}
                className="px-2.5 py-1 text-[11px] bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white rounded border border-red-900/60 cursor-pointer transition-colors"
              >
                Восстановить
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
