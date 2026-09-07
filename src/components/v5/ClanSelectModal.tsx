import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ConfirmModal } from '../ConfirmModal';
import { ClanId, CustomClanEntry } from '../../types';
import { CLAN_THEMES } from '../../data/clans';
import { ClanSymbol } from '../ClanSymbol';
import {
  BookOpen,
  Skull,
  Zap,
  Sparkles,
  Check,
  Edit3,
  Shield,
  ChevronRight,
  Plus,
  Trash2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const CUSTOM_CLANS_STORAGE_KEY = 'vtm_v5_custom_clans_list';

export const loadSavedCustomClans = (): CustomClanEntry[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_CLANS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom clans from storage', err);
    return [];
  }
};

export const saveCustomClansToStorage = (clans: CustomClanEntry[]) => {
  try {
    localStorage.setItem(CUSTOM_CLANS_STORAGE_KEY, JSON.stringify(clans));
  } catch (err) {
    console.error('Failed to save custom clans to storage', err);
  }
};

interface ClanSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClan: ClanId;
  customClanName?: string;
  currentClanBane?: string;
  currentClanCompulsion?: string;
  onSelectClan: (
    clanId: ClanId,
    customName?: string,
    clanBane?: string,
    clanCompulsion?: string
  ) => void;
}

