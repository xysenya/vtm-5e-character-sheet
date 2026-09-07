import React from 'react';
import { CharacterSheet, DamageType, HealthLevel } from '../types';
import { SquareBoxes } from './SquareBoxes';
import { cycleDamage, getCurrentHealthPenalty } from '../utils/calculations';
import { Droplet, HeartPulse, ShieldAlert, Sparkles, Plus, Minus, RotateCcw } from 'lucide-react';

interface BloodAndHealthProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateBlood: (updates: Partial<CharacterSheet['bloodPool']>) => void;
  onUpdateHealth: (health: HealthLevel[]) => void;
  onOpenDiceRoller: () => void;
}

export const BloodAndHealth: React.FC<BloodAndHealthProps> = ({
  sheet,
  accentColor,
  onUpdateBlood,
  onUpdateHealth,
  onOpenDiceRoller,
}) => {
  const healthStatus = getCurrentHealthPenalty(sheet.health);

  const handleHealthLevelClick = (index: number) => {
    const updated = sheet.health.map((lvl, idx) => {
      if (idx === index) {
        return {
          ...lvl,
          damage: cycleDamage(lvl.damage),
        };
      }
      return lvl;
    });
    onUpdateHealth(updated);
  };

  const handleHealOneDamage = () => {
    // Find the highest damage box and remove or downgrade it
    for (let i = sheet.health.length - 1; i >= 0; i--) {
      if (sheet.health[i].damage !== 'none') {
        const updated = [...sheet.health];
        if (updated[i].damage === 'bashing') {
          updated[i].damage = 'none';
        } else if (updated[i].damage === 'lethal') {
          updated[i].damage = 'none';
        } else if (updated[i].damage === 'aggravated') {
          // Aggravated is reduced to lethal or healed with resting
          updated[i].damage = 'lethal';
        }
        onUpdateHealth(updated);
        break;
      }
    }
  };

  const handleClearAllDamage = () => {
    const cleared = sheet.health.map(h => ({ ...h, damage: 'none' as DamageType }));
    onUpdateHealth(cleared);
  };

  const renderDamageBadge = (type: DamageType) => {
    switch (type) {
      case 'bashing':
        return <span className="font-bold text-amber-400 text-sm">/</span>;
      case 'lethal':
        return <span className="font-bold text-red-400 text-sm">✕</span>;
      case 'aggravated':
        return <span className="font-black text-rose-500 text-sm">✱</span>;
      default:
        return null;
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Blood Pool */}
      <div className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
            <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
              Запас Крови (Blood Pool)
            </h2>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-red-500">
                {sheet.bloodPool.current} / {sheet.bloodPool.max}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-sans">
                Лимит в ход: {sheet.bloodPool.perTurn} витэ
              </span>
            </div>
          </div>

          {/* Blood Pool boxes */}
          <div className="py-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-2 font-sans">
              Ячейки крови (нажмите для изменения):
            </span>
            <SquareBoxes
              current={sheet.bloodPool.current}
              max={sheet.bloodPool.max}
              onChange={(val) => onUpdateBlood({ current: val })}
              color="#dc2626"
              iconType="blood"
              idPrefix="blood-box"
            />
          </div>
        </div>

        {/* Quick blood actions */}
        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() =>
                onUpdateBlood({
                  current: Math.max(0, sheet.bloodPool.current - 1),
                })
              }
              disabled={sheet.bloodPool.current <= 0}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded border border-zinc-800 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Minus className="w-3 h-3 text-red-400" /> -1 кровь (Закат)
            </button>

            <button
              type="button"
              onClick={() => {
                if (sheet.bloodPool.current > 0) {
                  onUpdateBlood({ current: sheet.bloodPool.current - 1 });
                  handleHealOneDamage();
                }
              }}
              disabled={sheet.bloodPool.current <= 0}
              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/80 disabled:opacity-40 text-red-200 rounded border border-red-900/60 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <HeartPulse className="w-3 h-3 text-red-400" /> Исцелить рану (-1 кровь)
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateBlood({
                  current: Math.min(sheet.bloodPool.max, sheet.bloodPool.current + 3),
                })
              }
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3 text-emerald-400" /> Охота (+3 крови)
            </button>

            <button
              type="button"
              onClick={() => onUpdateBlood({ current: sheet.bloodPool.max })}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-800 cursor-pointer transition-colors"
            >
              Полный сытый запас
            </button>
          </div>
        </div>
      </div>

      {/* 2. Health Track */}
      <div className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
            <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" />
              Здоровье (Health Track)
            </h2>
            <div className="text-right">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  healthStatus.penalty === 99
                    ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                    : healthStatus.penalty < 0
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                {healthStatus.label}
              </span>
            </div>
          </div>

          {/* Health Levels List */}
          <div className="space-y-1 text-xs">
            {sheet.health.map((lvl, idx) => (
              <div
                key={lvl.id}
                onClick={() => handleHealthLevelClick(idx)}
                className={`flex items-center justify-between p-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                  lvl.damage !== 'none'
                    ? 'bg-red-950/20 border-red-900/60 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-850/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-zinc-200">
                    {lvl.name}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    ({lvl.nameEn})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold font-mono ${
                      lvl.penalty === 99
                        ? 'text-rose-500 font-serif text-[11px]'
                        : lvl.penalty < 0
                        ? 'text-red-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {lvl.penalty === 99 ? 'Недееспособен' : lvl.penalty === 0 ? '—' : `${lvl.penalty}`}
                  </span>

                  {/* Damage box */}
                  <div
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                      lvl.damage === 'none'
                        ? 'border-zinc-800 bg-zinc-900/80 hover:border-red-900/60'
                        : lvl.damage === 'bashing'
                        ? 'border-amber-500/80 bg-amber-950/50'
                        : lvl.damage === 'lethal'
                        ? 'border-red-600 bg-red-950/60'
                        : 'border-rose-600 bg-rose-950/80 shadow-[0_0_8px_#e11d48]'
                    }`}
                    title="Кликните для цикличного изменения: Ударный [/] -> Летальный [X] -> Усугубленный [*]"
                  >
                    {renderDamageBadge(lvl.damage)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2.5 font-sans">
            <span>Клик по ячейке: Ударный (/) ➔ Летальный (✕) ➔ Усугубленный (✱)</span>
            <button
              type="button"
              onClick={handleClearAllDamage}
              className="text-zinc-500 hover:text-red-400 underline cursor-pointer"
            >
              Снять весь урон
            </button>
          </div>
        </div>

        {/* Health status helper */}
        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenDiceRoller}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer font-serif transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Учесть штраф здоровья в броске кубиков
          </button>
          <button
            type="button"
            onClick={handleHealOneDamage}
            className="text-xs text-zinc-300 hover:text-white px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded cursor-pointer transition-colors"
          >
            Залечить 1 рану
          </button>
        </div>
      </div>
    </section>
  );
};
