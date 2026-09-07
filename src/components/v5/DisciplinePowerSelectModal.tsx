import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../Modal';
import {
  BloodPower,
  getPowersForDiscipline,
} from '../../data/bloodPowers';
import {
  Flame,
  Check,
  Search,
  Trash2,
  Edit3,
  BookOpen,
  ChevronRight,
  Filter,
  Sparkles,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';

interface DisciplinePowerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplineName: string;
  powerIndex: number; // 0 to 4 (Line 1 to 5)
  currentPowerValue: string;
  onSelectPower: (powerName: string) => void;
}

export const DisciplinePowerSelectModal: React.FC<
  DisciplinePowerSelectModalProps
> = ({
  isOpen,
  onClose,
  disciplineName,
  powerIndex,
  currentPowerValue,
  onSelectPower,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [selectedPowerKey, setSelectedPowerKey] = useState<string>('');
  const [customInput, setCustomInput] = useState('');

  // Retrieve powers strictly for the selected discipline from JSON database
  const disciplinePowers: BloodPower[] = useMemo(() => {
    return getPowersForDiscipline(disciplineName);
  }, [disciplineName]);

  // Extract all unique sources available specifically for this discipline
  const availableSources = useMemo(() => {
    const map = new Map<string, { ru: string; en: string }>();
    for (const p of disciplinePowers) {
      for (const s of p.sources) {
        if (!map.has(s.ru)) {
          map.set(s.ru, s);
        }
      }
    }
    return Array.from(map.values());
  }, [disciplinePowers]);

  // Generate a stable key for each power
  const getPowerKey = (p: BloodPower) => `${p.discipline}__${p.level}__${p.name}`;

  // Initialize and synchronize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSourceFilter('all');
      setLevelFilter('all');
      setCustomInput(currentPowerValue || '');

      if (disciplinePowers.length > 0) {
        const normCurrent = (currentPowerValue || '').trim().toLowerCase();
        // Try finding currently selected power
        const exactMatch = disciplinePowers.find(
          (p) => p.name.trim().toLowerCase() === normCurrent
        );

        if (exactMatch) {
          setSelectedPowerKey(getPowerKey(exactMatch));
        } else {
          // Otherwise default to first power of level matching the line or first in list
          const targetLevel = Math.min(5, Math.max(1, powerIndex + 1));
          const levelMatch = disciplinePowers.find((p) => p.level === targetLevel);
          setSelectedPowerKey(getPowerKey(levelMatch || disciplinePowers[0]));
        }
      } else {
        setSelectedPowerKey('');
      }
    }
  }, [isOpen, disciplineName, currentPowerValue, powerIndex, disciplinePowers]);

  // Filter powers based on search, source, and level
  const filteredPowers = useMemo(() => {
    let list = disciplinePowers;

    // Filter by level
    if (levelFilter !== 'all') {
      list = list.filter((p) => p.level === levelFilter);
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      list = list.filter((p) => p.sources.some((s) => s.ru === sourceFilter));
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.amalgam && p.amalgam.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.rules.toLowerCase().includes(q) ||
          p.sources.some(
            (s) => s.ru.toLowerCase().includes(q) || s.en.toLowerCase().includes(q)
          )
      );
    }

    return list;
  }, [disciplinePowers, levelFilter, sourceFilter, searchQuery]);

  // The power currently inspected in the right pane
  const inspectedPower: BloodPower | null = useMemo(() => {
    if (!disciplinePowers.length) return null;
    const found = disciplinePowers.find((p) => getPowerKey(p) === selectedPowerKey);
    return found || filteredPowers[0] || disciplinePowers[0] || null;
  }, [disciplinePowers, filteredPowers, selectedPowerKey]);

  const handleSelect = (power: BloodPower) => {
    onSelectPower(power.name);
    onClose();
  };

  const handleClear = () => {
    onSelectPower('');
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectPower(customInput.trim());
      onClose();
    }
  };

  // Group filtered powers by level 1-5 for visual separation
  const powersByLevel = useMemo(() => {
    const groups: { [key: number]: BloodPower[] } = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const p of filteredPowers) {
      if (groups[p.level]) {
        groups[p.level].push(p);
      }
    }
    return groups;
  }, [filteredPowers]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      id="vtm-discipline-power-select-modal"
      bodyClassName="p-0 overflow-hidden flex-1 flex flex-col min-h-0 bg-zinc-950"
      title={
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-serif text-lg tracking-wide uppercase font-bold text-red-200">
            Силы крови: {disciplineName || 'Дисциплина'} (Строка #{powerIndex + 1})
          </span>
        </div>
      }
      subtitle={`Выберите способность Vampire: The Masquerade 5-й редакции для дисциплины «${disciplineName || '—'}»`}
    >
      <div className="flex flex-col md:flex-row flex-1 min-h-0 h-[74vh] max-h-[660px] divide-y md:divide-y-0 md:divide-x divide-red-950/40 bg-zinc-950 text-zinc-200 overflow-hidden">
        {/* LEFT COLUMN: List of Powers for Selected Discipline */}
        <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col min-h-0 bg-zinc-950/70 shrink-0 overflow-hidden">
          {/* Search & Filters Header */}
          <div className="p-2.5 sm:p-3 border-b border-zinc-800/80 bg-zinc-900/40 space-y-2 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск способности..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/70 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 font-sans transition-colors"
              />
            </div>

            {/* Filter by Source */}
            {availableSources.length > 1 && (
              <div className="relative flex items-center">
                <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-zinc-900/90 border border-zinc-700/60 rounded text-[11px] text-zinc-300 font-sans focus:outline-none focus:border-red-600 appearance-none cursor-pointer"
                  title="Фильтр по источнику / книге"
                >
                  <option value="all">Все источники ({availableSources.length})</option>
                  {availableSources.map((src) => (
                    <option key={src.ru} value={src.ru}>
                      {src.ru} ({src.en})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Level Quick Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLevelFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-serif transition-colors cursor-pointer ${
                  levelFilter === 'all'
                    ? 'bg-red-800 text-white font-bold shadow-xs shadow-red-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                Все
              </button>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`flex-1 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center justify-center gap-0.5 cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-red-800 text-white font-bold shadow-xs shadow-red-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                  title={`Показать уровень ${lvl}`}
                >
                  {lvl}★
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Powers List */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-2.5 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const powersAtLevel = powersByLevel[lvl];
              if (!powersAtLevel || powersAtLevel.length === 0) return null;

              return (
                <div key={lvl} className="space-y-1.5">
                  {/* Visual Level Divider */}
                  <div className="flex items-center gap-2 pt-1.5 pb-0.5 px-1 select-none">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: lvl }, (_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_3px_rgba(220,38,38,0.8)]"
                        />
                      ))}
                    </div>
                    <span className="font-benguiat uppercase font-bold text-[11px] tracking-wider text-red-400/90">
                      Уровень {lvl}
                    </span>
                    <div className="flex-1 h-px bg-red-950/50" />
                    <span className="font-mono text-[10px] text-zinc-500">
                      {powersAtLevel.length}
                    </span>
                  </div>

                  {/* Power Cards */}
                  {powersAtLevel.map((power) => {
                    const key = getPowerKey(power);
                    const isInspected = inspectedPower && getPowerKey(inspectedPower) === key;
                    const isCurrentOnSheet =
                      currentPowerValue.trim().toLowerCase() === power.name.toLowerCase();

                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedPowerKey(key)}
                        onDoubleClick={() => handleSelect(power)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 group cursor-pointer select-none ${
                          isInspected
                            ? 'bg-red-950/45 border-red-600/80 text-white shadow-md shadow-red-950/50'
                            : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-serif font-bold text-xs sm:text-[13px] leading-tight text-zinc-100 group-hover:text-red-300 transition-colors">
                              {power.name}
                            </span>
                            {isCurrentOnSheet && (
                              <span className="text-[9.5px] uppercase font-sans font-semibold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                                Текущая
                              </span>
                            )}
                          </div>

                          {/* Metadata row */}
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px]">
                            {power.sources[0] && (
                              <span className="font-sans text-zinc-400 bg-zinc-950/60 px-1.5 py-0.2 rounded border border-zinc-800">
                                {power.sources[0].ru}
                              </span>
                            )}
                            {power.amalgam && (
                              <span className="font-sans text-purple-300 bg-purple-950/50 border border-purple-900/50 px-1.5 py-0.2 rounded">
                                Амальгама
                              </span>
                            )}
                            {power.cost && (
                              <span className="font-mono text-amber-400/90 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.2 rounded">
                                {power.cost}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isInspected
                              ? 'text-red-400 translate-x-0.5'
                              : 'text-zinc-600 group-hover:text-zinc-400'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {filteredPowers.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-500 font-sans">
                Способности не найдены по выбранным фильтрам
              </div>
            )}
          </div>

          {/* Count Footer */}
          <div className="px-3 py-1.5 border-t border-zinc-800/80 bg-zinc-950 text-[11px] text-zinc-500 flex items-center justify-between shrink-0 font-sans">
            <span>Доступно сил:</span>
            <span className="font-mono font-bold text-zinc-300">{filteredPowers.length} из {disciplinePowers.length}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Inspected Power Full Details */}
        <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
          {inspectedPower ? (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 custom-scrollbar">
              {/* Header section of details */}
              <div className="pb-3 border-b border-red-900/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-red-100 tracking-wide leading-tight">
                      {inspectedPower.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Level dots & badge */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 border border-red-900/60">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: inspectedPower.level }, (_, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.9)]"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-serif font-bold text-red-200">
                          Уровень {inspectedPower.level}
                        </span>
                      </div>

                      {/* Discipline tag */}
                      <span className="text-xs font-serif text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {inspectedPower.discipline}
                      </span>
                    </div>
                  </div>

                  {/* Quick Select Button on top right */}
                  <button
                    type="button"
                    onClick={() => handleSelect(inspectedPower)}
                    className="px-3.5 py-1.5 rounded text-xs font-serif font-bold uppercase tracking-wider bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-950 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Выбрать
                  </button>
                </div>

                {/* Sources list */}
                {inspectedPower.sources && inspectedPower.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-zinc-500 font-serif text-[11.5px]">
                      {inspectedPower.sources.length > 1 ? 'Источники:' : 'Источник:'}
                    </span>
                    {inspectedPower.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-sans text-[11px] flex items-center gap-1"
                        title={src.en}
                      >
                        <span>{src.ru}</span>
                        {src.en && (
                          <span className="text-zinc-500 font-mono text-[10px]">
                            ({src.en})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Requirement (Требование) if present */}
                {inspectedPower.requirements && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/50 text-amber-200 text-xs font-serif flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mr-1">
                        Требование:
                      </span>
                      <span>{inspectedPower.requirements}</span>
                    </div>
                  </div>
                )}

                {/* Amalgam (Амальгама) if present */}
                {inspectedPower.amalgam && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/50 text-purple-200 text-xs font-serif flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px] mr-1">
                        Амальгама:
                      </span>
                      <span>{inspectedPower.amalgam}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {inspectedPower.description && (
                <div className="space-y-1">
                  <div className="text-[11px] font-benguiat uppercase font-bold text-zinc-400 tracking-wider">
                    Описание
                  </div>
                  <div className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-serif bg-zinc-900/40 p-3 sm:p-3.5 rounded-lg border border-zinc-800/80">
                    {inspectedPower.description}
                  </div>
                </div>
              )}

              {/* Rules (Правила) */}
              {inspectedPower.rules && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-benguiat uppercase font-bold text-red-400 tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-red-500" />
                    <span>Правила применения</span>
                  </div>
                  <div className="text-xs sm:text-[12.5px] text-zinc-200 leading-relaxed font-serif bg-zinc-900/70 p-3 sm:p-3.5 rounded-lg border border-red-950/60 shadow-inner">
                    {inspectedPower.rules}
                  </div>
                </div>
              )}

              {/* Mechanics Key-Value Grid (Расплата, Длительность, Пул) - ONLY non-null */}
              {(inspectedPower.cost || inspectedPower.duration || inspectedPower.pool) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {inspectedPower.cost && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-sans text-zinc-500 font-semibold tracking-wider">
                          Расплата
                        </div>
                        <div className="text-xs font-serif text-amber-300 mt-0.5 font-medium">
                          {inspectedPower.cost}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectedPower.duration && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-sans text-zinc-500 font-semibold tracking-wider">
                          Длительность
                        </div>
                        <div className="text-xs font-serif text-sky-300 mt-0.5 font-medium">
                          {inspectedPower.duration}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectedPower.pool && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-2 sm:col-span-2">
                      <Flame className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-sans text-zinc-500 font-semibold tracking-wider">
                          Пул проверки
                        </div>
                        <div className="text-xs font-serif text-emerald-300 mt-0.5 font-medium">
                          {inspectedPower.pool}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments if any */}
              {inspectedPower.comments && (
                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs font-serif text-zinc-400 italic">
                  <span className="font-sans not-italic font-semibold text-[10px] uppercase text-zinc-500 mr-1">
                    Комментарий:
                  </span>
                  {inspectedPower.comments}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 font-serif">
              <Flame className="w-10 h-10 text-zinc-700 mb-2 stroke-1" />
              <p className="text-sm">
                Выберите способность из списка слева для просмотра полных правил и описания
              </p>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/90 space-y-2.5 shrink-0">
            {/* Custom Input Option */}
            <form onSubmit={handleSaveCustom} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Edit3 className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Или введите произвольное название силы..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 font-serif"
                />
              </div>
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-3 py-1.5 rounded text-xs font-serif font-bold uppercase tracking-wider bg-zinc-800 hover:bg-red-800 text-zinc-200 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                Применить
              </button>
            </form>

            {/* Bottom buttons row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
              {currentPowerValue.trim() ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded text-xs font-serif text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-zinc-700/60 hover:border-red-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Очистить строку силы на листе"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Очистить строку
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded text-xs font-sans text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                {inspectedPower && (
                  <button
                    type="button"
                    onClick={() => handleSelect(inspectedPower)}
                    className="px-4 py-1.5 rounded text-xs font-serif font-bold tracking-wide uppercase bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-950/80 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Выбрать силу
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
