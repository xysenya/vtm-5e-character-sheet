import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../Modal';
import {
  AdvantageItem,
  AdvantageGroup,
  ALL_ADVANTAGES,
  ADVANTAGE_CATEGORIES,
  renderPointsDots,
  formatPointsLabel,
  getDefaultDots,
  getAvailableSources,
} from '../../data/advantages';
import {
  getCustomAdvantages,
  CUSTOM_ADVANTAGES_CHANGED_EVENT,
} from '../../data/customAdvantages';
import { AdvantageDetailModal } from './AdvantageDetailModal';
import {
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Info,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Compass,
  Users,
  Scroll,
  BookOpen,
  Trash2,
  ShieldAlert,
  PlusCircle,
  Edit3,
  Eye,
} from 'lucide-react';
import { V5AdvantageItem } from '../../types';

export interface MeritFlawSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKind?: 'advantage' | 'disadvantage';
  slotIndex?: number | null;
  currentValue?: string;
  currentMerits?: Array<{ name: string; dots: number }>;
  currentFlaws?: Array<{ name: string; dots: number }>;
  onSelectAdvantage: (item: AdvantageItem, defaultDots: number, slotIndex?: number | null) => void;
  onRemoveAdvantage?: (item: AdvantageItem, slotIndex?: number | null) => void;
}

type InspectedTarget =
  | { type: 'item'; item: AdvantageItem }
  | { type: 'group'; group: AdvantageGroup }
  | { type: 'category'; categoryId: string };

