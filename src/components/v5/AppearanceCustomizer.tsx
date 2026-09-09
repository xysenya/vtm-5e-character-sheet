import React, { useState } from 'react';
import {
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  SheetColorSettings,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
  COLOR_PRESETS,
  ColorPreset,
} from '../../types/appearance';

export interface AppearanceCustomizerProps {
  isDark?: boolean;
  isVisible: boolean;
  onClose: () => void;
  customColors: SheetColorSettings;
  onChangeCustomColors: (colors: SheetColorSettings, targetThemeIsDark?: boolean) => void;
  isSheetDark: boolean;
  onToggleSheetDark?: (isDark: boolean) => void;
  onShowAlert?: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => void;
}

export const AppearanceCustomizer: React.FC<AppearanceCustomizerProps> = ({
  isDark = false,
  isVisible,
  onClose,
  customColors,
  onChangeCustomColors,
  isSheetDark,
  onToggleSheetDark,
  onShowAlert,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  const handleColorChange = (key: keyof SheetColorSettings, value: string) => {
    onChangeCustomColors({
      ...customColors,
      [key]: value,
    });
  };

  const handleResetToTheme = () => {
    const defaultForCurrentTheme = isSheetDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
    onChangeCustomColors({ ...defaultForCurrentTheme }, isSheetDark);
  };

  const handleApplyPreset = (preset: ColorPreset) => {
    if (onToggleSheetDark && preset.isDark !== isSheetDark) {
      onToggleSheetDark(preset.isDark);
    }
    onChangeCustomColors({ ...preset.colors }, preset.isDark);
  };

  const handleCopyConfig = () => {
    try {
      const json = JSON.stringify(customColors, null, 2);
      navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onShowAlert) {
        onShowAlert('Палитра скопирована', 'JSON-код текущей палитры скопирован в буфер обмена.', 'success');
      }
    } catch {
      if (onShowAlert) {
        onShowAlert('Ошибка', 'Не удалось скопировать данные в буфер обмена.', 'error');
      }
    }
  };

  const handleImportConfig = () => {
    const input = prompt ? null : null; // Avoid window.prompt
    // We can open a file or paste via modal
  };

  return (
    <>
      {/* Dynamic style sheet that overrides colors on the character sheet */}
      {isEnabled && (
        <style id="vtm-custom-appearance-styles">{`
          /* =========================================================================
             AUXILIARY BUTTONS (PRESERVE STANDARD COLORS - NEVER OVERRIDDEN)
             ========================================================================= */
          #vtm-header-settings-trigger,
          #vtm-toggle-sheet-theme-trigger,
          #vtm-toggle-logo-trigger,
          #vtm-attr-rules-btn,
          #vtm-attr-randomize-btn,
          #vtm-skills-rules-btn,
          #vtm-skills-randomize-btn,
          .vtm-aux-tool-btn {
            background-color: ${isSheetDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
            border-color: ${isSheetDark ? 'rgba(63, 63, 70, 0.8)' : '#d4d4d8'} !important;
            color: ${isSheetDark ? '#d4d4d8' : '#52525b'} !important;
            box-shadow: 0 4px 6px -1px ${isSheetDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)'} !important;
          }

          #vtm-toggle-sheet-theme-trigger {
            color: ${isSheetDark ? '#fbbf24' : '#4f46e5'} !important;
          }

          #vtm-header-settings-trigger:hover,
          #vtm-toggle-logo-trigger:hover,
          #vtm-attr-rules-btn:hover,
          #vtm-attr-randomize-btn:hover,
          #vtm-skills-rules-btn:hover,
          #vtm-skills-randomize-btn:hover,
          .vtm-aux-tool-btn:hover {
            color: ${isSheetDark ? '#f87171' : '#b91c1c'} !important;
            border-color: ${isSheetDark ? '#dc2626' : '#b91c1c'} !important;
            background-color: ${isSheetDark ? '#27272a' : '#f4f4f5'} !important;
          }

          #vtm-toggle-sheet-theme-trigger:hover {
            color: ${isSheetDark ? '#fde047' : '#6366f1'} !important;
            border-color: ${isSheetDark ? '#f59e0b' : '#6366f1'} !important;
            background-color: ${isSheetDark ? '#27272a' : '#f4f4f5'} !important;
          }

          #vtm-header-settings-trigger svg,
          #vtm-toggle-sheet-theme-trigger svg,
          #vtm-toggle-logo-trigger svg,
          #vtm-attr-rules-btn svg,
          #vtm-attr-randomize-btn svg,
          #vtm-skills-rules-btn svg,
          #vtm-skills-randomize-btn svg,
          .vtm-aux-tool-btn svg {
            fill: none !important;
            stroke: currentColor !important;
          }

          #vtm-header-settings-trigger svg *,
          #vtm-toggle-sheet-theme-trigger svg *,
          #vtm-toggle-logo-trigger svg *,
          #vtm-attr-rules-btn svg *,
          #vtm-attr-randomize-btn svg *,
          #vtm-skills-rules-btn svg *,
          #vtm-skills-randomize-btn svg *,
          .vtm-aux-tool-btn svg * {
            fill: none !important;
            stroke: currentColor !important;
          }

          /* Keep rules popups styling clear and standard */
          #vtm-attr-rules-popup,
          #vtm-skills-rules-popup {
            background-color: ${isSheetDark ? 'rgba(9, 9, 11, 0.96)' : 'rgba(255, 255, 255, 0.98)'} !important;
            border-color: ${isSheetDark ? 'rgba(127, 29, 29, 0.8)' : '#a1a1aa'} !important;
            color: ${isSheetDark ? '#e4e4e7' : '#18181b'} !important;
          }
          #vtm-attr-rules-popup p,
          #vtm-skills-rules-popup p,
          #vtm-skills-rules-popup div {
            color: ${isSheetDark ? '#e4e4e7' : '#18181b'} !important;
          }

          /* =========================================================================
             CHARACTER SHEET PALETTE OVERRIDES
             ========================================================================= */
          /* 1. Character sheet page background & base text */
          .page-break {
            background-color: ${customColors.sheetBg} !important;
            color: ${customColors.textPrimary} !important;
          }

          /* 2. Primary text color across sheet text elements (strictly excluding modals) */
          .page-break p:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break label:not([class*="text-red-"]):not([class*="text-rose-"]):not([class*="font-benguiat"]):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break td:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break th:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break .v5-track-label,
          .page-break .header-info-field,
          .page-break .print-white-bg,
          .page-break div[class*="font-serif"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break div[class*="text-zinc-"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break div[class*="text-black"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break div[class*="text-white"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break span:not(.custom-accent-colored):not(.section-divider-diamond):not(.print-calib-ankh):not(.sheet-header-ankh):not(.sheet-header-subtitle-masquerade):not([class*="text-red-"]):not([class*="text-rose-"]):not([class*="font-benguiat"]):not(.vtm-aux-tool-btn *):not(#vtm-header-settings-trigger *):not(#vtm-toggle-sheet-theme-trigger *):not(#vtm-toggle-logo-trigger *):not(#vtm-attr-rules-btn *):not(#vtm-attr-randomize-btn *):not(#vtm-skills-rules-btn *):not(#vtm-skills-randomize-btn *):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break button:not(.vtm-aux-tool-btn):not(#vtm-header-settings-trigger):not(#vtm-toggle-sheet-theme-trigger):not(#vtm-toggle-logo-trigger):not(#vtm-attr-rules-btn):not(#vtm-attr-randomize-btn):not(#vtm-skills-rules-btn):not(#vtm-skills-randomize-btn):not([role="radio"]):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *):not([class*="text-red-"]):not([class*="text-rose-"]):not([class*="font-benguiat"]) {
            color: ${customColors.textPrimary} !important;
          }

          /* Attributes (Сила, Ловкость...) and Skills (Драка, Ремесло...) MUST be strictly Primary Text Color */
          .page-break .vtm-trait-btn,
          .page-break button.vtm-trait-btn,
          .page-break button.vtm-attribute-btn,
          .page-break button.vtm-skill-btn {
            color: ${customColors.textPrimary} !important;
          }
          .page-break .vtm-trait-btn:hover,
          .page-break button.vtm-trait-btn:hover,
          .page-break button.vtm-attribute-btn:hover,
          .page-break button.vtm-skill-btn:hover {
            color: ${customColors.textAccent} !important;
          }

          /* Header title "ВАМПИРЫ" is ALWAYS strictly PRIMARY text color */
          .page-break .sheet-header-title-vampires,
          .page-break h1.sheet-header-title-vampires {
            color: ${customColors.textPrimary} !important;
          }

          /* Header subtitle "† М А С К А Р А Д †" is ALWAYS strictly ACCENT text color (independent of clan) */
          .page-break .sheet-header-subtitle-masquerade,
          .page-break span.sheet-header-subtitle-masquerade,
          .page-break .sheet-header-ankh {
            color: ${customColors.textAccent} !important;
          }
          .page-break .sheet-header-line-left {
            background: linear-gradient(to right, transparent, ${customColors.textAccent}) !important;
          }
          .page-break .sheet-header-line-right {
            background: linear-gradient(to left, transparent, ${customColors.textAccent}) !important;
          }

          /* 3. Input fields, textareas, selects (strictly on character sheet, never inside modals) */
          .page-break input:not([type=checkbox]):not(.match-sheet-bg):not(.vtm-skill-specialty-input):not(.vtm-merit-input):not(.vtm-flaw-input):not(.vtm-kindred-info-input):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break select:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break textarea:not(.match-sheet-bg):not(.vtm-kindred-info-input):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *) {
            background-color: ${customColors.inputBg} !important;
            border-color: ${customColors.borderColor} !important;
            color: ${customColors.textPrimary} !important;
          }

          .page-break input::placeholder,
          .page-break textarea::placeholder {
            color: ${customColors.textPrimary}88 !important;
          }

          /* Text fields of skills, merits/flaws, and kindred info must seamlessly match the sheet background across all themes */
          .page-break input.match-sheet-bg,
          .page-break textarea.match-sheet-bg,
          .page-break div.match-sheet-bg,
          .page-break .match-sheet-bg,
          .page-break .vtm-skill-specialty-input,
          .page-break .vtm-merit-input,
          .page-break .vtm-flaw-input,
          .page-break .vtm-kindred-info-input,
          .page-break .vtm-kindred-info-section input,
          .page-break .vtm-kindred-info-section textarea,
          .page-break .vtm-kindred-info-section [contenteditable] {
            background-color: transparent !important;
            background: transparent !important;
            border-color: ${customColors.borderColor} !important;
            color: ${customColors.textPrimary} !important;
          }

          /* 4. Accent text: Headings, Benguiat subheaders, section divider titles (strictly excluding header title and trait buttons) */
          .page-break h1:not(.sheet-header-title-vampires):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break h2:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break h3:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break h4:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break .section-divider-title,
          .page-break .print-calib-subtitle,
          .page-break .v5-accent-text,
          .page-break .benguiat-accent,
          .page-break .font-benguiat:not(.sheet-header-title-vampires):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break div[class*="font-benguiat"]:not(.sheet-header-title-vampires):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break span[class*="font-benguiat"]:not(.sheet-header-title-vampires):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break label[class*="font-benguiat"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break [class*="text-red-"]:not(#vtm-attr-rules-popup *):not(#vtm-skills-rules-popup *):not(.vtm-aux-tool-btn *):not(.vtm-trait-btn):not(.vtm-trait-btn *):not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break [class*="text-rose-"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *) {
            color: ${customColors.textAccent} !important;
          }

          /* 5. Accent graphical elements (Dividers, Diamonds, Ankhs, Splatters, Accent borders) */
          .page-break .section-divider-diamond,
          .page-break .print-calib-ankh {
            color: ${customColors.graphicsAccent} !important;
          }

          .page-break .section-divider-line-left {
            background: linear-gradient(to right, transparent, ${customColors.graphicsAccent}88, ${customColors.graphicsAccent}) !important;
          }

          .page-break .section-divider-line-right {
            background: linear-gradient(to left, transparent, ${customColors.graphicsAccent}88, ${customColors.graphicsAccent}) !important;
          }

          .page-break .vtm-header-blood-splatter path,
          .page-break .vtm-header-blood-splatter circle {
            fill: ${customColors.graphicsAccent} !important;
          }

          .page-break [class*="border-red-900"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break [class*="border-red-800"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *),
          .page-break [class*="border-red-700"]:not([role="dialog"] *):not(#vtm-modal-container *):not(.vtm-modal-root *) {
            border-color: ${customColors.graphicsAccent} !important;
          }

          /* Notebook paper ruling lines on SheetPage4 */
          .page-break textarea.notebook-ruled-textarea {
            background-image: linear-gradient(to bottom, transparent 27px, ${customColors.graphicsAccent}44 27px, ${customColors.graphicsAccent}44 28px) !important;
          }

          /* Discipline cards and container panels */
          .page-break .print-calib-disc-card {
            background-color: ${customColors.inputBg} !important;
            border-color: ${customColors.borderColor} !important;
          }

          /* 6. Regular Dots (Attributes, Skills, Humanity filled boxes) */
          .page-break button[role="radio"][aria-checked="true"]:not(.custom-accent-dot):not(.v5-accent-dot):not(.bg-red-800) {
            background-color: ${customColors.dotsRegular} !important;
            border-color: ${customColors.dotsRegular} !important;
            box-shadow: 0 0 0 1px ${customColors.dotsRegular} !important;
          }

          /* 7. Accent Dots (Disciplines, Blood Potency, etc.) */
          .page-break .v5-accent-dot button[role="radio"][aria-checked="true"],
          .page-break button[role="radio"][aria-checked="true"].bg-red-800,
          .page-break button[role="radio"][aria-checked="true"].active-accent-dot {
            background-color: ${customColors.dotsAccent} !important;
            border-color: ${customColors.dotsAccent} !important;
            box-shadow: 0 0 0 1px ${customColors.dotsAccent} !important;
          }

          /* Unfilled dots border */
          .page-break button[role="radio"][aria-checked="false"] {
            border-color: ${customColors.borderColor} !important;
          }

          /* =========================================================================
             MODAL SHIELD: COMPLETE IMMUNITY FOR MODAL DIALOGS
             ========================================================================= */
          .vtm-modal-root,
          .vtm-modal-root * {
            box-sizing: border-box;
          }
        `}</style>
      )}

      {/* Floating control widget at bottom-left */}
      {isVisible && (
        <aside
          aria-label="Панель настройки внешнего вида листа"
          className={`pointer-events-auto select-none transition-all duration-200 shadow-2xl rounded-md border flex flex-col ${
            isDark
              ? 'bg-zinc-950/95 border-red-900/60 text-zinc-100 backdrop-blur-md shadow-black/80'
              : 'bg-white/95 border-red-800/40 text-zinc-900 backdrop-blur-md shadow-zinc-400'
          }`}
          style={{ maxWidth: '360px', width: isCollapsed ? 'auto' : '360px', maxHeight: '80vh' }}
        >
          {/* Header bar */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b cursor-pointer shrink-0 ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900/60' : 'border-zinc-200 hover:bg-zinc-100/70'
            }`}
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-benguiat font-bold text-xs uppercase tracking-wider text-red-500">
                Внешний вид листа
              </span>
              {/* Active color preview dot strip */}
              <div className="flex items-center gap-0.5 ml-1">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: customColors.sheetBg }}
                  title="Фон"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: customColors.textAccent }}
                  title="Акцент"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: customColors.dotsAccent }}
                  title="Точки"
                />
              </div>
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
              <button
                type="button"
                className="p-1 rounded hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Закрыть панель (скрыть)"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when expanded */}
          {!isCollapsed && (
            <div className="p-3 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3 text-xs">
              {/* Presets Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-red-500">
                    <Sparkles className="w-3 h-3" />
                    Готовые палитры:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToTheme}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Сбросить цвета к текущей теме листа"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Сброс
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`flex items-center gap-2 p-1.5 rounded border text-[11px] font-medium transition-all text-left cursor-pointer ${
                        isDark
                          ? 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-red-800/60 text-zinc-200'
                          : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-red-600/60 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: preset.colors.sheetBg }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: preset.colors.textAccent }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: preset.colors.dotsAccent }}
                        />
                      </div>
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Color Controls */}
              <div className="space-y-2 pt-1 border-t border-red-900/20">
                <span className="text-[11px] font-semibold text-red-500 block uppercase tracking-wider font-benguiat">
                  Настройка цветов
                </span>

                {/* 1. Sheet Background */}
                <ColorRow
                  label="Цвет фона листа"
                  color={customColors.sheetBg}
                  onChange={(val) => handleColorChange('sheetBg', val)}
                  isDark={isDark}
                  suggestions={['#faf8f5', '#0f0f11', '#180709', '#0c0a1a', '#f4ece1', '#ffffff']}
                />

                {/* 2. Primary Text */}
                <ColorRow
                  label="Основной цвет текста"
                  color={customColors.textPrimary}
                  onChange={(val) => handleColorChange('textPrimary', val)}
                  isDark={isDark}
                  suggestions={['#18181b', '#f4f4f5', '#292524', '#fce7f3', '#000000', '#d1d5db']}
                />

                {/* 3. Accent Text */}
                <ColorRow
                  label="Акцентный цвет текста"
                  color={customColors.textAccent}
                  onChange={(val) => handleColorChange('textAccent', val)}
                  isDark={isDark}
                  suggestions={['#881337', '#dc2626', '#b91c1c', '#f43f5e', '#a855f7', '#10b981']}
                />

                {/* 4. Graphics Accent */}
                <ColorRow
                  label="Акцентная графика (линии, рамки)"
                  color={customColors.graphicsAccent}
                  onChange={(val) => handleColorChange('graphicsAccent', val)}
                  isDark={isDark}
                  suggestions={['#991b1b', '#b91c1c', '#dc2626', '#e11d48', '#7c3aed', '#059669']}
                />

                {/* 5. Regular Dots */}
                <ColorRow
                  label="Цвет основных точек"
                  color={customColors.dotsRegular}
                  onChange={(val) => handleColorChange('dotsRegular', val)}
                  isDark={isDark}
                  suggestions={['#18181b', '#f4f4f5', '#44403c', '#fda4af', '#c4b5fd', '#6ee7b7']}
                />

                {/* 6. Accent Dots */}
                <ColorRow
                  label="Цвет акцентных точек"
                  color={customColors.dotsAccent}
                  onChange={(val) => handleColorChange('dotsAccent', val)}
                  isDark={isDark}
                  suggestions={['#dc2626', '#ef4444', '#991b1b', '#e11d48', '#9333ea', '#047857']}
                />

                {/* 7. Input Fields Background */}
                <ColorRow
                  label="Фон полей ввода"
                  color={customColors.inputBg}
                  onChange={(val) => handleColorChange('inputBg', val)}
                  isDark={isDark}
                  suggestions={['#ffffff', '#18181b', '#220a0d', '#14112c', '#faf5ee', '#0b1e15']}
                />

                {/* 8. Borders and Dividers */}
                <ColorRow
                  label="Цвет границ и рамок"
                  color={customColors.borderColor}
                  onChange={(val) => handleColorChange('borderColor', val)}
                  isDark={isDark}
                  suggestions={['#d4d4d8', '#27272a', '#4c0519', '#3b0764', '#d6c7b2', '#064e3b']}
                />
              </div>

              {/* Footer Tools */}
              <div className="flex items-center justify-between pt-2 border-t border-red-900/20 text-[11px]">
                <button
                  type="button"
                  onClick={handleCopyConfig}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                      : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                  title="Скопировать палитру в формате JSON"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToTheme}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-300'
                      : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                  }`}
                  title="Сбросить все цвета к значениям по умолчанию"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить всё</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};

interface ColorRowProps {
  label: string;
  color: string;
  onChange: (val: string) => void;
  isDark: boolean;
  suggestions?: string[];
}

const ColorRow: React.FC<ColorRowProps> = ({
  label,
  color,
  onChange,
  isDark,
  suggestions = [],
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Native Color Picker triggered by Swatch */}
          <label className="relative cursor-pointer flex items-center">
            <input
              type="color"
              value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span
              className="w-5 h-5 rounded-sm border shadow-xs transition-transform hover:scale-110 block"
              style={{
                backgroundColor: color,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
              title="Нажмите для выбора произвольного цвета"
            />
          </label>

          {/* Hex code input */}
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className={`w-16 px-1 py-0.5 text-[10.5px] font-mono text-center rounded border transition-colors ${
              isDark
                ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-red-500'
                : 'bg-white border-zinc-300 text-zinc-900 focus:border-red-600'
            }`}
          />
        </div>
      </div>

      {/* Suggested Quick Colors */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-1 pl-0.5">
          {suggestions.map((sColor, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(sColor)}
              className="w-3.5 h-3.5 rounded-full border border-black/20 transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: sColor }}
              title={sColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
