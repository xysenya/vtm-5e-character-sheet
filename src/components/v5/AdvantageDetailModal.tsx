import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../Modal';
import { AdvantageItem, renderPointsDots, formatPointsLabel } from '../../data/advantages';
import {
  saveCustomAdvantage,
  deleteCustomAdvantage,
  findAdvantageByName,
  getCustomAdvantages,
} from '../../data/customAdvantages';
import {
  BookOpen,
  Check,
  AlertTriangle,
  PlusCircle,
  Trash2,
  Bookmark,
  Sparkles,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { V5Dots } from './V5Controls';

export interface AdvantageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialKind?: 'advantage' | 'disadvantage';
  initialDots?: number;
  initialDescription?: string;
  initialSection?: string;
  slotIndex?: number | null;
  customItemId?: string;
  onSaveToSheet?: (data: {
    slotIndex: number | null;
    name: string;
    dots: number;
    kind: 'advantage' | 'disadvantage';
    description: string;
  }) => void;
  onAddedToCatalog?: (item: AdvantageItem) => void;
  onOpenCatalog?: () => void;
}

export const AdvantageDetailModal: React.FC<AdvantageDetailModalProps> = ({
  isOpen,
  onClose,
  initialName = '',
  initialKind = 'advantage',
  initialDots = 1,
  initialDescription = '',
  initialSection = 'Пользовательские',
  slotIndex = null,
  customItemId,
  onSaveToSheet,
  onAddedToCatalog,
  onOpenCatalog,
}) => {
  // Form state for editing / custom
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<'advantage' | 'disadvantage'>(initialKind);
  const [dots, setDots] = useState<number>(initialDots);
  const [description, setDescription] = useState(initialDescription);
  const [section, setSection] = useState(initialSection);
  const [requirements, setRequirements] = useState('');

  // Confirmation message toast inside modal
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Mode: view official vs custom edit
  const [isEditingOverride, setIsEditingOverride] = useState(false);

  // Find if item exists in official catalog or custom
  const officialItem = useMemo(() => {
    if (!name || !name.trim()) return null;
    const clean = name.trim().toLowerCase();
    const found = findAdvantageByName(clean, kind);
    // If it's a custom advantage, treat as custom
    if (found && found.category_id !== 'custom') {
      return found;
    }
    return null;
  }, [name, kind]);

  const customItem = useMemo(() => {
    if (customItemId) {
      const list = getCustomAdvantages();
      return list.find((i) => i.id === customItemId) || null;
    }
    if (!name || !name.trim()) return null;
    const clean = name.trim().toLowerCase();
    const list = getCustomAdvantages();
    return (
      list.find((i) => i.name.trim().toLowerCase() === clean && i.kind === kind) || null
    );
  }, [customItemId, name, kind]);

  const isOfficial = !!officialItem && !isEditingOverride && !customItemId;

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setKind(initialKind);
      setDots(initialDots);
      setDescription(initialDescription);
      setSection(initialSection || 'Пользовательские');
      setRequirements('');
      setFeedbackMessage(null);
      setIsConfirmDeleteOpen(false);
      setIsEditingOverride(false);

      if (customItemId) {
        const list = getCustomAdvantages();
        const found = list.find((i) => i.id === customItemId);
        if (found) {
          setName(found.name);
          setKind(found.kind);
          setDots(typeof found.points === 'number' ? found.points : 1);
          setDescription(found.description);
          setSection(found.section || 'Пользовательские');
          setRequirements(found.requirements || '');
        }
      } else if (initialName.trim()) {
        const queryKind: 'advantage' | 'disadvantage' = initialKind === 'disadvantage' ? 'disadvantage' : 'advantage';
        const found = findAdvantageByName(initialName.trim(), queryKind);
        if (found) {
          if (found.category_id === 'custom') {
            setName(found.name);
            setKind(found.kind);
            setDots(typeof found.points === 'number' ? found.points : initialDots);
            setDescription(found.description);
            setSection(found.section || 'Пользовательские');
            setRequirements(found.requirements || '');
          } else {
            // Official item
            if (!initialDescription) {
              setDescription('');
            }
          }
        }
      }
    }
  }, [isOpen, initialName, initialKind, initialDots, initialDescription, initialSection, customItemId]);

  // Handle Save to Sheet
  const handleSaveToSheet = () => {
    if (onSaveToSheet) {
      onSaveToSheet({
        slotIndex,
        name: name.trim() || (isOfficial ? officialItem?.name || '' : 'Без названия'),
        dots,
        kind,
        description: description.trim(),
      });
    }
    onClose();
  };

  // Handle Add / Update in Custom Catalog
  const handleAddToCatalog = () => {
    if (!name.trim()) {
      setFeedbackMessage('Пожалуйста, укажите название преимущества или недостатка');
      return;
    }

    const saved = saveCustomAdvantage({
      id: customItem?.id || customItemId,
      name: name.trim(),
      kind,
      points: dots,
      description: description.trim(),
      requirements: requirements.trim() || null,
      section: section.trim() || 'Пользовательские',
    });

    setFeedbackMessage('✓ Успешно сохранено в пользовательский каталог!');
    if (onAddedToCatalog) {
      onAddedToCatalog(saved);
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Handle Delete from Custom Catalog
  const handleDeleteFromCatalog = () => {
    if (customItem?.id) {
      deleteCustomAdvantage(customItem.id);
      setIsConfirmDeleteOpen(false);
      setFeedbackMessage('Черта удалена из каталога');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="vtm-advantage-detail-modal"
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-bold text-base sm:text-lg text-zinc-100">
            {isOfficial
              ? 'Описание из каталога'
              : customItem || customItemId
              ? 'Пользовательская черта'
              : 'Преимущество / Недостаток'}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
              kind === 'advantage'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                : 'bg-red-950/80 text-red-300 border-red-700/80'
            }`}
          >
            {kind === 'advantage' ? 'Преимущество' : 'Недостаток'}
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
      bodyClassName="p-5 sm:p-6 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1"
    >
      <div className="space-y-4 text-zinc-200">
        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-600/70 text-emerald-200 text-xs font-serif flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            CASE 1: Official Catalog Item View
           ----------------------------------------------------------------------- */}
        {isOfficial && officialItem ? (
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-100">
                    {officialItem.name}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-0.5 font-serif">
                    {officialItem.section ? `Раздел: ${officialItem.section} • ` : ''}
                    {officialItem.category}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono text-base font-bold tracking-widest px-2.5 py-1 rounded border inline-block ${
                      officialItem.kind === 'advantage'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-red-950/60 border-red-800 text-red-300'
                    }`}
                  >
                    {renderPointsDots(officialItem.points) || '—'}
                  </span>
                  <div className="text-[11px] text-zinc-400 mt-1 font-serif">
                    {formatPointsLabel(officialItem.points)}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {officialItem.requirements && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2 break-words">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block font-serif">Требования:</span>
                    <span>{officialItem.requirements}</span>
                  </div>
                </div>
              )}

              {/* Sources */}
              {officialItem.sources && officialItem.sources.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Источники:</span>
                  {officialItem.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 text-[11px]"
                    >
                      {s.ru}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Official Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-semibold block">
                Официальное описание
              </span>
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-serif whitespace-pre-line max-h-[300px] overflow-y-auto custom-scrollbar break-words">
                {officialItem.description}
              </div>
            </div>

            {/* Sheet row dots setting & personal notes */}
            {slotIndex !== null && (
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif text-zinc-300">
                    Уровень в листе персонажа:
                  </span>
                  <div className="flex items-center gap-2">
                    <V5Dots value={dots} onChange={setDots} isDark min={0} max={5} size="sm" />
                    <span className="text-xs font-mono text-zinc-400 w-4 text-right">
                      {dots}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-zinc-400 font-serif block">
                    Личные заметки персонажа (опционально):
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Например: куплено на предыстории..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600 font-serif"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditingOverride(true)}
                className="px-3 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-serif flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Создать редактируемую копию в пользовательском каталоге"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Сделать копию для редактирования</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif cursor-pointer transition-colors"
                >
                  Закрыть
                </button>
                {slotIndex !== null && (
                  <button
                    type="button"
                    onClick={handleSaveToSheet}
                    className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-serif font-bold shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Сохранить в лист</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* -----------------------------------------------------------------------
              CASE 2: Custom / Non-catalog Item Edit & Creation
             ----------------------------------------------------------------------- */
          <div className="space-y-4">
            {/* 1. Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-zinc-300 block">
                Название преимущества / недостатка <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-red-600 font-serif"
                autoFocus
              />
            </div>

            {/* 2. Type and Level Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-zinc-300 block">
                  Тип черты
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setKind('advantage')}
                    className={`py-1.5 px-2 rounded-md text-xs font-serif font-bold transition-all cursor-pointer ${
                      kind === 'advantage'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Преимущество
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('disadvantage')}
                    className={`py-1.5 px-2 rounded-md text-xs font-serif font-bold transition-all cursor-pointer ${
                      kind === 'disadvantage'
                        ? 'bg-red-950 text-red-300 border border-red-700/80 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Недостаток
                  </button>
                </div>
              </div>

              {/* Dots Level Picker */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-zinc-300">
                    Уровень (точки)
                  </label>
                  <span className="text-xs font-mono text-zinc-400">{dots} точ.</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 min-h-[38px]">
                  <div className="flex items-center gap-1.5">
                    <V5Dots value={dots} onChange={setDots} isDark min={0} max={5} size="md" />
                  </div>
                  <span className="font-mono text-sm tracking-widest text-zinc-300 font-bold">
                    {renderPointsDots(dots) || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Section and Requirements (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-serif text-zinc-400 block">
                  Раздел / Категория
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="Пользовательские"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600 font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif text-zinc-400 block">
                  Требования (если есть)
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Например: только Вентру..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600 font-serif"
                />
              </div>
            </div>

            {/* 4. Description Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-zinc-300 block">
                Описание <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите механику преимущества или недостатка, правила применения и эффект в игре..."
                rows={5}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs sm:text-[13px] text-zinc-200 focus:outline-none focus:border-red-600 font-serif leading-relaxed custom-scrollbar resize-y break-words"
              />
            </div>

            {/* 5. Delete Confirmation Modal (Inline) */}
            {isConfirmDeleteOpen && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700/80 space-y-2 text-xs font-serif animate-fade-in">
                <div className="font-bold text-red-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Удалить черту из пользовательского каталога?</span>
                </div>
                <p className="text-red-300/80">
                  Это действие необратимо. Черта исчезнет из раздела «Пользовательские достоинства» каталога.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDeleteFromCatalog}
                    className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-bold cursor-pointer transition-colors"
                  >
                    Да, удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(false)}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* 6. Action Buttons Bar */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {customItem && !isConfirmDeleteOpen && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-serif flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Удалить из каталога</span>
                  </button>
                )}

                {/* Button: Add to Catalog */}
                <button
                  type="button"
                  onClick={handleAddToCatalog}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Сохранить в постоянный раздел каталога «Пользовательские достоинства»"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>{customItem ? 'Обновить в каталоге' : 'Добавить в каталог'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-serif cursor-pointer transition-colors"
                >
                  Закрыть
                </button>

                {slotIndex !== null && (
                  <button
                    type="button"
                    onClick={handleSaveToSheet}
                    className={`px-4 py-2 rounded-lg text-xs font-serif font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                      kind === 'advantage'
                        ? 'bg-emerald-800 hover:bg-emerald-700 shadow-emerald-950'
                        : 'bg-red-800 hover:bg-red-700 shadow-red-950'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Сохранить в лист</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