export const ClanSelectModal: React.FC<ClanSelectModalProps> = ({
  isOpen,
  onClose,
  currentClan,
  customClanName = '',
  currentClanBane,
  currentClanCompulsion,
  onSelectClan,
}) => {
  // List of saved custom clans
  const [customClans, setCustomClans] = useState<CustomClanEntry[]>(() =>
    loadSavedCustomClans()
  );

  // Inspected ID: can be a standard clan id ('brujah', etc.), 'custom_new', or a custom clan's unique id
  const [inspectedId, setInspectedId] = useState<string>(currentClan);

  // Custom bloodline form fields
  const [bloodlineName, setBloodlineName] = useState<string>(customClanName);
  const [bloodlineBane, setBloodlineBane] = useState<string>(
    currentClanBane || CLAN_THEMES.custom.bane || ''
  );
  const [bloodlineCompulsion, setBloodlineCompulsion] = useState<string>(
    currentClanCompulsion || CLAN_THEMES.custom.compulsion || ''
  );

  // Messages / feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Modal for confirming deletion of a custom clan
  const [clanToDelete, setClanToDelete] = useState<CustomClanEntry | null>(null);

  // Reset/sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedCustomClans();
      setCustomClans(saved);

      if (currentClan === 'custom') {
        // If current custom clan matches a saved one by name
        const match = saved.find((c) => c.name === customClanName);
        if (match) {
          setInspectedId(match.id);
          setBloodlineName(match.name);
          setBloodlineBane(match.bane);
          setBloodlineCompulsion(match.compulsion);
        } else {
          setInspectedId('custom_new');
          setBloodlineName(customClanName || '');
          setBloodlineBane(
            currentClanBane ||
              CLAN_THEMES.custom.bane ||
              'Индивидуальный изъян крови.'
          );
          setBloodlineCompulsion(
            currentClanCompulsion ||
              CLAN_THEMES.custom.compulsion ||
              'Индивидуальная клановая мания.'
          );
        }
      } else {
        setInspectedId(currentClan);
        setBloodlineName(customClanName || '');
        setBloodlineBane(
          currentClanBane ||
            CLAN_THEMES.custom.bane ||
            'Индивидуальный изъян крови.'
        );
        setBloodlineCompulsion(
          currentClanCompulsion ||
            CLAN_THEMES.custom.compulsion ||
            'Индивидуальная клановая мания.'
        );
      }
      setValidationError(null);
      setFeedbackSuccess(null);
    }
  }, [isOpen, currentClan, customClanName, currentClanBane, currentClanCompulsion]);

  // Determine what is currently inspected
  const isCustomNew = inspectedId === 'custom_new' || inspectedId === 'custom';
  const customClanMatch = customClans.find((c) => c.id === inspectedId);
  const isCustomEntry = !!customClanMatch;
  const isAnyCustom = isCustomNew || isCustomEntry;

  const standardClan = !isAnyCustom
    ? CLAN_THEMES[inspectedId as ClanId] || CLAN_THEMES['brujah']
    : null;

  // When clicking on a custom clan from the list
  const handleSelectCustomEntry = (entry: CustomClanEntry) => {
    setInspectedId(entry.id);
    setBloodlineName(entry.name);
    setBloodlineBane(entry.bane);
    setBloodlineCompulsion(entry.compulsion);
    setValidationError(null);
  };

  // When clicking "+ Новая линия крови"
  const handleSelectNewCustom = () => {
    setInspectedId('custom_new');
    setBloodlineName('');
    setBloodlineBane(
      CLAN_THEMES.custom.bane || 'Индивидуальный изъян крови.'
    );
    setBloodlineCompulsion(
      CLAN_THEMES.custom.compulsion || 'Индивидуальная клановая мания.'
    );
    setValidationError(null);
  };

  // Adding / saving custom clan into customClans list
  const handleAddCustomClanToList = () => {
    const trimmedName = bloodlineName.trim();
    if (!trimmedName) {
      setValidationError('Пожалуйста, введите название линии крови');
      return;
    }

    setValidationError(null);

    const newClan: CustomClanEntry = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      nameEn: 'Custom Bloodline',
      quote: '«Наша кровь уникальна, наше наследие сокрыто в тенях веков».',
      description:
        'Пользовательская линия крови, созданная игроком для текущей хроники.',
      bane:
        bloodlineBane.trim() ||
        CLAN_THEMES.custom.bane ||
        'Индивидуальный изъян крови.',
      compulsion:
        bloodlineCompulsion.trim() ||
        CLAN_THEMES.custom.compulsion ||
        'Индивидуальная клановая мания.',
      disciplines: ['Дисциплины по выбору игрока'],
      accentColor: '#991b1b',
      createdAt: new Date().toISOString(),
    };

    // Check if entry with same id already exists, or append
    const updated = [newClan, ...customClans.filter((c) => c.id !== newClan.id)];
    setCustomClans(updated);
    saveCustomClansToStorage(updated);
    setInspectedId(newClan.id);

    setFeedbackSuccess(`Линия крови «${trimmedName}» сохранена в список кланов!`);
    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 3500);
  };

  // Confirm delete of a custom clan
  const handleConfirmDelete = () => {
    if (!clanToDelete) return;

    const updated = customClans.filter((c) => c.id !== clanToDelete.id);
    setCustomClans(updated);
    saveCustomClansToStorage(updated);

    if (inspectedId === clanToDelete.id) {
      setInspectedId('brujah');
    }
    setClanToDelete(null);
  };

  // Final selection confirmation to apply to character sheet
  const handleConfirmSelect = () => {
    if (!isAnyCustom) {
      // Standard Clan selected
      if (!standardClan) return;
      onSelectClan(
        standardClan.id,
        undefined,
        standardClan.bane || standardClan.weakness,
        standardClan.compulsion
      );
    } else {
      // Custom bloodline selected
      const finalName =
        bloodlineName.trim() ||
        (customClanMatch ? customClanMatch.name : 'Своя линия крови');
      const finalBane =
        bloodlineBane.trim() ||
        (customClanMatch ? customClanMatch.bane : CLAN_THEMES.custom.bane);
      const finalCompulsion =
        bloodlineCompulsion.trim() ||
        (customClanMatch
          ? customClanMatch.compulsion
          : CLAN_THEMES.custom.compulsion);

      onSelectClan('custom', finalName, finalBane, finalCompulsion);
    }
    onClose();
  };

  // Filter out standard 'custom' from standard list so we render it separately
  const standardClanList = Object.values(CLAN_THEMES).filter(
    (c) => c.id !== 'custom'
  );

  return (
    <>
      <Modal
        id="vtm-clan-selection-modal"
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="font-serif">Выбор клана персонажа</span>
          </div>
        }
        subtitle="Выберите клан или создайте линию крови. Клановый изъян и мания автоматически перенесутся на лист персонажа."
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col md:flex-row gap-4 min-h-[500px] max-h-[76vh]">
          {/* Left Column: List of clans */}
          <div className="w-full md:w-5/12 flex flex-col border border-zinc-800 rounded-xl bg-zinc-950/70 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-bold font-serif uppercase tracking-wider text-zinc-300">
                Кланы и линии крови
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {standardClanList.length + customClans.length + 1} вар.
              </span>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-1.5 space-y-3 flex-1">
              {/* Section 1: Standard Clans */}
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] uppercase font-serif font-bold tracking-wider text-zinc-500">
                  Официальные кланы V5
                </div>
                {standardClanList.map((c) => {
                  const isInspected = inspectedId === c.id;
                  const isCurrent = currentClan === c.id;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      id={`clan-item-${c.id}`}
                      onMouseEnter={() => {
                        if (!isAnyCustom || !isInspected) {
                          setInspectedId(c.id);
                        }
                      }}
                      onClick={() => setInspectedId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between group ${
                        isInspected
                          ? 'bg-zinc-800/95 text-white border border-red-800/70 shadow-md'
                          : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ClanSymbol
                          clan={c.id}
                          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                          color={c.accentColor}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-serif font-bold text-xs truncate">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-sans truncate">
                            {c.nameEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                            Текущий
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isInspected
                              ? 'text-red-400 translate-x-0.5'
                              : 'text-zinc-600 group-hover:text-zinc-400'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Section 2: Custom Bloodlines */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                <div className="px-2 py-0.5 flex items-center justify-between text-[10px] uppercase font-serif font-bold tracking-wider text-amber-500/80">
                  <span>Пользовательские линии ({customClans.length})</span>
                </div>

                {/* List of saved custom clans */}
                {customClans.map((customEntry) => {
                  const isInspected = inspectedId === customEntry.id;
                  const isCurrent =
                    currentClan === 'custom' &&
                    customClanName === customEntry.name;

                  return (
                    <div
                      key={customEntry.id}
                      onClick={() => handleSelectCustomEntry(customEntry)}
                      onMouseEnter={() => {
                        if (inspectedId !== customEntry.id && !isCustomNew) {
                          handleSelectCustomEntry(customEntry);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between group ${
                        isInspected
                          ? 'bg-zinc-800/95 text-white border border-amber-600/70 shadow-md'
                          : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-600 transition-transform group-hover:scale-125" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-serif font-bold text-xs truncate text-amber-200">
                            {customEntry.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-sans truncate">
                            Линия крови
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isCurrent && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                            Текущий
                          </span>
                        )}

                        {/* Trash Delete Button */}
                        <button
                          type="button"
                          title="Удалить из списка кланов"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClanToDelete(customEntry);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isInspected
                              ? 'text-amber-400 translate-x-0.5'
                              : 'text-zinc-600 group-hover:text-zinc-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Button to create a new custom bloodline */}
                <button
                  type="button"
                  onClick={handleSelectNewCustom}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between border ${
                    isCustomNew
                      ? 'bg-red-950/40 text-red-200 border-red-700/80 shadow-md'
                      : 'hover:bg-zinc-900/80 text-zinc-400 border-dashed border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-serif text-xs font-semibold">
                      Своя линия крови (создать)
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed V5 information or Custom Bloodline Editor */}
          <div className="w-full md:w-7/12 flex flex-col border border-zinc-800 rounded-xl bg-zinc-950/80 overflow-hidden">
            {/* Header Preview */}
            <div
              className="p-4 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 flex items-start justify-between gap-3 shrink-0"
              style={{
                borderTop: `3px solid ${
                  isAnyCustom
                    ? '#b91c1c'
                    : standardClan?.accentColor || '#dc2626'
                }`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-10 h-10 rounded-lg border flex items-center justify-center p-1.5 shrink-0 shadow-md mt-0.5"
                  style={{
                    borderColor: isAnyCustom ? '#b91c1c' : standardClan?.accentColor || '#dc2626',
                    backgroundColor: `${isAnyCustom ? '#b91c1c' : standardClan?.accentColor || '#dc2626'}1a`,
                  }}
                >
                  <ClanSymbol
                    clan={isAnyCustom ? 'custom' : standardClan?.id}
                    className="w-7 h-7 object-contain"
                    color={isAnyCustom ? '#b91c1c' : standardClan?.accentColor || '#dc2626'}
                  />
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold font-serif text-white tracking-wide">
                      {isAnyCustom
                        ? bloodlineName.trim() || 'Своя линия крови'
                        : standardClan?.name}
                    </h3>
                    <span className="text-xs text-zinc-400 font-sans italic">
                      ({isAnyCustom ? 'Custom Bloodline' : standardClan?.nameEn})
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-serif italic mt-1 leading-relaxed">
                    {isAnyCustom
                      ? '«Наша кровь уникальна, наше наследие сокрыто в тенях веков».'
                      : standardClan?.quote}
                  </p>
                </div>
              </div>

              <span
                className="w-4 h-4 rounded-full border border-black/50 shrink-0 mt-1 shadow-sm"
                style={{
                  backgroundColor: isAnyCustom
                    ? '#b91c1c'
                    : standardClan?.accentColor || '#dc2626',
                }}
              />
            </div>

            {/* Content (Scrollable) */}
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1 text-xs">
              {/* If CUSTOM BLOODLINE: Full interactive editor */}
              {isAnyCustom ? (
                <div className="space-y-3.5">
                  {/* Validation Error Banner */}
                  {validationError && (
                    <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Feedback Success Banner */}
                  {feedbackSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feedbackSuccess}</span>
                    </div>
                  )}

                  {/* Bloodline Name Input */}
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 space-y-1.5">
                    <label className="font-serif font-bold text-xs text-red-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <Edit3 className="w-3.5 h-3.5 text-red-400" />
                      Название линии крови:
                    </label>
                    <input
                      type="text"
                      value={bloodlineName}
                      onChange={(e) => {
                        setBloodlineName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Например: Нагараджа, Девы Битвы, Горгульи..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500"
                    />
                    <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                      Название будет выведено в шапке листа и в списке быстрого выбора.
                    </p>
                  </div>

                  {/* Clan Bane (Клановый изъян) */}
                  <div className="space-y-1.5">
                    <label className="font-serif font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Skull className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      Клановый изъян (Clan Bane):
                    </label>
                    <textarea
                      rows={3}
                      value={bloodlineBane}
                      onChange={(e) => setBloodlineBane(e.target.value)}
                      placeholder="Опишите уникальный клановый изъян вашей линии крови..."
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Clan Compulsion (Клановая мания) */}
                  <div className="space-y-1.5">
                    <label className="font-serif font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Клановая мания (Clan Compulsion):
                    </label>
                    <textarea
                      rows={3}
                      value={bloodlineCompulsion}
                      onChange={(e) => setBloodlineCompulsion(e.target.value)}
                      placeholder="Опишите поведение Зверя при кризисе (манию вашей линии крови)..."
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-purple-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Save to Clan List Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAddCustomClanToList}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-amber-700/60 hover:border-amber-500 text-amber-200 font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>Добавить в список кланов</span>
                    </button>
                    <p className="text-[10.5px] text-zinc-500 text-center mt-1.5 font-sans">
                      Сохраняет линию крови с её изъяном и манией для быстрого выбора в будущем
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard Clan Information Display */
                standardClan && (
                  <div className="space-y-4">
                    {/* Description from V5 Core Rulebook */}
                    <div className="space-y-1.5">
                      <span className="font-serif font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Описание из книги правил V5:
                      </span>
                      <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                        {standardClan.description || standardClan.flavor}
                      </p>
                    </div>

                    {/* Clan Bane (Клановый изъян) */}
                    <div className="space-y-1.5">
                      <span className="font-serif font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Skull className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        Клановый изъян (Clan Bane):
                      </span>
                      <div className="text-zinc-200 leading-relaxed bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                        {standardClan.bane || standardClan.weakness}
                      </div>
                    </div>

                    {/* Clan Compulsion (Клановая мания) */}
                    <div className="space-y-1.5">
                      <span className="font-serif font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        Клановая мания (Clan Compulsion):
                      </span>
                      <div className="text-zinc-200 leading-relaxed bg-purple-950/20 p-3 rounded-lg border border-purple-900/30">
                        {standardClan.compulsion ||
                          'Общие позывы Голода и Зверя.'}
                      </div>
                    </div>

                    {/* Clan Disciplines (Клановые дисциплины) */}
                    <div className="space-y-1.5">
                      <span className="font-serif font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Клановые дисциплины:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {standardClan.disciplines.map((d, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-750 text-zinc-200 font-serif text-[11px] flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Action Footer */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-zinc-400 font-sans truncate">
                Выбрано:{' '}
                <strong className="text-white font-serif">
                  {isAnyCustom
                    ? bloodlineName.trim() || 'Своя линия крови'
                    : standardClan?.name}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-serif text-xs transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelect}
                  className="px-4 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white font-serif text-xs font-bold transition-all shadow-md hover:shadow-red-950/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isAnyCustom ? 'Применить линию крови' : 'Выбрать этот клан'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm deletion modal for custom clan */}
      <ConfirmModal
        isOpen={!!clanToDelete}
        onClose={() => setClanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удаление линии крови"
        message={`Вы действительно хотите удалить линию крови «${clanToDelete?.name}» из списка сохраненных кланов?\n\nЭто действие удалит шаблон из быстрого выбора.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive={true}
      />
    </>
  );
};
