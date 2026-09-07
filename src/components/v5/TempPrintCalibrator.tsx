import React, { useState, useEffect } from 'react';
import { Printer, RotateCcw, Copy, Check, ChevronDown, ChevronUp, Sliders, X, FileText, LayoutGrid } from 'lucide-react';

export interface CalibrationState {
  titleSize: number;        // Размер надписи "ВАМПИРЫ: МАСКАРАД" (px)
  disciplineHeight: number; // Высота блока дисциплин (px)
  meritsRows: number;       // Количество строк преимуществ/недостатков
  bioHeight: number;        // Высота блоков "Внешность" и "История" (px)
  inventoryHeight: number;  // Высота блока "Инвентарь" (px)
  page1Gap: number;         // Отступы Стр. 1 (px)
  page2Gap: number;         // Отступы Стр. 2 (px)
  page3Gap: number;         // Отступы Стр. 3 (px)
  page4Gap: number;         // Отступы Стр. 4 (px)
  page5Gap: number;         // Отступы Стр. 5 (px)
}

export const DEFAULT_CALIBRATION: CalibrationState = {
  titleSize: 24,
  disciplineHeight: 150,
  meritsRows: 17,
  bioHeight: 280,
  inventoryHeight: 140,
  page1Gap: 9,
  page2Gap: 5,
  page3Gap: 9,
  page4Gap: 9,
  page5Gap: 5,
};

export const loadSavedCalibration = (): CalibrationState => {
  try {
    const saved = localStorage.getItem('vtm_temp_print_calibration');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If user had the previous initial defaults (titleSize 21, disciplineHeight 136), upgrade to the new defaults
      if (
        (parsed.titleSize === 21 || !parsed.titleSize) &&
        (parsed.disciplineHeight === 136 || !parsed.disciplineHeight)
      ) {
        try {
          localStorage.setItem('vtm_temp_print_calibration', JSON.stringify(DEFAULT_CALIBRATION));
        } catch {}
        return DEFAULT_CALIBRATION;
      }
      const legacyGap = typeof parsed.verticalGap === 'number' ? parsed.verticalGap : DEFAULT_CALIBRATION.page1Gap;
      const updated: CalibrationState = {
        titleSize: typeof parsed.titleSize === 'number' ? parsed.titleSize : DEFAULT_CALIBRATION.titleSize,
        disciplineHeight: typeof parsed.disciplineHeight === 'number' ? parsed.disciplineHeight : DEFAULT_CALIBRATION.disciplineHeight,
        meritsRows: typeof parsed.meritsRows === 'number' ? parsed.meritsRows : DEFAULT_CALIBRATION.meritsRows,
        bioHeight: typeof parsed.bioHeight === 'number' ? parsed.bioHeight : DEFAULT_CALIBRATION.bioHeight,
        inventoryHeight: typeof parsed.inventoryHeight === 'number' ? parsed.inventoryHeight : DEFAULT_CALIBRATION.inventoryHeight,
        page1Gap: typeof parsed.page1Gap === 'number' ? parsed.page1Gap : legacyGap,
        page2Gap: typeof parsed.page2Gap === 'number' ? parsed.page2Gap : legacyGap,
        page3Gap: typeof parsed.page3Gap === 'number' ? parsed.page3Gap : legacyGap,
        page4Gap: typeof parsed.page4Gap === 'number' ? parsed.page4Gap : legacyGap,
        page5Gap: typeof parsed.page5Gap === 'number' ? (parsed.page5Gap === 9 ? 5 : parsed.page5Gap) : DEFAULT_CALIBRATION.page5Gap,
      };
      try {
        localStorage.setItem('vtm_temp_print_calibration', JSON.stringify(updated));
      } catch {}
      return updated;
    }
  } catch {}
  return DEFAULT_CALIBRATION;
};

export interface TempPrintCalibratorProps {
  isDark?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
  calibration?: CalibrationState;
  onChangeCalibration?: (calibration: CalibrationState) => void;
}

