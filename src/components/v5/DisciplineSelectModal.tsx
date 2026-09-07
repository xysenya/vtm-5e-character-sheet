import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../Modal';
import { V5_DISCIPLINES, V5DisciplineDefinition } from '../../data/v5Disciplines';
import { ClanId } from '../../types';
import { CLAN_THEMES } from '../../data/clans';
import { ClanSymbol } from '../ClanSymbol';
import {
  Sparkles,
  Check,
  ChevronRight,
  Search,
  Flame,
  Droplet,
  Trash2,
  Filter,
  RotateCcw,
} from 'lucide-react';

interface DisciplineSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisciplineName?: string;
  slotIndex: number;
  characterClan?: ClanId | string;
  onSelectDiscipline: (disciplineName: string, disciplineId?: string) => void;
  onClearDiscipline?: () => void;
}

export interface ClanFilterOption {
  id: ClanId;
  name: string;
  nameEn: string;
  accentColor: string;
  matchingKeywords: string[];
}

export const CLAN_FILTER_OPTIONS: ClanFilterOption[] = [
  {
    id: 'brujah',
    name: 'Бруха',
    nameEn: 'Brujah',
    accentColor: CLAN_THEMES.brujah.accentColor, // #dc2626
    matchingKeywords: ['Бруха', 'Brujah'],
  },
  {
    id: 'ventrue',
    name: 'Вентру',
    nameEn: 'Ventrue',
    accentColor: CLAN_THEMES.ventrue.accentColor, // #3b82f6
    matchingKeywords: ['Вентру', 'Ventrue'],
  },
  {
    id: 'toreador',
    name: 'Тореадор',
    nameEn: 'Toreador',
    accentColor: CLAN_THEMES.toreador.accentColor, // #ec4899
    matchingKeywords: ['Тореадор', 'Toreador'],
  },
  {
    id: 'tremere',
    name: 'Тремер',
    nameEn: 'Tremere',
    accentColor: CLAN_THEMES.tremere.accentColor, // #9333ea
    matchingKeywords: ['Тремер', 'Tremere'],
  },
  {
    id: 'malkavian',
    name: 'Малкавиан',
    nameEn: 'Malkavian',
    accentColor: CLAN_THEMES.malkavian.accentColor, // #a855f7
    matchingKeywords: ['Малкавиан', 'Malkavian'],
  },
  {
    id: 'nosferatu',
    name: 'Носферату',
    nameEn: 'Nosferatu',
    accentColor: CLAN_THEMES.nosferatu.accentColor, // #65a30d
    matchingKeywords: ['Носферату', 'Nosferatu'],
  },
  {
    id: 'gangrel',
    name: 'Гангрел',
    nameEn: 'Gangrel',
    accentColor: CLAN_THEMES.gangrel.accentColor, // #d97706
    matchingKeywords: ['Гангрел', 'Gangrel'],
  },
  {
    id: 'lasombra',
    name: 'Ласомбра',
    nameEn: 'Lasombra',
    accentColor: CLAN_THEMES.lasombra.accentColor, // #475569
    matchingKeywords: ['Ласомбра', 'Lasombra'],
  },
  {
    id: 'tzimisce',
    name: 'Цимисхи',
    nameEn: 'Tzimisce',
    accentColor: CLAN_THEMES.tzimisce.accentColor, // #e11d48
    matchingKeywords: ['Цимисхи', 'Tzimisce'],
  },
  {
    id: 'giovanni',
    name: 'Хеката',
    nameEn: 'Hecata',
    accentColor: CLAN_THEMES.giovanni.accentColor, // #10b981
    matchingKeywords: ['Хеката', 'Джованни', 'Hecata', 'Giovanni'],
  },
  {
    id: 'ravnos',
    name: 'Равнос',
    nameEn: 'Ravnos',
    accentColor: CLAN_THEMES.ravnos.accentColor, // #f59e0b
    matchingKeywords: ['Равнос', 'Ravnos'],
  },
  {
    id: 'setite',
    name: 'Министерство',
    nameEn: 'The Ministry',
    accentColor: CLAN_THEMES.setite.accentColor, // #ca8a04
    matchingKeywords: ['Министерство', 'Сет', 'Ministry', 'Setite'],
  },
  {
    id: 'assamite',
    name: 'Бану Хаким',
    nameEn: 'Banu Haqim',
    accentColor: CLAN_THEMES.assamite.accentColor, // #b91c1c
    matchingKeywords: ['Бану Хаким', 'Ассамиты', 'Banu Haqim', 'Assamite'],
  },
  {
    id: 'salubri',
    name: 'Салюбри',
    nameEn: 'Salubri',
    accentColor: CLAN_THEMES.salubri.accentColor, // #06b6d4
    matchingKeywords: ['Салюбри', 'Salubri'],
  },
  {
    id: 'caitiff',
    name: 'Слабокровные',
    nameEn: 'Thin-Bloods',
    accentColor: CLAN_THEMES.caitiff.accentColor, // #78716c
    matchingKeywords: ['Слабокровные', 'Каитифы', 'Thin-blood', 'Caitiff'],
  },
];

