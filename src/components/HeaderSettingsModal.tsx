import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Settings, RotateCcw, Check } from 'lucide-react';

export type HeaderFieldKey =
  | 'name'
  | 'ambition'
  | 'predatorType'
  | 'clan'
  | 'touchstones'
  | 'generation'
  | 'concept'
  | 'chronicleTenet'
  | 'sire'
  | 'occupation'
  | 'mask'
  | 'player'
  | 'chronicle'
  | 'desire'
  | 'purpose'
  | 'conceptDetail'
  | 'princeOrBaron';

export interface HeaderFieldDefinition {
  key: HeaderFieldKey;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select-clan' | 'select-generation' | 'select-predator';
  category: 'Основное' | 'Связи и цели' | 'Хроника и статус';
}

export interface GenerationOption {
  value: number;
  label: string;
}

export const GENERATION_OPTIONS: GenerationOption[] = [
  { value: 4, label: '4-е (Мафусаил)' },
  { value: 5, label: '5-е (Мафусаил)' },
  { value: 6, label: '6-е (Мафусаил)' },
  { value: 7, label: '7-е (Старейшина)' },
  { value: 8, label: '8-е (Старейшина)' },
  { value: 9, label: '9-е (Старейшина)' },
  { value: 10, label: '10-е (Анцилла)' },
  { value: 11, label: '11-е (Анцилла)' },
  { value: 12, label: '12-е (Неонат)' },
  { value: 13, label: '13-е (Неонат)' },
  { value: 14, label: '14-е (Слабокровный)' },
  { value: 15, label: '15-е (Слабокровный)' },
];

export const getGenerationDisplayLabel = (gen?: number): string => {
  const num = Number(gen) || 13;
  const found = GENERATION_OPTIONS.find((g) => g.value === num);
  if (found) return found.label;
  if (num <= 3) return `${num}-е (Патриарх)`;
  if (num >= 16) return `${num}-е (Слабокровный)`;
  return `${num}-е`;
};

export const ALL_HEADER_FIELDS: HeaderFieldDefinition[] = [
  // 9 Default fields
  { key: 'name', label: 'Имя', placeholder: 'Имя вампира', type: 'text', category: 'Основное' },
  { key: 'ambition', label: 'Амбиция', placeholder: 'Главная цель персонажа', type: 'text', category: 'Связи и цели' },
  { key: 'predatorType', label: 'Стиль охоты', placeholder: 'Напр. Налётчик, Искуситель', type: 'select-predator', category: 'Основное' },
  { key: 'clan', label: 'Клан', placeholder: '', type: 'select-clan', category: 'Основное' },
  { key: 'touchstones', label: 'Опора', placeholder: 'Смертный якорь / убеждение', type: 'text', category: 'Связи и цели' },
  { key: 'generation', label: 'Поколение', placeholder: '13-е (Неонат)', type: 'select-generation', category: 'Основное' },
  { key: 'concept', label: 'Амплуа', placeholder: 'Концепт персонажа', type: 'text', category: 'Основное' },
  { key: 'chronicleTenet', label: 'Принцип', placeholder: 'Принцип хроники', type: 'text', category: 'Хроника и статус' },
  { key: 'sire', label: 'Сир', placeholder: 'Имя создателя', type: 'text', category: 'Связи и цели' },

  // Additional 8 fields requested
  { key: 'occupation', label: 'Род занятий', placeholder: 'Профессия или занятие', type: 'text', category: 'Основное' },
  { key: 'mask', label: 'Маска', placeholder: 'Смертная личность / прикрытие', type: 'text', category: 'Основное' },
  { key: 'player', label: 'Имя игрока', placeholder: 'Имя или никнейм игрока', type: 'text', category: 'Основное' },
  { key: 'chronicle', label: 'Хроника', placeholder: 'Название хроники или кампании', type: 'text', category: 'Хроника и статус' },
  { key: 'desire', label: 'Прихоть', placeholder: 'Краткосрочное желание', type: 'text', category: 'Связи и цели' },
  { key: 'purpose', label: 'Цель', placeholder: 'Текущая цель / задача', type: 'text', category: 'Связи и цели' },
  { key: 'conceptDetail', label: 'Концепция', placeholder: 'Общая концепция персонажа', type: 'text', category: 'Основное' },
  { key: 'princeOrBaron', label: 'Принц/Барон', placeholder: 'Правитель домена / барон', type: 'text', category: 'Хроника и статус' },
];

export const HEADER_FIELDS_MAP = ALL_HEADER_FIELDS.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<HeaderFieldKey, HeaderFieldDefinition>
);