export const TempPrintCalibrator: React.FC<TempPrintCalibratorProps> = ({
  isDark = true,
  isVisible = true,
  onClose,
  calibration: externalCalibration,
  onChangeCalibration,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'blocks' | 'pages'>('blocks');

  // Internal state fallback if not controlled from parent
  const [internalState, setInternalState] = useState<CalibrationState>(loadSavedCalibration);

  const state = externalCalibration || internalState;

  const updateState = (newState: CalibrationState) => {
    if (onChangeCalibration) {
      onChangeCalibration(newState);
    } else {
      setInternalState(newState);
    }
    try {
      localStorage.setItem('vtm_temp_print_calibration', JSON.stringify(newState));
    } catch {}
  };

  const updateField = (field: keyof CalibrationState, val: number) => {
    const safeVal = Math.max(1, isNaN(val) ? 0 : val);
    updateState({
      ...state,
      [field]: safeVal,
    });
  };

  const handleReset = () => {
    updateState(DEFAULT_CALIBRATION);
  };

  const handleCopy = () => {
    const text = [
      `=== КАЛИБРОВКА ПЕЧАТИ VTM V5 ===`,
      `1. Заголовок «Вампиры: Маскарад»: ${state.titleSize}px`,
      `2. Высота блока дисциплин: ${state.disciplineHeight}px`,
      `3. Строки преимуществ/недостатков: ${state.meritsRows} строк`,
      `4. Высота блоков Внешность/История: ${state.bioHeight}px`,
      `5. Высота блока Инвентарь: ${state.inventoryHeight}px`,
      `6. Вертикальные отступы по страницам:`,
      `   - Стр. 1 (Основные): ${state.page1Gap}px`,
      `   - Стр. 2 (Кровь и Преимущества): ${state.page2Gap}px`,
      `   - Стр. 3 (Биография): ${state.page3Gap}px`,
      `   - Стр. 4 (Заметки): ${state.page4Gap}px`,
      `   - Стр. 5 (Правила): ${state.page5Gap}px`,
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Derived styling dimensions
  const subtitleSize = Math.max(7, Math.round(state.titleSize * 0.58));
  const ankhSize = Math.max(8, Math.round(state.titleSize * 0.78));
  const logoHeight = Math.max(16, Math.round(state.titleSize * 1.9));
  const logoMaxWidth = Math.max(120, Math.round(state.titleSize * 12.5));
  const powerRowHeight = Math.max(12, Math.round((state.disciplineHeight - 44) / 5));
  const powerTextSize = Math.max(8.5, Math.min(12, +(state.disciplineHeight * 0.077).toFixed(1)));

  return (
    <>
      {/* Dynamic print stylesheet applying calibrated overrides during @media print */}
      <style id="vtm-temp-print-calibration-styles">{`
        @media print {
          /* 1. Заголовок "ВАМПИРЫ: МАСКАРАД" и логотип */
          .print-calib-title {
            font-size: ${state.titleSize}px !important;
            line-height: 1.1 !important;
          }
          .print-calib-subtitle {
            font-size: ${subtitleSize}px !important;
            line-height: 1.1 !important;
          }
          .print-calib-ankh {
            font-size: ${ankhSize}px !important;
          }
          .print-calib-logo {
            height: ${logoHeight}px !important;
            max-width: ${logoMaxWidth}px !important;
          }

          /* 2. Высота блока и карточек дисциплин (Стр. 1) */
          .print-calib-disc-card {
            height: ${state.disciplineHeight}px !important;
            min-height: ${state.disciplineHeight}px !important;
            max-height: ${state.disciplineHeight}px !important;
          }
          .print-calib-disc-power-row {
            height: ${powerRowHeight}px !important;
          }
          .print-calib-disc-power-text {
            font-size: ${powerTextSize}px !important;
          }

          /* 3. СТРАНИЦА 1: Вертикальные отступы */
          .sheet-page-1 .print-calib-header {
            margin-bottom: ${Math.round(state.page1Gap * 1.2)}px !important;
            padding-bottom: ${Math.round(state.page1Gap * 0.8)}px !important;
          }
          .sheet-page-1 .print-calib-section-divider {
            margin-top: ${state.page1Gap}px !important;
            margin-bottom: ${state.page1Gap}px !important;
          }
          .sheet-page-1 .print-calib-grid-gap {
            row-gap: ${state.page1Gap}px !important;
            margin-top: ${state.page1Gap}px !important;
            margin-bottom: ${state.page1Gap}px !important;
          }
          .sheet-page-1 .print-calib-track-block {
            row-gap: ${Math.max(2, Math.round(state.page1Gap * 0.75))}px !important;
            margin-top: ${state.page1Gap}px !important;
            margin-bottom: ${state.page1Gap}px !important;
          }
          .sheet-page-1 .print-calib-track-col {
            gap: ${Math.max(2, Math.round(state.page1Gap * 0.75))}px !important;
          }
          .sheet-page-1 .print-calib-disciplines-section {
            margin-top: ${state.page1Gap}px !important;
          }
          .sheet-page-1 .print-calib-disciplines-grid {
            row-gap: ${state.page1Gap}px !important;
            margin-top: ${state.page1Gap}px !important;
            margin-bottom: ${state.page1Gap}px !important;
            gap: ${Math.max(4, Math.round(state.page1Gap * 1.5))}px !important;
          }

          /* 4. СТРАНИЦА 2: Вертикальные отступы */
          .sheet-page-2 .print-calib-header {
            margin-bottom: ${Math.round(state.page2Gap * 1.2)}px !important;
            padding-bottom: ${Math.round(state.page2Gap * 0.8)}px !important;
          }
          .sheet-page-2 .print-calib-section-divider {
            margin-top: ${state.page2Gap}px !important;
            margin-bottom: ${state.page2Gap}px !important;
          }
          .sheet-page-2 .print-calib-p2-blood-section {
            margin-bottom: ${state.page2Gap}px !important;
          }
          .sheet-page-2 .print-calib-p2-blood-grid {
            gap: ${Math.max(4, Math.round(state.page2Gap * 1.2))}px !important;
          }
          .sheet-page-2 .print-calib-p2-merits-section {
            margin-top: ${state.page2Gap}px !important;
          }
          .sheet-page-2 .print-calib-p2-rows-container {
            row-gap: ${Math.max(1, Math.round(state.page2Gap * 0.5))}px !important;
          }

          /* 5. СТРАНИЦА 3: Вертикальные отступы */
          .sheet-page-3 .print-calib-header {
            margin-bottom: ${Math.round(state.page3Gap * 1.2)}px !important;
            padding-bottom: ${Math.round(state.page3Gap * 0.8)}px !important;
          }
          .sheet-page-3 .print-calib-section-divider {
            margin-top: ${state.page3Gap}px !important;
            margin-bottom: ${state.page3Gap}px !important;
          }
          .sheet-page-3 .print-calib-p3-top-grid {
            margin-top: ${state.page3Gap}px !important;
            margin-bottom: ${state.page3Gap}px !important;
          }
          .sheet-page-3 .print-calib-p3-bio-grid {
            margin-top: ${state.page3Gap}px !important;
            margin-bottom: ${state.page3Gap}px !important;
          }
          .sheet-page-3 .print-calib-p3-inventory-section {
            margin-top: ${state.page3Gap}px !important;
          }
          .sheet-page-3 .print-calib-p3-bio-editor {
            height: ${state.bioHeight}px !important;
            min-height: ${state.bioHeight}px !important;
          }
          .sheet-page-3 .print-calib-p3-inventory-editor {
            height: ${state.inventoryHeight}px !important;
            min-height: ${state.inventoryHeight}px !important;
          }

          /* 6. СТРАНИЦА 4: Вертикальные отступы */
          .sheet-page-4 .print-calib-header {
            margin-bottom: ${Math.round(state.page4Gap * 1.2)}px !important;
            padding-bottom: ${Math.round(state.page4Gap * 0.8)}px !important;
          }
          .sheet-page-4 .print-calib-section-divider {
            margin-top: ${state.page4Gap}px !important;
            margin-bottom: ${state.page4Gap}px !important;
          }
          .sheet-page-4 .print-calib-p4-notes-container {
            margin-top: ${state.page4Gap}px !important;
          }

          /* 7. СТРАНИЦА 5: Вертикальные отступы */
          .sheet-page-5 .print-calib-header {
            margin-bottom: ${Math.round(state.page5Gap * 1.2)}px !important;
            padding-bottom: ${Math.round(state.page5Gap * 0.8)}px !important;
          }
          .sheet-page-5 .print-calib-section-divider {
            margin-top: ${state.page5Gap}px !important;
            margin-bottom: ${state.page5Gap}px !important;
          }
          .sheet-page-5 .print-calib-p5-rules-stack {
            row-gap: ${state.page5Gap}px !important;
            margin-top: ${state.page5Gap}px !important;
            margin-bottom: ${state.page5Gap}px !important;
          }
          .sheet-page-5 .print-calib-p5-rules-card {
            padding: ${Math.max(6, Math.round(state.page5Gap * 1.5))}px !important;
          }
        }
      `}</style>

      {/* Floating control widget at bottom-left */}
      {isVisible && (
        <aside
          aria-label="Панель калибровки параметров печати"
          className={`pointer-events-auto select-none transition-all duration-200 shadow-2xl rounded-md border flex flex-col ${
            isDark
              ? 'bg-zinc-950/95 border-red-900/60 text-zinc-100 backdrop-blur-md shadow-black/80'
              : 'bg-white/95 border-red-800/40 text-zinc-900 backdrop-blur-md shadow-zinc-400'
          }`}
          style={{ maxWidth: '360px', width: isCollapsed ? 'auto' : '360px', maxHeight: '86vh' }}
        >
          {/* Header bar of the widget */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b cursor-pointer shrink-0 ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900/60' : 'border-zinc-200 hover:bg-zinc-100/70'
            }`}
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="font-benguiat font-bold text-xs uppercase tracking-wider text-red-500">
                Калибровка печати
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                title={isCollapsed ? 'Развернуть' : 'Свернуть'}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed((prev) => !prev);
                }}
              >
                {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {onClose && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Скрыть панель (можно включить обратно в Настройках приложения)"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-h-0 flex-1">
              {/* Tab Navigation */}
              <div className={`flex border-b text-[11px] shrink-0 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-100/60'}`}>
                <button
                  type="button"
                  onClick={() => setActiveTab('blocks')}
                  className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'blocks'
                      ? 'border-red-600 text-red-500 font-bold bg-transparent'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Блоки и Строки</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pages')}
                  className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'pages'
                      ? 'border-red-600 text-red-500 font-bold bg-transparent'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Отступы страниц</span>
                </button>
              </div>

              {/* Scrollable controls list */}
              <div className="p-3 space-y-3.5 text-xs overflow-y-auto max-h-[58vh]">
                {activeTab === 'blocks' ? (
                  <>
                    {/* Control 1: Title Size */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">1. Заголовок «Вампиры»</span>
                        <span className="font-mono text-red-500 font-bold">{state.titleSize} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('titleSize', state.titleSize - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Уменьшить на 1 px"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.titleSize}
                          onChange={(e) => updateField('titleSize', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('titleSize', state.titleSize + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Увеличить на 1 px"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Control 2: Disciplines Height */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">2. Блок дисциплин (высота)</span>
                        <span className="font-mono text-red-500 font-bold">{state.disciplineHeight} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('disciplineHeight', state.disciplineHeight - 2)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Уменьшить на 2 px"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.disciplineHeight}
                          onChange={(e) => updateField('disciplineHeight', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('disciplineHeight', state.disciplineHeight + 2)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Увеличить на 2 px"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Control 3: Merits/Flaws Rows Count */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">3. Строки преимуществ / недост.</span>
                        <span className="font-mono text-red-500 font-bold">{state.meritsRows} строк</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('meritsRows', state.meritsRows - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Уменьшить на 1 строку"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={5}
                          max={35}
                          value={state.meritsRows}
                          onChange={(e) => updateField('meritsRows', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('meritsRows', state.meritsRows + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Увеличить на 1 строку"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic">
                        Применяется сразу и на экране, и при печати (по умолч. 17)
                      </p>
                    </div>

                    {/* Control 4: Bio / History Height */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">4. Высота «Внешность» и «История»</span>
                        <span className="font-mono text-red-500 font-bold">{state.bioHeight} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('bioHeight', state.bioHeight - 10)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Уменьшить на 10 px"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step={10}
                          value={state.bioHeight}
                          onChange={(e) => updateField('bioHeight', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('bioHeight', state.bioHeight + 10)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Увеличить на 10 px"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Control 5: Inventory Height */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">5. Высота блока «Инвентарь»</span>
                        <span className="font-mono text-red-500 font-bold">{state.inventoryHeight} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('inventoryHeight', state.inventoryHeight - 10)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Уменьшить на 10 px"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step={10}
                          value={state.inventoryHeight}
                          onChange={(e) => updateField('inventoryHeight', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('inventoryHeight', state.inventoryHeight + 10)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                          title="Увеличить на 10 px"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-zinc-400 font-serif leading-snug pb-1 border-b border-zinc-800">
                      Настройка вертикальных отступов при печати для каждой страницы листа персонажа:
                    </p>

                    {/* Page 1 Gap */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">Стр. 1: Основная (статы, навыки, дисциплины)</span>
                        <span className="font-mono text-red-500 font-bold">{state.page1Gap} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('page1Gap', state.page1Gap - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.page1Gap}
                          onChange={(e) => updateField('page1Gap', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('page1Gap', state.page1Gap + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Page 2 Gap */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">Стр. 2: Кровь и Преимущества</span>
                        <span className="font-mono text-red-500 font-bold">{state.page2Gap} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('page2Gap', state.page2Gap - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.page2Gap}
                          onChange={(e) => updateField('page2Gap', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('page2Gap', state.page2Gap + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Page 3 Gap */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">Стр. 3: Биография и Инвентарь</span>
                        <span className="font-mono text-red-500 font-bold">{state.page3Gap} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('page3Gap', state.page3Gap - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.page3Gap}
                          onChange={(e) => updateField('page3Gap', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('page3Gap', state.page3Gap + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Page 4 Gap */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">Стр. 4: Заметки и Дневник</span>
                        <span className="font-mono text-red-500 font-bold">{state.page4Gap} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('page4Gap', state.page4Gap - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.page4Gap}
                          onChange={(e) => updateField('page4Gap', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('page4Gap', state.page4Gap + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Page 5 Gap */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif">
                        <span className="font-medium">Стр. 5: Памятка правил V5</span>
                        <span className="font-mono text-red-500 font-bold">{state.page5Gap} px</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('page5Gap', state.page5Gap - 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={state.page5Gap}
                          onChange={(e) => updateField('page5Gap', parseInt(e.target.value, 10))}
                          className={`flex-1 h-7 text-center font-mono text-xs border rounded px-1 font-bold ${
                            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateField('page5Gap', state.page5Gap + 1)}
                          className="w-8 h-7 rounded border border-red-900/40 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons footer */}
              <div className={`p-2.5 flex items-center gap-2 border-t shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-1 px-2 rounded bg-red-800 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                  title="Открыть предпросмотр печати (Ctrl+P)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`py-1 px-2 rounded border flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                    copied
                      ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                      : isDark
                        ? 'border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                        : 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  }`}
                  title="Скопировать все параметры калибровки для отправки"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопировано' : 'Копия'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Сбросить все к исходным значениям"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};
