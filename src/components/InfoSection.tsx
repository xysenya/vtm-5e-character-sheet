import React from 'react';
import { CharacterSheet, ClanId, ClanTheme } from '../types';
import { CLAN_THEMES } from '../data/clans';
import { getGenerationInfo } from '../utils/calculations';
import { GENERATION_OPTIONS } from './HeaderSettingsModal';
import { Sparkles, Crown } from 'lucide-react';

interface InfoSectionProps {
  sheet: CharacterSheet;
  theme: ClanTheme;
  onChange: (updates: Partial<CharacterSheet['info']>) => void;
  onOpenLibraryTab: (tab: 'archetypes' | 'paths') => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  sheet,
  theme,
  onChange,
  onOpenLibraryTab,
}) => {
  const genInfo = getGenerationInfo(sheet.info.generation);

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl transition-all relative overflow-hidden">
      {/* Decorative clan accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 transition-colors"
        style={{ backgroundColor: theme.accentColor || '#7f1d1d' }}
      />

      {/* Clan Quote Banner */}
      <div
        className="mb-5 p-3 rounded-lg border text-xs italic transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-red-950/25 via-[#120d0d] to-transparent"
        style={{
          borderColor: 'rgba(153, 27, 27, 0.35)',
          color: '#d1d1d1',
        }}
      >
        <span className="font-serif">
          «{sheet.customTheme?.quote || theme.quote}»
        </span>
      </div>

      {/* Grid of 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Column 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Имя:
            </label>
            <input
              id="char-name-input"
              type="text"
              value={sheet.info.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="flex-1 bg-transparent font-serif font-bold text-lg text-white tracking-tight focus:outline-none focus:border-b border-red-600"
              placeholder="Имя Сородича"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Игрок:
            </label>
            <input
              id="char-player-input"
              type="text"
              value={sheet.info.player}
              onChange={(e) => onChange({ player: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600"
              placeholder="Ваше имя"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Хроника:
            </label>
            <input
              id="char-chronicle-input"
              type="text"
              value={sheet.info.chronicle}
              onChange={(e) => onChange({ chronicle: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600"
              placeholder="Название хроники"
            />
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold flex items-center justify-between">
              <span>Натура:</span>
              <button
                type="button"
                onClick={() => onOpenLibraryTab('archetypes')}
                className="text-[10px] text-red-500 hover:text-red-400 cursor-pointer"
                title="Выбрать из библиотеки архетипов"
              >
                +Библ
              </button>
            </label>
            <input
              id="char-nature-input"
              type="text"
              value={sheet.info.nature}
              onChange={(e) => onChange({ nature: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600 font-medium"
              placeholder="Истинное Я (Натура)"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold flex items-center justify-between">
              <span>Маска:</span>
              <button
                type="button"
                onClick={() => onOpenLibraryTab('archetypes')}
                className="text-[10px] text-red-500 hover:text-red-400 cursor-pointer"
                title="Выбрать из библиотеки архетипов"
              >
                +Библ
              </button>
            </label>
            <input
              id="char-demeanor-input"
              type="text"
              value={sheet.info.demeanor}
              onChange={(e) => onChange({ demeanor: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600 font-medium"
              placeholder="Видимый фасад (Маска)"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Концепт:
            </label>
            <input
              id="char-concept-input"
              type="text"
              value={sheet.info.concept}
              onChange={(e) => onChange({ concept: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600"
              placeholder="Например: Детектив, Финансист..."
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Клан:
            </label>
            <div className="flex-1 flex flex-col gap-1">
              <select
                id="char-clan-select"
                value={sheet.info.clan}
                onChange={(e) => onChange({ clan: e.target.value as ClanId })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white font-serif font-bold focus:border-red-900 focus:outline-none"
              >
                {Object.values(CLAN_THEMES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.nameEn})
                  </option>
                ))}
              </select>
              {sheet.info.clan === 'custom' && (
                <input
                  type="text"
                  value={sheet.info.customClanName || ''}
                  onChange={(e) => onChange({ customClanName: e.target.value })}
                  placeholder="Название линии крови..."
                  className="w-full bg-zinc-950 border border-red-900/60 rounded px-1.5 py-0.5 text-xs text-zinc-100 font-serif focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Поколение:
            </label>
            <div className="flex-1 flex items-center gap-2">
              <select
                id="char-generation-select"
                value={sheet.info.generation}
                onChange={(e) => onChange({ generation: parseInt(e.target.value) })}
                className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-200 font-bold focus:border-red-900 focus:outline-none"
              >
                {GENERATION_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500" title="Макс. запас крови и лимит характеристик">
                (Макс. {genInfo.maxBlood} витэ, черты до {genInfo.maxTrait})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1">
            <label className="w-24 text-zinc-500 uppercase font-serif tracking-widest text-[10px] font-semibold">
              Сир:
            </label>
            <input
              id="char-sire-input"
              type="text"
              value={sheet.info.sire}
              onChange={(e) => onChange({ sire: e.target.value })}
              className="flex-1 bg-transparent text-zinc-200 focus:outline-none focus:border-b border-red-600"
              placeholder="Создатель вампира"
            />
          </div>
        </div>
      </div>

      {/* Secondary metadata row: Sect, Haven, Title */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-zinc-900 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-zinc-500 uppercase tracking-widest text-[10px] font-semibold font-serif">Секта:</label>
          <select
            value={sheet.info.sect || 'Камарилья'}
            onChange={(e) => onChange({ sect: e.target.value })}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-200 focus:border-red-900"
          >
            <option value="Камарилья">Камарилья (Camarilla)</option>
            <option value="Анархи">Движение Анархов (Anarchs)</option>
            <option value="Шабаш">Шабаш (Sabbat)</option>
            <option value="Автономы">Автономы / Независимые</option>
            <option value="Инконню">Инконню (Inconnu)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-zinc-500 uppercase tracking-widest text-[10px] font-semibold font-serif">Убежище:</label>
          <input
            type="text"
            value={sheet.info.haven || ''}
            onChange={(e) => onChange({ haven: e.target.value })}
            className="flex-1 bg-transparent border-b border-zinc-850 focus:border-red-600 text-zinc-200 p-0.5 focus:outline-none"
            placeholder="Адрес или описание убежища"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-zinc-500 uppercase tracking-widest text-[10px] font-semibold font-serif">Титул / Ранг:</label>
          <input
            type="text"
            value={sheet.info.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            className="flex-1 bg-transparent border-b border-zinc-850 focus:border-red-600 text-zinc-200 p-0.5 focus:outline-none"
            placeholder="Неонат, Анцилла, Шериф, Примоген..."
          />
        </div>
      </div>
    </section>
  );
};
