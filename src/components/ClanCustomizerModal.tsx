import React, { useState } from 'react';
import { Modal } from './Modal';
import { ClanId, CharacterSheet } from '../types';
import { CLAN_THEMES } from '../data/clans';
import { Palette, Check, Shield, Sparkles, BookOpen } from 'lucide-react';

interface ClanCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClan: ClanId;
  onSelectClan: (clanId: ClanId) => void;
  customName?: string;
  customColor?: string;
  customQuote?: string;
  onUpdateCustomTheme: (updates: { customClanName?: string; accentColor?: string; quote?: string }) => void;
  id?: string;
}

const COLOR_PRESETS = [
  { label: 'Кровавый багрянец (Бруха / Ассамиты)', hex: '#dc2626' },
  { label: 'Королевский сапфир (Вентру)', hex: '#2563eb' },
  { label: 'Бархатная роза (Тореадор)', hex: '#db2777' },
  { label: 'Герметический фиолетовый (Тремер)', hex: '#9333ea' },
  { label: 'Опаловый маревый (Малкавиан)', hex: '#a855f7' },
  { label: 'Канализационный мох (Носферату)', hex: '#65a30d' },
  { label: 'Янтарь первобытных лесов (Гангрел)', hex: '#d97706' },
  { label: 'Полночная Бездна (Ласомбра)', hex: '#475569' },
  { label: 'Костяной кармин (Цимисхи)', hex: '#e11d48' },
  { label: 'Изумрудный мавзолей (Джованни)', hex: '#059669' },
  { label: 'Иллюзорный шафран (Равнос)', hex: '#d97706' },
  { label: 'Змеиное золото (Сет)', hex: '#ca8a04' },
  { label: 'Мистический лазурит (Салюбри)', hex: '#0891b2' },
  { label: 'Уличный пепел (Каитифы)', hex: '#78716c' },
];

export const ClanCustomizerModal: React.FC<ClanCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentClan,
  onSelectClan,
  customName,
  customColor,
  customQuote,
  onUpdateCustomTheme,
}) => {
  const [selectedClanId, setSelectedClanId] = useState<ClanId>(currentClan);
  const [bloodlineName, setBloodlineName] = useState(customName || '');
  const [activeColor, setActiveColor] = useState(customColor || CLAN_THEMES[currentClan].accentColor);
  const [quoteText, setQuoteText] = useState(customQuote || '');

  const activeTheme = CLAN_THEMES[selectedClanId];

  const handleApply = () => {
    onSelectClan(selectedClanId);
    onUpdateCustomTheme({
      customClanName: bloodlineName,
      accentColor: activeColor,
      quote: quoteText,
    });
    onClose();
  };

  return (
    <Modal
      id="vtm-clan-customizer-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-red-500" />
          Кастомизация оформления: Кланы и Линии Крови
        </span>
      }
      subtitle="Выберите клановую стилизацию, акцентные цвета и геральдику листа персонажа"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Clan Cards Grid */}
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-widest mb-2 font-sans">
            Выберите Клан или Линию Крови:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {Object.values(CLAN_THEMES).map((c) => {
              const isSelected = selectedClanId === c.id;
              return (
                <button
                  key={c.id}
                  id={`clan-card-${c.id}`}
                  onClick={() => {
                    setSelectedClanId(c.id);
                    setActiveColor(c.accentColor);
                    setQuoteText(c.quote);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-950 border-2 shadow-lg'
                      : 'bg-[#0a0a0a] border-zinc-850 hover:border-zinc-700'
                  }`}
                  style={{
                    borderColor: isSelected ? c.accentColor : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-serif text-sm text-white">
                      {c.name}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                      style={{ backgroundColor: c.accentColor }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 italic mt-1 truncate font-sans">
                    {c.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Clan Overview */}
        <div
          className="p-5 rounded-xl border bg-[#0a0a0a] space-y-3"
          style={{ borderColor: activeColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-900">
            <div>
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                {selectedClanId === 'custom' && bloodlineName ? bloodlineName : activeTheme.name}
                <span className="text-xs text-zinc-500 font-sans font-normal">
                  ({activeTheme.nameEn})
                </span>
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">{activeTheme.flavor}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Цвет темы:</span>
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Quote */}
          <div className="text-xs italic text-zinc-300 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
            {quoteText || activeTheme.quote}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
              <span className="font-bold text-zinc-200 block mb-1 flex items-center gap-1 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Клановые дисциплины:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeTheme.disciplines.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
              <span className="font-bold text-red-400 block mb-1 flex items-center gap-1 font-serif">
                <Shield className="w-3.5 h-3.5" />
                Клановая слабость:
              </span>
              <p className="text-zinc-400 leading-relaxed">{activeTheme.weakness}</p>
            </div>
          </div>

          {/* Custom Bloodline Inputs if selected */}
          {selectedClanId === 'custom' && (
            <div className="pt-3 border-t border-zinc-900 space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">
                  Название пользовательской линии крови:
                </label>
                <input
                  type="text"
                  placeholder="Например: Дети Осириса, Горгульи, Нагараджа..."
                  value={bloodlineName}
                  onChange={(e) => setBloodlineName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-red-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">
                  Клановый девиз / Цитата:
                </label>
                <input
                  type="text"
                  placeholder="Цитата или кредо вашей линии крови..."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-red-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Color Presets */}
          <div className="pt-2">
            <span className="text-xs text-zinc-500 block mb-1.5 font-sans">Быстрые пресеты палитры:</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveColor(p.hex)}
                  title={p.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    activeColor === p.hex ? 'scale-125 border-white' : 'border-black/50 hover:scale-110'
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-red-900/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
          >
            Отмена
          </button>
          <button
            id="btn-apply-clan-theme"
            onClick={handleApply}
            className="px-6 py-2 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-900/80 font-bold text-xs rounded-lg shadow-lg cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            Применить оформление
          </button>
        </div>
      </div>
    </Modal>
  );
};