export const MeritFlawSelectModal: React.FC<MeritFlawSelectModalProps> = ({
  isOpen,
  onClose,
  initialKind = 'advantage',
  slotIndex = null,
  currentValue = '',
  currentMerits = [],
  currentFlaws = [],
  onSelectAdvantage,
  onRemoveAdvantage,
}) => {
  // Independent Selection Mode strictly based on `kind`: "advantage" vs "disadvantage"
  const [activeKind, setActiveKind] = useState<'advantage' | 'disadvantage'>(initialKind);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Category navigation state (character, biography, coterie, history, custom)
  const [activeCategory, setActiveCategory] = useState<
    'character' | 'biography' | 'coterie' | 'history' | 'custom'
  >('character');

  // Custom items loaded from localStorage
  const [customItems, setCustomItems] = useState<AdvantageItem[]>(() => getCustomAdvantages());

  useEffect(() => {
    const handleStorageChange = () => {
      setCustomItems(getCustomAdvantages());
    };
    window.addEventListener(CUSTOM_ADVANTAGES_CHANGED_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(CUSTOM_ADVANTAGES_CHANGED_EVENT, handleStorageChange);
    };
  }, []);

  // Combined official + custom catalog
  const allCatalogItems = useMemo(() => {
    return [...ALL_ADVANTAGES, ...customItems];
  }, [customItems]);

  // Selected item (clicked for inspection and confirmation)
  const [selectedItem, setSelectedItem] = useState<AdvantageItem | null>(null);

  // Inspected target in right pane: persists even when cursor moves away!
  const [inspectedTarget, setInspectedTarget] = useState<InspectedTarget | null>(null);

  // Accordion open/close state map
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Creation / edit modal state for custom advantages
  const [createModalConfig, setCreateModalConfig] = useState<{
    isOpen: boolean;
    customItemId?: string;
    initialKind: 'advantage' | 'disadvantage';
    initialName: string;
  }>({
    isOpen: false,
    initialKind: 'advantage',
    initialName: '',
  });

  // Reset and initialize when modal opens or initialKind changes
  useEffect(() => {
    if (isOpen) {
      setActiveKind(initialKind);
      setSearchQuery('');
      setSourceFilter('all');
      setActiveCategory('character');

      // Try pre-selecting the current item on sheet if present
      if (currentValue && currentValue.trim()) {
        const norm = currentValue.trim().toLowerCase();
        const found = allCatalogItems.find(
          (i) => i.kind === initialKind && i.name.trim().toLowerCase() === norm
        );
        if (found) {
          setSelectedItem(found);
          setInspectedTarget({ type: 'item', item: found });
          setActiveCategory(found.category_id);
          return;
        }
      }

      const first = allCatalogItems.find(
        (i) => i.kind === initialKind && i.category_id === 'character'
      );
      if (first) {
        setSelectedItem(first);
        setInspectedTarget({ type: 'item', item: first });
      } else {
        setSelectedItem(null);
        setInspectedTarget({ type: 'category', categoryId: 'character' });
      }
    }
  }, [isOpen, initialKind, currentValue, allCatalogItems]);

  // 1. Strict Filter by `kind` - never mix Advantages and Disadvantages
  const kindItems = useMemo(() => {
    return allCatalogItems.filter((i) => i.kind === activeKind);
  }, [allCatalogItems, activeKind]);

  // 2. Dynamic Source List derived exclusively from the current kind's items
  const availableSources = useMemo(() => {
    return getAvailableSources(kindItems);
  }, [kindItems]);

  // Reset source filter if it no longer exists in available sources
  useEffect(() => {
    if (sourceFilter !== 'all' && !availableSources.some((s) => s.ru === sourceFilter)) {
      setSourceFilter('all');
    }
  }, [availableSources, sourceFilter]);

  // Is any filter currently active beyond just the kind tab?
  const isFilterActive = sourceFilter !== 'all' || searchQuery.trim().length > 0;

  // 3. Filter items of current kind by active Source and Search Query (across ALL categories)
  const allFilteredKindItems = useMemo(() => {
    let list = kindItems;

    // Filter by Source
    if (sourceFilter !== 'all') {
      list = list.filter((i) => i.sources.some((s) => s.ru === sourceFilter));
    }

    // Filter by Name (case-insensitive substring match)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sources.some(
            (s) => s.ru.toLowerCase().includes(q) || s.en.toLowerCase().includes(q)
          )
      );
    }

    return list;
  }, [kindItems, sourceFilter, searchQuery]);

  // 4. Filter by Category -> derived from allFilteredKindItems
  const filteredItems = useMemo(() => {
    return allFilteredKindItems.filter((i) => i.category_id === activeCategory);
  }, [allFilteredKindItems, activeCategory]);

  // 4. Group remaining items into Accordions by SECTION (раздел, например «Анахронизм», «Внешность»)
  const groups: AdvantageGroup[] = useMemo(() => {
    const map = new Map<
      string,
      {
        desc?: string | null;
        req?: string | null;
        items: AdvantageItem[];
      }
    >();

    for (const item of filteredItems) {
      const sectionName = item.section || item.category || 'Прочие';
      if (!map.has(sectionName)) {
        map.set(sectionName, {
          desc: item.section_description,
          req: item.section_requirement,
          items: [],
        });
      }
      map.get(sectionName)!.items.push(item);
    }

    const sortedEntries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ru'));

    return sortedEntries.map(([title, data]) => ({
      id: title,
      title,
      description:
        data.desc ||
        `Раздел «${title}». Содержит ${data.items.length} ${
          data.items.length === 1 ? 'позицию' : data.items.length < 5 ? 'позиции' : 'позиций'
        } для выбора.`,
      requirement: data.req || undefined,
      items: data.items,
    }));
  }, [filteredItems]);

  // Expand all groups automatically when searching, or expand first group by default
  const isSearching = searchQuery.trim().length > 0;
  const isGroupExpanded = (groupId: string): boolean => {
    if (isSearching) return true;
    if (expandedGroups[groupId] !== undefined) return expandedGroups[groupId];
    return true; // default open
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !isGroupExpanded(groupId),
    }));
  };

  // Check if an item is already on the character sheet
  const isItemOnSheet = (item: AdvantageItem): boolean => {
    const targetList = item.kind === 'advantage' ? currentMerits : currentFlaws;
    const normName = item.name.trim().toLowerCase();
    return targetList.some((entry) => entry.name.trim().toLowerCase() === normName);
  };

  // Handler for item selection
  const handleConfirmSelect = (item: AdvantageItem) => {
    const dots = getDefaultDots(item.points);
    onSelectAdvantage(item, dots, slotIndex);
    onClose();
  };

  const handleRemove = (item: AdvantageItem) => {
    if (onRemoveAdvantage) {
      onRemoveAdvantage(item, slotIndex);
    }
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'character':
        return <User className="w-3.5 h-3.5" />;
      case 'biography':
        return <Compass className="w-3.5 h-3.5" />;
      case 'coterie':
        return <Users className="w-3.5 h-3.5" />;
      case 'history':
        return <Scroll className="w-3.5 h-3.5" />;
      case 'custom':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        id="vtm-merit-flaw-select-modal"
        bodyClassName="p-0 overflow-hidden flex-1 flex flex-col min-h-0 bg-[#0c0c0e]"
        containerClassName="h-[88vh] max-h-[840px]"
        title={
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-serif font-bold text-base sm:text-lg text-zinc-100">
              {activeKind === 'advantage' ? 'Выбор Достоинств' : 'Выбор Недостатков'}
            </span>
            {slotIndex !== null && (
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                Слот #{slotIndex + 1}
              </span>
            )}
          </div>
        }
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col flex-1 min-h-0 h-full bg-[#0c0c0e] text-zinc-200 overflow-hidden">
          {/* =========================================================================
              1. TOP BAR: MODE SWITCHER, SEARCH, AND DYNAMIC SOURCE FILTER
             ========================================================================= */}
          <div className="p-3 sm:p-4 border-b border-red-950/40 bg-zinc-950/80 shrink-0 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Two Independent Modes: Advantages vs Disadvantages */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveKind('advantage');
                    const first =
                      allCatalogItems.find(
                        (i) => i.kind === 'advantage' && i.category_id === activeCategory
                      ) || allCatalogItems.find((i) => i.kind === 'advantage');
                    if (first) {
                      setSelectedItem(first);
                      setInspectedTarget({ type: 'item', item: first });
                    } else {
                      setSelectedItem(null);
                      setInspectedTarget({ type: 'category', categoryId: activeCategory });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeKind === 'advantage'
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Достоинства</span>
                  <span className="text-[10px] opacity-70 font-mono">
                    ({allCatalogItems.filter((i) => i.kind === 'advantage').length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveKind('disadvantage');
                    const first =
                      allCatalogItems.find(
                        (i) => i.kind === 'disadvantage' && i.category_id === activeCategory
                      ) || allCatalogItems.find((i) => i.kind === 'disadvantage');
                    if (first) {
                      setSelectedItem(first);
                      setInspectedTarget({ type: 'item', item: first });
                    } else {
                      setSelectedItem(null);
                      setInspectedTarget({ type: 'category', categoryId: activeCategory });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeKind === 'disadvantage'
                      ? 'bg-red-950/90 text-red-300 border border-red-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Недостатки</span>
                  <span className="text-[10px] opacity-70 font-mono">
                    ({allCatalogItems.filter((i) => i.kind === 'disadvantage').length})
                  </span>
                </button>
              </div>

              {/* Search Input and Dynamic Source Dropdown */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {/* Search by Name */}
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Поиск ${activeKind === 'advantage' ? 'достоинства' : 'недостатка'} по названию...`}
                    className="w-full pl-8 pr-7 py-1.5 bg-zinc-900/90 border border-zinc-750 rounded-lg text-xs sm:text-[13px] text-zinc-100 placeholder:text-zinc-500 font-sans focus:outline-none focus:border-red-600 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 text-xs p-0.5 cursor-pointer"
                      title="Очистить поиск"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dynamic Source Filter */}
                <div className="relative shrink-0 w-44 sm:w-52">
                  <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-zinc-900/90 border border-zinc-750 rounded-lg text-xs text-zinc-200 font-sans focus:outline-none focus:border-red-600 appearance-none cursor-pointer truncate"
                    title="Фильтр по источнику"
                  >
                    <option value="all">Все источники ({availableSources.length})</option>
                    {availableSources.map((src) => (
                      <option key={src.ru} value={src.ru}>
                        {src.ru}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              2. MAIN TWO-PANE INTERFACE (LEFT: CATEGORIES & ACCORDIONS; RIGHT: INFO)
             ========================================================================= */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* -----------------------------------------------------------------------
                LEFT HALF: Category Navigation + Accordions of selectable items
               ----------------------------------------------------------------------- */}
            <div className="w-full lg:w-[56%] flex flex-col min-h-0 h-[52%] lg:h-full border-b lg:border-b-0 lg:border-r border-red-950/40 overflow-hidden">
              {/* Upper part of Left Half: Category Navigation Buttons (5 categories) */}
              <div className="p-2 sm:p-2.5 bg-zinc-950/60 border-b border-zinc-800/80 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                  {ADVANTAGE_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const isCatInspected =
                      inspectedTarget?.type === 'category' &&
                      inspectedTarget.categoryId === cat.id;
                    const totalCatCount = kindItems.filter((i) => i.category_id === cat.id).length;
                    const filteredCatCount = allFilteredKindItems.filter(
                      (i) => i.category_id === cat.id
                    ).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as any);
                          setInspectedTarget({ type: 'category', categoryId: cat.id });
                        }}
                        onMouseEnter={() => {
                          setInspectedTarget({ type: 'category', categoryId: cat.id });
                        }}
                        className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-between gap-1 cursor-pointer select-none min-h-[54px] ${
                          isActive
                            ? activeKind === 'advantage'
                              ? 'bg-emerald-950/50 border-emerald-700/80 text-white shadow-xs'
                              : 'bg-red-950/50 border-red-700/80 text-white shadow-xs'
                            : 'bg-zinc-900/50 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title={
                          isFilterActive
                            ? `${cat.label}: найдено ${filteredCatCount} из ${totalCatCount} (с учетом фильтра)`
                            : cat.description
                        }
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span
                            className={
                              isActive
                                ? activeKind === 'advantage'
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                                : 'text-zinc-500'
                            }
                          >
                            {getCategoryIcon(cat.id)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCategory(cat.id as any);
                                setInspectedTarget({ type: 'category', categoryId: cat.id });
                              }}
                              className={`p-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                                isCatInspected
                                  ? 'text-amber-400'
                                  : 'text-zinc-500 hover:text-amber-300'
                              }`}
                              title={`Выбрать раздел «${cat.label}» для просмотра описания`}
                            >
                              <Eye className="w-3 h-3" />
                            </span>
                            <span
                              className={`font-mono text-[10px] shrink-0 transition-colors ${
                                isFilterActive
                                  ? filteredCatCount > 0
                                    ? 'text-amber-400 font-bold'
                                    : 'text-zinc-600'
                                  : 'text-zinc-500'
                              }`}
                              title={
                                isFilterActive
                                  ? `По фильтру: ${filteredCatCount} из ${totalCatCount}`
                                  : `Всего в каталоге: ${totalCatCount}`
                              }
                            >
                              {isFilterActive ? filteredCatCount : totalCatCount}
                            </span>
                          </div>
                        </div>
                        <span className="font-serif font-bold text-[11px] sm:text-xs leading-tight line-clamp-2">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lower part of Left Half: Accordions of Selectable Items */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2.5 custom-scrollbar [scrollbar-gutter:stable]">
                {/* 
                  SPECIAL FOR "Пользовательские достоинства":
                  Dedicated prominent button at the top to create a custom merit / flaw
                */}
                {activeCategory === 'custom' && (
                  <div className="p-0.5 mb-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalConfig({
                          isOpen: true,
                          customItemId: undefined,
                          initialKind: activeKind,
                          initialName: '',
                        });
                      }}
                      className="w-full p-2.5 sm:p-3 rounded-lg border-2 border-dashed border-red-700/70 hover:border-red-500 bg-red-950/25 hover:bg-red-950/45 text-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="font-serif font-bold text-xs sm:text-[13px]">
                        Создать преимущество / недостаток
                      </span>
                    </button>
                  </div>
                )}

                {groups.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 space-y-2">
                    {activeCategory === 'custom' ? (
                      <>
                        <Sparkles className="w-8 h-8 mx-auto opacity-40 text-red-400" />
                        <p className="text-sm font-serif text-zinc-300">
                          У вас пока нет созданных{' '}
                          {activeKind === 'advantage' ? 'достоинств' : 'недостатков'}
                        </p>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto font-serif">
                          Нажмите кнопку «Создать преимущество / недостаток» выше, чтобы добавить своё первое свойство в этот раздел.
                        </p>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-8 h-8 mx-auto opacity-40 text-red-500" />
                        <p className="text-sm font-serif">Ничего не найдено</p>
                        <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                          Попробуйте изменить поисковый запрос или переключить фильтр источников.
                        </p>
                        {(searchQuery || sourceFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setSourceFilter('all');
                            }}
                            className="mt-2 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs border border-zinc-700 cursor-pointer"
                          >
                            Сбросить фильтры
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  groups.map((group) => {
                    const expanded = isGroupExpanded(group.id);
                    const isGroupInspected =
                      inspectedTarget?.type === 'group' &&
                      inspectedTarget.group.id === group.id;

                    return (
                      <div
                        key={group.id}
                        className={`border rounded-lg overflow-hidden transition-colors ${
                          isGroupInspected
                            ? 'border-amber-700/80 bg-zinc-900/60 shadow-xs'
                            : 'border-zinc-800/80 bg-zinc-900/30'
                        }`}
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() => {
                            toggleGroup(group.id);
                            setInspectedTarget({ type: 'group', group });
                          }}
                          onMouseEnter={() => setInspectedTarget({ type: 'group', group })}
                          className={`p-2 sm:p-2.5 hover:bg-zinc-850 border-b border-zinc-800/60 flex items-center justify-between gap-2 cursor-pointer select-none transition-colors ${
                            isGroupInspected ? 'bg-zinc-850/90' : 'bg-zinc-900/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-zinc-500 shrink-0">
                              {expanded ? (
                                <ChevronDown className="w-4 h-4 text-red-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-zinc-500" />
                              )}
                            </span>
                            <div className="min-w-0 flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-xs sm:text-[13px] text-zinc-200 tracking-wide">
                                {group.title}
                              </span>
                              {group.requirement && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-serif truncate max-w-[140px] hidden sm:inline-block">
                                  {group.requirement}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* EYE BUTTON: Allows selecting this accordion for viewing in the right half */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedTarget({ type: 'group', group });
                              }}
                              className={`p-1 sm:px-2 sm:py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-sans ${
                                isGroupInspected
                                  ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80 shadow-xs'
                                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 border border-zinc-800/60'
                              }`}
                              title={`Выбрать раздел «${group.title}» для просмотра в правой панели`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[10px]">Инфо</span>
                            </button>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                              {group.items.length}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Body: Concrete Selectable Items */}
                        {expanded && (
                          <div className="p-1.5 sm:p-2 space-y-1 bg-zinc-950/40">
                            {group.items.map((item) => {
                              const isInspected =
                                inspectedTarget?.type === 'item' &&
                                inspectedTarget.item.id === item.id;
                              const onSheet = isItemOnSheet(item);
                              const dotsDisplay = renderPointsDots(item.points);

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setInspectedTarget({ type: 'item', item });
                                  }}
                                  onDoubleClick={() => handleConfirmSelect(item)}
                                  className={`w-full text-left p-2 sm:p-2.5 rounded-md border transition-colors flex items-center justify-between gap-2 group cursor-pointer select-none ${
                                    isInspected
                                      ? activeKind === 'advantage'
                                        ? 'bg-emerald-950/40 border-emerald-600/80 text-white shadow-xs'
                                        : 'bg-red-950/40 border-red-600/80 text-white shadow-xs'
                                      : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-850 text-zinc-300'
                                  }`}
                                >
                                  {/* Left part: Name and sheet badge */}
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    <span className="font-serif font-bold text-xs sm:text-[13px] text-zinc-100 group-hover:text-red-300 transition-colors truncate">
                                      {item.name}
                                    </span>

                                    {item.category_id === 'custom' && (
                                      <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/40 font-mono">
                                        своё
                                      </span>
                                    )}

                                    {onSheet && (
                                      <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-0.5 font-mono">
                                        <Check className="w-3 h-3" /> В листе
                                      </span>
                                    )}
                                  </div>

                                  {/* Right part: VISUAL POINTS DOTS IN THE LIST */}
                                  <div className="shrink-0 flex items-center gap-2 pl-2">
                                    {dotsDisplay ? (
                                      <span
                                        className={`font-mono text-xs sm:text-[13px] font-bold tracking-wider select-none ${
                                          activeKind === 'advantage' ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                        title={formatPointsLabel(item.points)}
                                      >
                                        {dotsDisplay}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-zinc-500 font-mono italic">
                                        —
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* -----------------------------------------------------------------------
                RIGHT HALF: Constant Dynamic Information Panel
                Description NEVER disappears when cursor leaves!
               ----------------------------------------------------------------------- */}
            <div className="w-full lg:w-[44%] flex flex-col min-h-0 h-[48%] lg:h-full bg-zinc-950/70 p-4 sm:p-5 overflow-y-auto overflow-x-hidden custom-scrollbar [scrollbar-gutter:stable]">
              {/* TARGET 1: Accordion Group (Section) Inspection */}
              {inspectedTarget?.type === 'group' ? (
                <div className="space-y-4 my-auto">
                  <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <BookOpen className="w-5 h-5 text-red-400" />
                      <span className="font-serif font-bold text-base text-zinc-100">
                        Раздел: {inspectedTarget.group.title}
                      </span>
                    </div>
                    {inspectedTarget.group.requirement && (
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2 break-words">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block font-serif">Требование раздела:</span>
                          <span>{inspectedTarget.group.requirement}</span>
                        </div>
                      </div>
                    )}
                    {inspectedTarget.group.description && (
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-serif whitespace-pre-line break-words">
                        {inspectedTarget.group.description}
                      </p>
                    )}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Доступных позиций в разделе:</span>
                      <span className="text-zinc-200 font-bold">
                        {inspectedTarget.group.items.length}
                      </span>
                    </div>

                    {/* Quick clickable list of items in this group */}
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">
                        Черты в этом разделе:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectedTarget.group.items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => {
                              setSelectedItem(it);
                              setInspectedTarget({ type: 'item', item: it });
                            }}
                            className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-serif cursor-pointer transition-colors"
                          >
                            {it.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : inspectedTarget?.type === 'category' ? (
                /* TARGET 2: Category Inspection */
                (() => {
                  const cat = ADVANTAGE_CATEGORIES.find(
                    (c) => c.id === inspectedTarget.categoryId
                  );
                  if (!cat) return null;
                  const totalCatCount = kindItems.filter((i) => i.category_id === cat.id).length;
                  const filteredCatCount = allFilteredKindItems.filter(
                    (i) => i.category_id === cat.id
                  ).length;

                  return (
                    <div className="space-y-4 my-auto">
                      <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2 text-red-400">
                          {getCategoryIcon(cat.id)}
                          <h4 className="font-serif font-bold text-base text-zinc-100">
                            {cat.label}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-serif break-words">
                          {cat.description}
                        </p>
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                          <span>
                            {activeKind === 'advantage' ? 'Достоинств в разделе' : 'Недостатков в разделе'}:
                          </span>
                          <div className="text-right">
                            <span
                              className={`font-bold ${
                                isFilterActive ? 'text-amber-400' : 'text-zinc-200'
                              }`}
                            >
                              {isFilterActive ? filteredCatCount : totalCatCount}
                            </span>
                            {isFilterActive && filteredCatCount !== totalCatCount && (
                              <span className="text-zinc-500 text-[11px] ml-1.5 font-normal">
                                (всего в каталоге: {totalCatCount})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick clickable list of groups in this category */}
                        {groups.length > 0 && (
                          <div className="pt-2 space-y-1.5 border-t border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              Разделы в этой категории ({groups.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {groups.map((g) => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setInspectedTarget({ type: 'group', group: g })}
                                  className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-serif cursor-pointer transition-colors flex items-center gap-1 hover:text-amber-300"
                                >
                                  <Eye className="w-3 h-3 text-amber-500/80" />
                                  <span>{g.title}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    ({g.items.length})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {cat.id === 'custom' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCreateModalConfig({
                                isOpen: true,
                                customItemId: undefined,
                                initialKind: activeKind,
                                initialName: '',
                              });
                            }}
                            className="w-full mt-2 py-2 px-3 rounded-lg bg-red-900/60 hover:bg-red-800/80 border border-red-700/80 text-white text-xs font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Создать преимущество / недостаток</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : inspectedTarget?.type === 'item' || selectedItem ? (
                /* TARGET 3: Item Inspection */
                (() => {
                  const targetItem =
                    inspectedTarget?.type === 'item' ? inspectedTarget.item : selectedItem!;
                  const onSheet = isItemOnSheet(targetItem);
                  const isCustom = targetItem.category_id === 'custom';

                  return (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        {/* Title & Dots */}
                        <div className="pb-3 border-b border-red-950/40">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-100 leading-snug">
                                {targetItem.name}
                              </h3>
                              {targetItem.section && (
                                <div className="text-xs text-zinc-400 mt-0.5 font-serif">
                                  Раздел: {targetItem.section}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`font-mono text-sm sm:text-base font-bold tracking-widest px-2 py-0.5 rounded border inline-block ${
                                  targetItem.kind === 'advantage'
                                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                    : 'bg-red-950/60 border-red-800 text-red-300'
                                }`}
                              >
                                {renderPointsDots(targetItem.points) || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Meta Badges */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                                targetItem.kind === 'advantage'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                                  : 'bg-red-950/60 text-red-300 border-red-700/60'
                              }`}
                            >
                              {targetItem.kind === 'advantage' ? 'Достоинство' : 'Недостаток'}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-800 font-serif">
                              {formatPointsLabel(targetItem.points)}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 text-zinc-400 border border-zinc-800">
                              {targetItem.category}
                            </span>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCreateModalConfig({
                                    isOpen: true,
                                    customItemId: targetItem.id,
                                    initialKind: targetItem.kind,
                                    initialName: targetItem.name,
                                  });
                                }}
                                className="px-2 py-0.5 rounded text-[11px] bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Редактировать черту</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sources */}
                        {targetItem.sources && targetItem.sources.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
                              Источники
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {targetItem.sources.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs"
                                >
                                  {s.ru}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Requirements */}
                        {targetItem.requirements && (
                          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2 break-words">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block font-serif">Требования:</span>
                              <span>{targetItem.requirements}</span>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
                            Описание
                          </span>
                          <div className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line font-serif bg-zinc-900/30 p-3 rounded-lg border border-zinc-900 break-words">
                            {targetItem.description}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for the inspected item */}
                      <div className="pt-4 border-t border-red-950/40 mt-4 flex items-center justify-between gap-2">
                        {onSheet ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(targetItem)}
                            className="px-3 py-2 bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить из листа</span>
                          </button>
                        ) : (
                          <div className="text-[11px] text-zinc-500 font-mono italic">
                            Двойной клик для быстрого добавления
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleConfirmSelect(targetItem)}
                          className={`px-4 py-2 rounded-lg text-xs font-serif font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                            targetItem.kind === 'advantage'
                              ? 'bg-emerald-800 hover:bg-emerald-700 shadow-emerald-950'
                              : 'bg-red-800 hover:bg-red-700 shadow-red-950'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{onSheet ? 'Обновить в слоте' : 'Выбрать в лист'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Idle / Neutral guidance */
                <div className="p-8 text-center text-zinc-500 space-y-2 my-auto">
                  <Info className="w-8 h-8 mx-auto opacity-30 text-zinc-400" />
                  <p className="text-xs font-serif">
                    Наведите курсор на категорию, раздел или конкретное достоинство/недостаток для просмотра подробной информации.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              3. FOOTER
             ========================================================================= */}
          <div className="p-3 sm:p-4 border-t border-red-950/40 bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span>
                В листе:{' '}
                <strong className="text-emerald-400">
                  {currentMerits.filter((m) => m.name.trim()).length}
                </strong>{' '}
                Достоинств,{' '}
                <strong className="text-red-400">
                  {currentFlaws.filter((f) => f.name.trim()).length}
                </strong>{' '}
                Недостатков
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </Modal>

      {/* Advantage Detail / Custom Create Modal */}
      {createModalConfig.isOpen && (
        <AdvantageDetailModal
          isOpen={createModalConfig.isOpen}
          onClose={() =>
            setCreateModalConfig((prev) => ({
              ...prev,
              isOpen: false,
            }))
          }
          customItemId={createModalConfig.customItemId}
          initialKind={createModalConfig.initialKind}
          initialName={createModalConfig.initialName}
          onAddedToCatalog={(savedItem) => {
            setCustomItems(getCustomAdvantages());
            setSelectedItem(savedItem);
            setInspectedTarget({ type: 'item', item: savedItem });
            setActiveCategory('custom');
          }}
        />
      )}
    </>
  );
};