// Default header slots matching official V5 Core Rulebook:
// Column 1 (top to bottom): Имя, Хроника, Сир
// Column 2 (top to bottom): Концепция, Цель, Прихоть
// Column 3 (top to bottom): Стиль охоты, Клан, Поколение
// In row-major order (Row 1: Col 1, Col 2, Col 3; Row 2: Col 1, Col 2, Col 3; Row 3: Col 1, Col 2, Col 3):
export const DEFAULT_HEADER_SLOTS: HeaderFieldKey[] = [
  'name',          // Row 1, Col 1 -> Имя
  'conceptDetail', // Row 1, Col 2 -> Концепция
  'predatorType',  // Row 1, Col 3 -> Стиль охоты
  'chronicle',     // Row 2, Col 1 -> Хроника
  'purpose',       // Row 2, Col 2 -> Цель
  'clan',          // Row 2, Col 3 -> Клан
  'sire',          // Row 3, Col 1 -> Сир
  'desire',        // Row 3, Col 2 -> Прихоть
  'generation',    // Row 3, Col 3 -> Поколение
];

interface HeaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlots?: string[];
  onSave: (newSlots: string[]) => void;
  isDark?: boolean;
}

export const HeaderSettingsModal: React.FC<HeaderSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSlots,
  onSave,
  isDark = true,
}) => {
  const [slots, setSlots] = useState<HeaderFieldKey[]>(() => {
    if (currentSlots && currentSlots.length === 9) {
      return currentSlots as HeaderFieldKey[];
    }
    return [...DEFAULT_HEADER_SLOTS];
  });

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentSlots && currentSlots.length === 9) {
        setSlots(currentSlots as HeaderFieldKey[]);
      } else {
        setSlots([...DEFAULT_HEADER_SLOTS]);
      }
    }
  }, [isOpen, currentSlots]);

  const handleSlotChange = (index: number, newKey: HeaderFieldKey) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = newKey;
      return next;
    });
  };

  const handleResetToDefault = () => {
    setSlots([...DEFAULT_HEADER_SLOTS]);
  };

  const handleApply = () => {
    onSave(slots);
    onClose();
  };

  const selectBg = isDark
    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-red-500 focus:bg-zinc-950'
    : 'bg-white border-zinc-300 text-zinc-900 focus:border-red-700 focus:bg-white';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5 text-red-500" />
          <span>Настройка шапки листа</span>
        </div>
      }
      subtitle="Выберите 9 полей в сетке 3×3 (3 колонки по 3 строки). По умолчанию: Колонка 1 (Имя, Хроника, Сир), Колонка 2 (Концепция, Цель, Прихоть), Колонка 3 (Стиль охоты, Клан, Поколение) — как в официальной книге правил V5."
      maxWidth="max-w-3xl"
      id="vtm-header-settings-modal"
    >
      <div className="space-y-4 text-zinc-200">
        {/* Helper callout banner */}
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs font-serif text-zinc-300 flex items-start gap-2.5">
          <span className="text-red-400 font-bold shrink-0 text-sm">ⓘ</span>
          <p className="leading-relaxed">
            Сетка повторяет расположение полей на листе (3 колонки слева направо, сверху вниз). Стандартный порядок V5: <strong>Колонка 1</strong> (Имя, Хроника, Сир), <strong>Колонка 2</strong> (Концепция, Цель, Прихоть), <strong>Колонка 3</strong> (Стиль охоты, Клан, Поколение).
          </p>
        </div>

        {/* 3x3 Select Grid */}
        <div className="bg-zinc-950/80 p-4 sm:p-5 rounded-xl border border-red-900/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {slots.map((fieldKey, index) => {
              const rowNum = Math.floor(index / 3) + 1;
              const colNum = (index % 3) + 1;
              const currentDef = HEADER_FIELDS_MAP[fieldKey] || HEADER_FIELDS_MAP['name'];

              return (
                <div
                  key={index}
                  className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 hover:border-red-900/50 transition-colors flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[11px] font-bold text-red-400 tracking-wider">
                      Колонка {colNum} · Строка {rowNum}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      Слот {index + 1}
                    </span>
                  </div>

                  <label
                    htmlFor={`header-slot-select-${index}`}
                    className="text-[11px] font-serif text-zinc-400"
                  >
                    Поле:
                  </label>

                  <select
                    id={`header-slot-select-${index}`}
                    value={fieldKey}
                    onChange={(e) => handleSlotChange(index, e.target.value as HeaderFieldKey)}
                    className={`w-full px-2.5 py-1.5 rounded border font-serif text-xs cursor-pointer transition-colors ${selectBg}`}
                  >
                    {ALL_HEADER_FIELDS.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[10px] font-serif text-zinc-500 pt-0.5">
                    <span>Тип:</span>
                    <span className="font-mono text-zinc-400">
                      {currentDef.type === 'select-clan'
                        ? 'Выбор клана'
                        : currentDef.type === 'select-generation'
                        ? 'Выбор поколения (4-15)'
                        : currentDef.type === 'number'
                        ? 'Число'
                        : 'Текст'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-serif text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Восстановить стандартные 9 полей (Имя, Амбиция, Стиль охоты, Клан...)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Сбросить по умолчанию</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-serif text-xs transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              id="vtm-save-header-settings-btn"
              onClick={handleApply}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-gradient-to-r from-red-900 via-red-800 to-red-950 hover:from-red-800 hover:to-red-900 text-white font-serif font-bold text-xs tracking-wide border border-red-700/60 shadow-lg shadow-red-950/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