export const getClanColorByName = (clanName: string): string => {
  const norm = clanName.toLowerCase();
  if (norm.includes('бруха') || norm.includes('brujah')) return CLAN_THEMES.brujah.accentColor;
  if (norm.includes('вентру') || norm.includes('ventrue')) return CLAN_THEMES.ventrue.accentColor;
  if (norm.includes('тореадор') || norm.includes('toreador')) return CLAN_THEMES.toreador.accentColor;
  if (norm.includes('тремер') || norm.includes('tremere')) return CLAN_THEMES.tremere.accentColor;
  if (norm.includes('малкавиан') || norm.includes('malkav')) return CLAN_THEMES.malkavian.accentColor;
  if (norm.includes('носферату') || norm.includes('nosferatu')) return CLAN_THEMES.nosferatu.accentColor;
  if (norm.includes('гангрел') || norm.includes('gangrel')) return CLAN_THEMES.gangrel.accentColor;
  if (norm.includes('ласомбра') || norm.includes('lasombra')) return CLAN_THEMES.lasombra.accentColor;
  if (norm.includes('цимисх') || norm.includes('tzimisce')) return CLAN_THEMES.tzimisce.accentColor;
  if (norm.includes('хеката') || norm.includes('джованни') || norm.includes('hecata')) return CLAN_THEMES.giovanni.accentColor;
  if (norm.includes('равнос') || norm.includes('ravnos')) return CLAN_THEMES.ravnos.accentColor;
  if (norm.includes('министерство') || norm.includes('сет') || norm.includes('ministry')) return CLAN_THEMES.setite.accentColor;
  if (norm.includes('хаким') || norm.includes('ассамит') || norm.includes('assamite')) return CLAN_THEMES.assamite.accentColor;
  if (norm.includes('салюбри') || norm.includes('salubri')) return CLAN_THEMES.salubri.accentColor;
  if (norm.includes('слабокровн') || norm.includes('каитиф') || norm.includes('thin')) return CLAN_THEMES.caitiff.accentColor;
  return '#dc2626';
};

