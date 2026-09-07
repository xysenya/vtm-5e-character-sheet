import React from 'react';
import { Modal } from './Modal';
import { Settings, Sun, Moon, Sliders, Check, FileText, Palette } from 'lucide-react';

export interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onToggleDarkTheme: (isDark: boolean) => void;
  isSheetDark: boolean;
  onToggleSheetDark: (isDark: boolean) => void;
  showPrintCalibrator: boolean;
  onTogglePrintCalibrator: (enabled: boolean) => void;
  showAppearanceCustomizer: boolean;
  onToggleAppearanceCustomizer: (enabled: boolean) => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onToggleDarkTheme,
  isSheetDark,
  onToggleSheetDark,
  showPrintCalibrator,
  onTogglePrintCalibrator,
  showAppearanceCustomizer,
  onToggleAppearanceCustomizer,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      id="vtm-app-settings-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" />
          Настройки приложения
        </span>
      }
      subtitle="Управление внешним видом сайта, бланком персонажа и инструментами печати"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {/* SECTION 1: SITE THEME */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold uppercase tracking-wider text-red-500 text-[11px] sm:text-xs">
              Тема интерфейса сайта
            </span>
            <span className="text-[11px] text-zinc-400">
              {isDarkTheme ? 'Тёмная тема' : 'Светлая тема'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Light Site Theme Card */}
            <button
              type="button"
              onClick={() => onToggleDarkTheme(false)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                !isDarkTheme
                  ? 'border-red-600 bg-red-950/20 text-white shadow-md ring-1 ring-red-600/50'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
                  <Sun className={`w-4 h-4 ${!isDarkTheme ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>Светлая</span>
                </div>
                {!isDarkTheme && <Check className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Классический светлый интерфейс с бумажной фактурой и высокой контрастностью.
              </p>
            </button>

            {/* Dark Site Theme Card */}
            <button
              type="button"
              onClick={() => onToggleDarkTheme(true)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isDarkTheme
                  ? 'border-red-600 bg-red-950/20 text-white shadow-md ring-1 ring-red-600/50'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
                  <Moon className={`w-4 h-4 ${isDarkTheme ? 'text-amber-300' : 'text-zinc-500'}`} />
                  <span>Тёмная</span>
                </div>
                {isDarkTheme && <Check className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Готический ночной нуар с глубокими чёрными тонами и кроваво-красными акцентами.
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: CHARACTER SHEET THEME */}
        <div className="space-y-2 pt-2 border-t border-red-900/20">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold uppercase tracking-wider text-red-500 text-[11px] sm:text-xs">
              Тема листа персонажа
            </span>
            <span className="text-[11px] text-zinc-400">
              {isSheetDark ? 'Тёмный бланк' : 'Светлый бланк'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Light Sheet Card */}
            <button
              type="button"
              onClick={() => onToggleSheetDark(false)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                !isSheetDark
                  ? 'border-red-600 bg-red-950/20 text-white shadow-md ring-1 ring-red-600/50'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
                  <FileText className={`w-4 h-4 ${!isSheetDark ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>Светлый бланк</span>
                </div>
                {!isSheetDark && <Check className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Классический пергаментный лист для удобного чтения и подготовки к печати.
              </p>
            </button>

            {/* Dark Sheet Card */}
            <button
              type="button"
              onClick={() => onToggleSheetDark(true)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSheetDark
                  ? 'border-red-600 bg-red-950/20 text-white shadow-md ring-1 ring-red-600/50'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
                  <FileText className={`w-4 h-4 ${isSheetDark ? 'text-red-500' : 'text-zinc-500'}`} />
                  <span>Тёмный бланк</span>
                </div>
                {isSheetDark && <Check className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Тёмный вампирский свиток с подсвеченными полями и рубиновыми элементами.
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 3: PRINT CALIBRATION MENU CHECKBOX */}
        <div className="space-y-2 pt-2 border-t border-red-900/20">
          <span className="font-serif font-bold uppercase tracking-wider text-red-500 text-[11px] sm:text-xs block">
            Инструменты печати
          </span>
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              showPrintCalibrator
                ? 'border-red-600/70 bg-red-950/20 text-white'
                : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-300'
            }`}
          >
            <input
              type="checkbox"
              checked={showPrintCalibrator}
              onChange={(e) => onTogglePrintCalibrator(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-red-500" />
                <span className="font-serif font-semibold text-xs sm:text-sm">
                  Включить меню калибровки печати
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    showPrintCalibrator
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {showPrintCalibrator ? 'Включено' : 'Отключено'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-serif">
                Отображает плавающую панель в левом нижнем углу экрана для оперативной подгонки
                размера заголовка, высоты блока дисциплин и вертикальных отступов при печати.
              </p>
            </div>
          </label>
        </div>

        {/* SECTION 4: APPEARANCE CUSTOMIZER MENU CHECKBOX */}
        <div className="space-y-2 pt-2 border-t border-red-900/20">
          <span className="font-serif font-bold uppercase tracking-wider text-red-500 text-[11px] sm:text-xs block">
            Кастомизация бланка
          </span>
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              showAppearanceCustomizer
                ? 'border-red-600/70 bg-red-950/20 text-white'
                : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-300'
            }`}
          >
            <input
              type="checkbox"
              checked={showAppearanceCustomizer}
              onChange={(e) => onToggleAppearanceCustomizer(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-red-500" />
                <span className="font-serif font-semibold text-xs sm:text-sm">
                  Включить меню настройки внешнего вида
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    showAppearanceCustomizer
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {showAppearanceCustomizer ? 'Включено' : 'Отключено'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-serif">
                Отображает плавающее меню в левом нижнем углу экрана для детальной настройки всех
                цветов листа персонажа: основного и акцентного текста, графики, фона и точек.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* MODAL FOOTER */}
      <div className="flex justify-end gap-3 pt-4 mt-3 border-t border-red-900/20">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors cursor-pointer"
        >
          Готово
        </button>
      </div>
    </Modal>
  );
};
