import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ConfirmModal } from '../ConfirmModal';
import { PredatorTypeTheme, CustomPredatorTypeEntry } from '../../types';
import {
  PREDATOR_TYPES,
  loadSavedCustomPredatorTypes,
  saveCustomPredatorTypesToStorage,
} from '../../data/predatorTypes';
import {
  Compass,
  BookOpen,
  Sparkles,
  Target,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check,
  Plus,
  Trash2,
  Bookmark,
  ChevronRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PredatorTypeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPredatorType?: string;
  onSelectPredatorType: (predatorTypeName: string) => void;
}

export const PredatorTypeSelectModal: React.FC<PredatorTypeSelectModalProps> = ({
  isOpen,
  onClose,
  currentPredatorType = '',
  onSelectPredatorType,
}) => {
  // List of saved custom predator types
  const [customStyles, setCustomStyles] = useState<CustomPredatorTypeEntry[]>(() =>
    loadSavedCustomPredatorTypes()
  );

  // Inspected ID: can be a standard id ('alleycat', etc.), 'custom_new', or a custom style's unique id
  const [inspectedId, setInspectedId] = useState<string>('alleycat');

  // Custom predator type form fields
  const [customName, setCustomName] = useState<string>('');
  const [customQuote, setCustomQuote] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customSpecialization, setCustomSpecialization] = useState<string>('');
  const [customDisciplines, setCustomDisciplines] = useState<string>('');
  const [customAdvantages, setCustomAdvantages] = useState<string>('');
  const [customFlaws, setCustomFlaws] = useState<string>('');
  const [customSpecialRules, setCustomSpecialRules] = useState<string>('');

  // Feedbacks
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Delete modal state
  const [styleToDelete, setStyleToDelete] = useState<CustomPredatorTypeEntry | null>(null);

  // On open, find best matching style to currentPredatorType or default to alleycat
  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedCustomPredatorTypes();
      setCustomStyles(saved);

      const normalizedCurrent = currentPredatorType.trim().toLowerCase();

      // Legacy or alternate Russian translations map for backward compatibility
      const legacyMap: Record<string, string> = {
        'переулочный кот': 'alleycat',
        'тайный гурман': 'bagger',
        'кровопийца': 'blood_leech',
        'тесак': 'cleaver',
        'домосед': 'cleaver',
        'консенсуалист': 'consensualist',
        'озирис': 'osiris',
        'песочный человек': 'sandman',
        'сценолов': 'scene_queen',
        'сирена': 'siren',
        'могильщик': 'graverobber',
        'расхититель гробниц': 'graverobber',
        'ловчий': 'trapdoor',
        'капканщик': 'trapdoor',
        'бродяга': 'roadside_killer',
        'убийца с обочины': 'roadside_killer',
      };

      // Look for standard match
      const standardMatch = Object.values(PREDATOR_TYPES).find(
        (p) =>
          p.name.toLowerCase() === normalizedCurrent ||
          p.nameEn.toLowerCase() === normalizedCurrent ||
          `${p.name} (${p.nameEn})`.toLowerCase() === normalizedCurrent ||
          normalizedCurrent.startsWith(p.name.toLowerCase()) ||
          normalizedCurrent.includes(p.nameEn.toLowerCase())
      );

      const legacyEntry = Object.entries(legacyMap).find(([legacyKey]) =>
        normalizedCurrent.includes(legacyKey)
      );

      if (standardMatch) {
        setInspectedId(standardMatch.id);
      } else if (legacyEntry && PREDATOR_TYPES[legacyEntry[1]]) {
        setInspectedId(legacyEntry[1]);
      } else {
        // Look in custom styles
        const customMatch = saved.find(
          (c) =>
            c.name.toLowerCase() === normalizedCurrent ||
            normalizedCurrent.startsWith(c.name.toLowerCase())
        );
        if (customMatch) {
          setInspectedId(customMatch.id);
          setCustomName(customMatch.name);
          setCustomQuote(customMatch.quote || '');
          setCustomDescription(customMatch.description);
          setCustomSpecialization(customMatch.specialization);
          setCustomDisciplines(customMatch.disciplines.join(', '));
          setCustomAdvantages(customMatch.advantages);
          setCustomFlaws(customMatch.flaws);
          setCustomSpecialRules(customMatch.specialRules || '');
        } else if (currentPredatorType.trim()) {
          // It's a custom text previously entered
          setInspectedId('custom_new');
          setCustomName(currentPredatorType);
        } else {
          setInspectedId('alleycat');
        }
      }
      setValidationError(null);
      setFeedbackSuccess(null);
    }
  }, [isOpen, currentPredatorType]);

  const isCustomNew = inspectedId === 'custom_new';
  const customEntryMatch = customStyles.find((c) => c.id === inspectedId);
  const isCustomEntry = !!customEntryMatch;
  const isAnyCustom = isCustomNew || isCustomEntry;

  const standardStyle = !isAnyCustom ? PREDATOR_TYPES[inspectedId] || PREDATOR_TYPES['alleycat'] : null;

  const handleSelectCustomEntry = (entry: CustomPredatorTypeEntry) => {
    setInspectedId(entry.id);
    setCustomName(entry.name);
    setCustomQuote(entry.quote || '');
    setCustomDescription(entry.description);
    setCustomSpecialization(entry.specialization);
    setCustomDisciplines(entry.disciplines.join(', '));
    setCustomAdvantages(entry.advantages);
    setCustomFlaws(entry.flaws);
    setCustomSpecialRules(entry.specialRules || '');
    setValidationError(null);
  };

  const handleSelectNewCustom = () => {
    setInspectedId('custom_new');
    setCustomName('');
    setCustomQuote('');
    setCustomDescription('');
    setCustomSpecialization('');
    setCustomDisciplines('');
    setCustomAdvantages('');
    setCustomFlaws('');
    setCustomSpecialRules('');
    setValidationError(null);
  };

  const handleAddCustomStyleToList = () => {
    const trimmedName = customName.trim();
    if (!trimmedName) {
      setValidationError('Пожалуйста, укажите название стиля охоты');
      return;
    }

    setValidationError(null);

    const newStyle: CustomPredatorTypeEntry = {
      id: `predator_${Date.now()}`,
      name: trimmedName,
      nameEn: 'Custom Style',
      quote: customQuote.trim() || '«Ночь принадлежит тем, кто умеет находить свою добычу».',
      description:
        customDescription.trim() ||
        'Пользовательский стиль охоты, разработанный игроком под концепцию персонажа.',
      specialization:
        customSpecialization.trim() || 'Специализация по выбору игрока и Рассказчика.',
      disciplines: customDisciplines
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      advantages: customAdvantages.trim() || 'Преимущества по согласованию с Рассказчиком.',
      flaws: customFlaws.trim() || 'Недостатки по согласованию с Рассказчиком.',
      specialRules:
        customSpecialRules.trim() ||
        'Особые правила и модификаторы кормления на усмотрение Рассказчика.',
      accentColor: '#b91c1c',
      createdAt: new Date().toISOString(),
    };

    const updated = [newStyle, ...customStyles.filter((c) => c.id !== newStyle.id)];
    setCustomStyles(updated);
    saveCustomPredatorTypesToStorage(updated);
    setInspectedId(newStyle.id);

    setFeedbackSuccess(`Стиль охоты «${trimmedName}» сохранен в список!`);
    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 3500);
  };

  const handleConfirmDelete = () => {
    if (!styleToDelete) return;
    const updated = customStyles.filter((c) => c.id !== styleToDelete.id);
    setCustomStyles(updated);
    saveCustomPredatorTypesToStorage(updated);

    if (inspectedId === styleToDelete.id) {
      setInspectedId('alleycat');
    }
    setStyleToDelete(null);
  };

  const handleConfirmSelect = () => {
    if (!isAnyCustom) {
      if (!standardStyle) return;
      onSelectPredatorType(`${standardStyle.name} (${standardStyle.nameEn})`);
    } else {
      const finalName =
        customName.trim() || (customEntryMatch ? customEntryMatch.name : 'Свой стиль охоты');
      onSelectPredatorType(finalName);
    }
    onClose();
  };

  const standardList = Object.values(PREDATOR_TYPES).sort((a, b) =>
    a.name.localeCompare(b.name, 'ru')
  );

  return (
    <>
      <Modal
        id="vtm-predator-type-selection-modal"
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            <span className="font-serif">Выбор стиля охоты (Predator Type)</span>
          </div>
        }
        subtitle="Стиль охоты определяет, как именно ваш Сородич добывает кровь, а также дает специализацию, дисциплины, преимущества и недостатки."
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col md:flex-row gap-4 min-h-[500px] max-h-[76vh]">
          {/* Left Column: List of styles */}
          <div className="w-full md:w-5/12 flex flex-col border border-zinc-800 rounded-xl bg-zinc-950/70 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-bold font-serif uppercase tracking-wider text-zinc-300">
                Стили охоты
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {standardList.length + customStyles.length + 1} вар.
              </span>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-1.5 space-y-3 flex-1">
              {/* Section 1: Standard Styles */}
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] uppercase font-serif font-bold tracking-wider text-zinc-500">
                  Официальные стили охоты V5
                </div>
                {standardList.map((style) => {
                  const isInspected = inspectedId === style.id;
                  const isCurrent =
                    currentPredatorType.includes(style.name) ||
                    currentPredatorType.includes(style.nameEn);

                  return (
                    <button
                      key={style.id}
                      type="button"
                      id={`predator-item-${style.id}`}
                      onMouseEnter={() => {
                        if (!isAnyCustom || !isInspected) {
                          setInspectedId(style.id);
                        }
                      }}
                      onClick={() => setInspectedId(style.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between group ${
                        isInspected
                          ? 'bg-zinc-800/95 text-white border border-red-800/70 shadow-md'
                          : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                          style={{ backgroundColor: style.accentColor }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-serif font-bold text-xs truncate">
                            {style.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-sans truncate">
                            {style.nameEn}
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

              {/* Section 2: Custom Styles */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                <div className="px-2 py-0.5 flex items-center justify-between text-[10px] uppercase font-serif font-bold tracking-wider text-amber-500/80">
                  <span>Пользовательские стили ({customStyles.length})</span>
                </div>

                {/* List of saved custom predator types */}
                {customStyles.map((c) => {
                  const isInspected = inspectedId === c.id;
                  const isCurrent = currentPredatorType === c.name;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomEntry(c)}
                      onMouseEnter={() => {
                        if (inspectedId !== c.id && !isCustomNew) {
                          handleSelectCustomEntry(c);
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
                            {c.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-sans truncate">
                            Кастомный стиль
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
                          title="Удалить из списка стилей"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStyleToDelete(c);
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

                {/* Button to create a new custom style */}
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
                      Свой стиль охоты (создать)
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed V5 information or Custom Style Editor */}
          <div className="w-full md:w-7/12 flex flex-col border border-zinc-800 rounded-xl bg-zinc-950/80 overflow-hidden">
            {/* Header Preview */}
            <div
              className="p-4 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 flex items-start justify-between gap-3 shrink-0"
              style={{
                borderTop: `3px solid ${
                  isAnyCustom ? '#b91c1c' : standardStyle?.accentColor || '#dc2626'
                }`,
              }}
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold font-serif text-white tracking-wide">
                    {isAnyCustom
                      ? customName.trim() || 'Свой стиль охоты'
                      : standardStyle?.name}
                  </h3>
                  <span className="text-xs text-zinc-400 font-sans italic">
                    ({isAnyCustom ? 'Custom Predator Type' : standardStyle?.nameEn})
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-serif italic mt-1 leading-relaxed">
                  {isAnyCustom
                    ? customQuote.trim() || '«Ночь принадлежит тем, кто умеет находить свою добычу».'
                    : standardStyle?.quote}
                </p>
              </div>

              <span
                className="w-4 h-4 rounded-full border border-black/50 shrink-0 mt-1 shadow-sm"
                style={{
                  backgroundColor: isAnyCustom
                    ? '#b91c1c'
                    : standardStyle?.accentColor || '#dc2626',
                }}
              />
            </div>

            {/* Content (Scrollable) */}
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1 text-xs">
              {/* If CUSTOM: Full interactive editor */}
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

                  {/* Style Name Input */}
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 space-y-1.5">
                    <label className="font-serif font-bold text-xs text-red-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <Edit3 className="w-3.5 h-3.5 text-red-400" />
                      Название стиля охоты:
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Например: Ночной охотник, Карманник, Техно-сталкер..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500"
                    />
                    <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                      Название будет выведено в шапке листа и в списке быстрого выбора.
                    </p>
                  </div>

                  {/* Quote / Creed */}
                  <div className="space-y-1">
                    <label className="font-serif font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      Атмосферная цитата / кредо:
                    </label>
                    <input
                      type="text"
                      value={customQuote}
                      onChange={(e) => setCustomQuote(e.target.value)}
                      placeholder="«Цитата, отражающая философию кормления...»"
                      className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="font-serif font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Описание стиля охоты:
                    </label>
                    <textarea
                      rows={2.5}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Опишите, как именно ваш вампир выслеживает добычу и питается..."
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Specialization & Disciplines in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-serif font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Специализация:
                      </label>
                      <input
                        type="text"
                        value={customSpecialization}
                        onChange={(e) => setCustomSpecialization(e.target.value)}
                        placeholder="Напр. Скрытность (Засада)"
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-serif font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Дисциплины (+1 точка):
                      </label>
                      <input
                        type="text"
                        value={customDisciplines}
                        onChange={(e) => setCustomDisciplines(e.target.value)}
                        placeholder="Напр. Затемнение, Протеизм"
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-amber-500 focus:outline-none transition-colors placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  {/* Advantages & Flaws */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-serif font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        Преимущества (Merits):
                      </label>
                      <textarea
                        rows={2}
                        value={customAdvantages}
                        onChange={(e) => setCustomAdvantages(e.target.value)}
                        placeholder="Контакты, Убежище, Стадо..."
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-sky-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-serif font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        Недостатки (Flaws):
                      </label>
                      <textarea
                        rows={2}
                        value={customFlaws}
                        onChange={(e) => setCustomFlaws(e.target.value)}
                        placeholder="Враги, Преступник, Запреты..."
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-red-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Special Rules */}
                  <div className="space-y-1">
                    <label className="font-serif font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Изменения и особые правила:
                    </label>
                    <textarea
                      rows={2}
                      value={customSpecialRules}
                      onChange={(e) => setCustomSpecialRules(e.target.value)}
                      placeholder="Модификаторы Человечности, Силы Крови или ограничения кормления..."
                      className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded text-xs text-zinc-200 font-serif focus:border-purple-500 focus:outline-none transition-colors placeholder:text-zinc-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Save button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAddCustomStyleToList}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-amber-700/60 hover:border-amber-500 text-amber-200 font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>Добавить в список стилей охоты</span>
                    </button>
                    <p className="text-[10.5px] text-zinc-500 text-center mt-1 font-sans">
                      Сохраняет стиль со всеми характеристиками для быстрого выбора в будущем
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard Style Details */
                standardStyle && (
                  <div className="space-y-3.5">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <span className="font-serif font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Описание из книги правил V5:
                      </span>
                      <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                        {standardStyle.description}
                      </p>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-1">
                      <span className="font-serif font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Специализация:
                      </span>
                      <div className="text-zinc-200 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                        {standardStyle.specialization}
                      </div>
                    </div>

                    {/* Disciplines */}
                    <div className="space-y-1">
                      <span className="font-serif font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Дисциплины (выберите одну на выбор для +1 точки):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {standardStyle.disciplines.map((d, i) => (
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

                    {/* Merits and Flaws Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Advantages / Merits */}
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          Преимущества:
                        </span>
                        <div className="text-zinc-200 leading-relaxed bg-sky-950/20 p-2.5 rounded-lg border border-sky-900/30 min-h-[58px]">
                          {standardStyle.advantages}
                        </div>
                      </div>

                      {/* Flaws */}
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          Недостатки:
                        </span>
                        <div className="text-zinc-200 leading-relaxed bg-red-950/20 p-2.5 rounded-lg border border-red-900/30 min-h-[58px]">
                          {standardStyle.flaws}
                        </div>
                      </div>
                    </div>

                    {/* Changes & Special Rules */}
                    {standardStyle.specialRules && (
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                          <Flame className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          Изменения и особые правила:
                        </span>
                        <div className="text-zinc-200 leading-relaxed bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/30">
                          {standardStyle.specialRules}
                        </div>
                      </div>
                    )}
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
                    ? customName.trim() || 'Свой стиль охоты'
                    : standardStyle?.name}
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
                    {isAnyCustom ? 'Применить стиль охоты' : 'Выбрать этот стиль охоты'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm deletion modal */}
      <ConfirmModal
        isOpen={!!styleToDelete}
        onClose={() => setStyleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удаление стиля охоты"
        message={`Вы действительно хотите удалить стиль охоты «${styleToDelete?.name}» из сохраненных шаблонов?\n\nЭто действие удалит его из списка быстрого выбора.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive={true}
      />
    </>
  );
};