export const DisciplineSelectModal: React.FC<DisciplineSelectModalProps> = ({
  isOpen,
  onClose,
  currentDisciplineName = '',
  slotIndex,
  characterClan,
  onSelectDiscipline,
  onClearDiscipline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledClanIds, setEnabledClanIds] = useState<string[]>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    V5_DISCIPLINES[0].id
  );

  // Match current discipline name to an id when opened & reset filters
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setEnabledClanIds([]);
      const normalizedCurrent = currentDisciplineName.trim().toLowerCase();

      // Find matching discipline by Russian name or English name
      const found = V5_DISCIPLINES.find(
        (d) =>
          d.name.toLowerCase() === normalizedCurrent ||
          d.nameEn.toLowerCase() === normalizedCurrent ||
          normalizedCurrent.includes(d.name.toLowerCase()) ||
          d.name.toLowerCase().includes(normalizedCurrent)
      );

      if (found) {
        setSelectedDisciplineId(found.id);
      } else {
        setSelectedDisciplineId(V5_DISCIPLINES[0].id);
      }
    }
  }, [isOpen, currentDisciplineName]);

  // Toggle clan filter on/off
  const handleToggleClan = (clanId: string) => {
    setEnabledClanIds((prev) => {
      if (prev.includes(clanId)) {
        return prev.filter((id) => id !== clanId);
      } else {
        return [...prev, clanId];
      }
    });
  };

  // Clear all clan filters
  const handleClearClanFilters = () => {
    setEnabledClanIds([]);
  };

  // Filter disciplines by both enabled clans and search query
  const filteredDisciplines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return V5_DISCIPLINES.filter((d) => {
      // 1. Clan filter: If any clans are enabled, discipline must belong to at least one of them
      if (enabledClanIds.length > 0) {
        const matchesClan = enabledClanIds.some((clanId) => {
          const option = CLAN_FILTER_OPTIONS.find((c) => c.id === clanId);
          const matchers = option ? option.matchingKeywords : [clanId];
          return d.clans.some((clanName) =>
            matchers.some(
              (m) =>
                clanName.toLowerCase().includes(m.toLowerCase()) ||
                m.toLowerCase().includes(clanName.toLowerCase())
            )
          );
        });
        if (!matchesClan) return false;
      }

      // 2. Search query filter
      if (q) {
        const matchesQuery =
          d.name.toLowerCase().includes(q) ||
          d.nameEn.toLowerCase().includes(q) ||
          d.clans.some((c) => c.toLowerCase().includes(q)) ||
          d.powers.some((p) => p.name.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [searchQuery, enabledClanIds]);

  // Automatically keep selectedDisciplineId pointing to a visible discipline
  useEffect(() => {
    if (filteredDisciplines.length > 0) {
      const isStillVisible = filteredDisciplines.some(
        (d) => d.id === selectedDisciplineId
      );
      if (!isStillVisible) {
        setSelectedDisciplineId(filteredDisciplines[0].id);
      }
    }
  }, [filteredDisciplines, selectedDisciplineId]);

  const inspectedDiscipline: V5DisciplineDefinition = useMemo(() => {
    return (
      V5_DISCIPLINES.find((d) => d.id === selectedDisciplineId) ||
      filteredDisciplines[0] ||
      V5_DISCIPLINES[0]
    );
  }, [selectedDisciplineId, filteredDisciplines]);

  const handleSelect = (discipline: V5DisciplineDefinition) => {
    onSelectDiscipline(discipline.name, discipline.id);
    onClose();
  };

  const handleClear = () => {
    if (onClearDiscipline) {
      onClearDiscipline();
    } else {
      onSelectDiscipline('');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      id="vtm-discipline-select-modal"
      bodyClassName="p-0 overflow-hidden flex-1 flex flex-col min-h-0 bg-zinc-950"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />
          <span className="font-serif text-lg tracking-wide uppercase font-bold text-red-200">
            Выбор дисциплины (Слот #{slotIndex + 1})
          </span>
        </div>
      }
      subtitle="Выберите одну из 12 официальных дисциплин Vampire: The Masquerade 5-й редакции"
    >
      {/* TOP BAR: CLAN FILTER BADGES */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-zinc-950/95 border-b border-zinc-800/80 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-serif font-bold uppercase tracking-wider text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-red-500" />
              Фильтр по кланам:
            </span>
            {enabledClanIds.length > 0 ? (
              <span className="text-[10.5px] font-sans px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/50 text-red-300 font-medium">
                выбрано кланов: {enabledClanIds.length} (дисциплин: {filteredDisciplines.length})
              </span>
            ) : (
              <span className="text-[10.5px] font-sans text-zinc-500 hidden sm:inline">
                отображаются все 12 дисциплин
              </span>
            )}
          </div>

          {enabledClanIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearClanFilters}
              className="text-[11px] font-sans text-zinc-400 hover:text-red-400 flex items-center gap-1 py-0.5 px-2 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
              title="Сбросить все клановые фильтры"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Показать все</span>
            </button>
          )}
        </div>

        {/* Clan badges row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar md:flex-wrap">
          {/* "Все" chip */}
          <button
            type="button"
            onClick={handleClearClanFilters}
            className={`h-7 px-2.5 rounded-md text-xs font-serif transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border select-none ${
              enabledClanIds.length === 0
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm font-bold'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <Sparkles
              className={`w-3 h-3 ${
                enabledClanIds.length === 0 ? 'text-amber-400' : 'text-zinc-500'
              }`}
            />
            <span>Все кланы</span>
          </button>

          {/* Clan chips */}
          {CLAN_FILTER_OPTIONS.map((clan) => {
            const isEnabled = enabledClanIds.includes(clan.id);
            const isCharacterClan = characterClan === clan.id;

            return (
              <button
                key={clan.id}
                type="button"
                id={`discipline-filter-clan-${clan.id}`}
                onClick={() => handleToggleClan(clan.id)}
                title={
                  isEnabled
                    ? `${clan.name}: включен (нажмите, чтобы отключить)`
                    : `${clan.name}: нажать для фильтрации по клану${
                        isCharacterClan ? ' (Клан персонажа)' : ''
                      }`
                }
                style={{
                  borderColor: isEnabled ? clan.accentColor : `${clan.accentColor}35`,
                  backgroundColor: isEnabled ? `${clan.accentColor}24` : undefined,
                  boxShadow: isEnabled ? `0 0 10px ${clan.accentColor}35` : undefined,
                }}
                className={`h-7 px-2.5 rounded-md text-xs font-serif transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border group select-none ${
                  isEnabled
                    ? 'font-bold'
                    : 'bg-zinc-900/70 hover:bg-zinc-800/80 text-zinc-300 hover:text-white'
                }`}
              >
                <ClanSymbol
                  clan={clan.id}
                  color={clan.accentColor}
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isEnabled
                      ? 'scale-110'
                      : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                />
                <span
                  style={{
                    color: isEnabled ? clan.accentColor : undefined,
                  }}
                >
                  {clan.name}
                </span>

                {/* Active checkmark */}
                {isEnabled && (
                  <Check
                    className="w-3 h-3 shrink-0 stroke-[2.5]"
                    style={{ color: clan.accentColor }}
                  />
                )}

                {/* Star / indicator for current character clan */}
                {isCharacterClan && !isEnabled && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                    style={{ backgroundColor: clan.accentColor }}
                    title="Клан вашего персонажа"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMNS BODY */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 h-[66vh] max-h-[600px] divide-y md:divide-y-0 md:divide-x divide-red-950/40 bg-zinc-950 text-zinc-200 overflow-hidden">
        {/* LEFT COLUMN: List of Disciplines with Search */}
        <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col min-h-0 bg-zinc-950/70 shrink-0 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск дисциплины или силы..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/70 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 font-sans transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-1.5 custom-scrollbar">
            {filteredDisciplines.map((disc) => {
              const isSelected = disc.id === selectedDisciplineId;
              const isCurrent =
                currentDisciplineName.trim().toLowerCase() ===
                disc.name.toLowerCase();

              return (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => setSelectedDisciplineId(disc.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/40 border-red-600/80 text-white shadow-md shadow-red-950/50'
                      : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm leading-tight text-zinc-100 group-hover:text-red-300 transition-colors">
                        {disc.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-sans font-semibold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                          Текущая
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-zinc-400 italic">
                        {disc.nameEn}
                      </span>
                    </div>

                    {/* Clan tags for this discipline */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {disc.clans.map((clanName) => {
                        const clanColor = getClanColorByName(clanName);
                        const isMatchingEnabled = enabledClanIds.some((cId) => {
                          const opt = CLAN_FILTER_OPTIONS.find((c) => c.id === cId);
                          return opt?.matchingKeywords.some((k) =>
                            clanName.toLowerCase().includes(k.toLowerCase())
                          );
                        });

                        return (
                          <span
                            key={clanName}
                            style={{
                              borderColor: `${clanColor}55`,
                              color: isMatchingEnabled ? '#ffffff' : `${clanColor}ee`,
                              backgroundColor: isMatchingEnabled
                                ? `${clanColor}35`
                                : `${clanColor}15`,
                            }}
                            className={`text-[9.5px] px-1.5 py-0.2 rounded border font-sans leading-tight ${
                              isMatchingEnabled ? 'font-bold ring-1 ring-white/30' : ''
                            }`}
                          >
                            {clanName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-red-400 translate-x-0.5'
                        : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}

            {filteredDisciplines.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-500 font-sans space-y-2">
                <div>Нет дисциплин, соответствующих выбранным фильтрам.</div>
                {enabledClanIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearClanFilters}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-600 transition-colors text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Сбросить клановые фильтры</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Discipline Details and Powers List */}
        <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 custom-scrollbar">
            {/* Header of details */}
            <div className="pb-3 border-b border-red-900/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-red-100 tracking-wide">
                    {inspectedDiscipline.name}
                  </h3>
                  <div className="font-mono text-xs text-red-400/90 font-medium">
                    {inspectedDiscipline.nameEn}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-sans text-zinc-400">
                    Сил в базе:
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-200 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {inspectedDiscipline.powers.length}
                  </span>
                </div>
              </div>

              {/* Clans Tags with Clan Colors */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-serif text-[11.5px]">
                  Клановая дисциплина:
                </span>
                {inspectedDiscipline.clans.map((clan) => {
                  const clanColor = getClanColorByName(clan);
                  return (
                    <span
                      key={clan}
                      style={{
                        borderColor: `${clanColor}66`,
                        backgroundColor: `${clanColor}18`,
                        color: clanColor,
                      }}
                      className="px-2 py-0.5 rounded border font-sans text-[11px] font-medium"
                    >
                      {clan}
                    </span>
                  );
                })}
              </div>

              {/* Resonance */}
              {inspectedDiscipline.resonance && (
                <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-zinc-500 font-medium">Резонанс:</span>
                  <span className="text-zinc-300">
                    {inspectedDiscipline.resonance}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="mt-3 text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-serif bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
                {inspectedDiscipline.description}
              </p>
            </div>

            {/* Powers list */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Flame className="w-4 h-4 text-red-500" />
                <h4 className="font-serif font-bold text-sm tracking-wide text-zinc-100 uppercase">
                  Силы крови дисциплины
                </h4>
              </div>

              <div className="space-y-2.5">
                {inspectedDiscipline.powers.map((power) => (
                  <div
                    key={power.id}
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        {/* Power level dots */}
                        <div
                          className="flex items-center gap-1 shrink-0 px-1.5 py-1 rounded bg-red-950/70 border border-red-900/50"
                          title={`Уровень силы: ${power.level}`}
                          aria-label={`Уровень ${power.level}`}
                        >
                          {Array.from({ length: power.level }, (_, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.85)]"
                            />
                          ))}
                        </div>
                        <span className="font-serif font-bold text-sm text-zinc-100">
                          {power.name}
                        </span>
                      </div>
                      {power.cost && (
                        <span className="text-[10.5px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded">
                          {power.cost}
                        </span>
                      )}
                    </div>

                    {power.pool && (
                      <div className="text-[11px] font-sans text-zinc-400 mb-1">
                        <span className="text-zinc-500">Проверка: </span>
                        {power.pool}
                      </div>
                    )}

                    <p className="text-xs text-zinc-300 leading-relaxed font-serif">
                      {power.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-2 shrink-0">
            {currentDisciplineName.trim() ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded text-xs font-serif text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-zinc-700/60 hover:border-red-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Очистить слот дисциплины"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить слот
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded text-xs font-sans text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleSelect(inspectedDiscipline)}
                className="px-4 py-2 rounded text-xs font-serif font-bold tracking-wide uppercase bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-950/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Выбрать дисциплину
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
