import React from 'react';
import { Modal } from './Modal';
import { CharacterSheet, TraitItem } from '../types';
import { CLAN_THEMES } from '../data/clans';
import { ClanSymbol } from './ClanSymbol';
import { FileCheck, AlertTriangle, Shield, Zap, Sparkles } from 'lucide-react';

export interface CharacterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (character: CharacterSheet) => void;
  character: CharacterSheet | null;
  sourceType?: 'file' | 'text';
}

export const CharacterImportModal: React.FC<CharacterImportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  character,
  sourceType = 'file',
}) => {
  if (!isOpen || !character) return null;

  const clanTheme = CLAN_THEMES[character.info.clan] || CLAN_THEMES['brujah'];
  const clanName =
    character.info.clan === 'custom' && character.info.customClanName
      ? character.info.customClanName
      : `${clanTheme.name} (${clanTheme.nameEn})`;

  const activeDisciplines = (character.v5Disciplines || []).filter((d) => d.name && d.dots > 0);
  const activeMerits = (character.v5Merits || []).filter((m) => m.name && m.dots > 0);
  const activeFlaws = (character.v5Flaws || []).filter((f) => f.name && f.dots > 0);

  const physList = Object.values(character.attributes.physical) as TraitItem[];
  const socList = Object.values(character.attributes.social) as TraitItem[];
  const menList = Object.values(character.attributes.mental) as TraitItem[];

  const topPhysical = physList.sort((a, b) => b.value - a.value)[0];
  const topSocial = socList.sort((a, b) => b.value - a.value)[0];
  const topMental = menList.sort((a, b) => b.value - a.value)[0];

  return (
    <Modal
      id="vtm-character-import-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-500" />
          Подтверждение импорта персонажа
        </span>
      }
      subtitle={
        sourceType === 'file'
          ? 'Проверьте краткие сведения о персонаже из загруженного JSON-файла'
          : 'Проверьте краткие сведения о персонаже из введенного JSON-массива'
      }
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Character Card Preview */}
        <div className="bg-[#0e0e11] border border-red-900/30 rounded-xl p-4 space-y-3.5 shadow-inner">
          {/* Header Row: Clan symbol, name, generation */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-zinc-800">
            <div
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center p-1.5 shadow-lg shrink-0"
              style={{
                borderColor: clanTheme.accentColor,
                backgroundColor: clanTheme.accentBg,
                color: clanTheme.accentColor,
              }}
            >
              <ClanSymbol
                clan={character.info.clan}
                generation={character.info.generation}
                className="w-8 h-8 object-contain"
                color={clanTheme.accentColor}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold font-serif text-white truncate">
                  {character.info.name || 'Безымянный персонаж'}
                </h3>
                <span
                  className="text-[10px] uppercase font-bold font-serif px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: clanTheme.accentColor,
                    backgroundColor: clanTheme.accentBg,
                    color: clanTheme.accentColor,
                  }}
                >
                  {clanName}
                </span>
              </div>
              <p className="text-xs text-red-500 font-serif font-bold mt-0.5">
                Поколение: {character.info.generation}-е • Концепт: {character.info.concept || 'Не указан'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-serif">
            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Игрок / Хроника:
              </span>
              <p className="text-zinc-200 truncate mt-0.5">
                {character.info.player || '—'} / {character.info.chronicle || '—'}
              </p>
            </div>

            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Тип хищника:
              </span>
              <p className="text-zinc-200 truncate mt-0.5">
                {character.info.predatorType || 'Не указан'}
              </p>
            </div>

            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Сир:
              </span>
              <p className="text-zinc-200 truncate mt-0.5">
                {character.info.sire || 'Не указан'}
              </p>
            </div>

            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Амбиция / Желание:
              </span>
              <p className="text-zinc-200 truncate mt-0.5">
                {character.info.ambition || '—'} / {character.info.desire || '—'}
              </p>
            </div>

            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Дисциплины ({activeDisciplines.length}):
              </span>
              <p className="text-red-400 truncate mt-0.5">
                {activeDisciplines.length > 0
                  ? activeDisciplines.map((d) => `${d.name} (${d.dots})`).join(', ')
                  : 'Нет активных'}
              </p>
            </div>

            <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-sans">
                Преимущества / Изъяны:
              </span>
              <p className="text-zinc-300 truncate mt-0.5">
                {activeMerits.length} дост. / {activeFlaws.length} недост.
              </p>
            </div>
          </div>

          {/* Key Traits highlight */}
          <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-850 flex items-center justify-between text-xs font-serif text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Ключевые черты:
            </span>
            <span className="text-zinc-200">
              {topPhysical?.name} ({topPhysical?.value}) • {topSocial?.name} ({topSocial?.value}) • {topMental?.name} ({topMental?.value})
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3 bg-amber-950/30 border border-amber-900/60 rounded-xl text-xs font-serif text-amber-200/90 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Внимание:</strong> импорт полностью заменит текущие данные персонажа в бланке.
            Если вам нужны текущие данные, сохраните их предварительно через кнопку «Экспорт JSON».
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            id="btn-confirm-import-character"
            onClick={() => {
              onConfirm(character);
              onClose();
            }}
            className="px-5 py-2.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-100 font-serif font-bold text-xs rounded-lg shadow-lg cursor-pointer flex items-center gap-2 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-emerald-300" />
            Импортировать персонажа
          </button>
        </div>
      </div>
    </Modal>
  );
};
