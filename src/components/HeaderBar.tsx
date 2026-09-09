import React, { useRef, useState } from 'react';
import { ClanTheme, CharacterSheet } from '../types';
import { ClanSymbol } from './ClanSymbol';
import {
  Printer,
  Calculator,
  UserPlus,
  Layers,
  Settings,
  Download,
  Upload,
  Sparkles,
  Cloud,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderBarProps {
  sheet: CharacterSheet;
  theme: ClanTheme;
  activePage?: 'all' | 1 | 2 | 3 | 4 | 5 | 6;
  onChangePage?: (page: 'all' | 1 | 2 | 3 | 4 | 5 | 6) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  onOpenPrint: () => void;
  onOpenSettings: () => void;
  onOpenCreationCalc?: () => void;
  onResetCharacter: () => void;
  onExportJson?: () => void;
  onImportJsonFile?: (file: File) => void;
  onOpenQuickJsonImport?: () => void;
  // Google Drive integration props
  googleUser?: User | null;
  hasGoogleToken?: boolean;
  onOpenGoogleAuth?: () => void;
  onOpenGoogleDriveManager?: () => void;
  isSyncingWithDrive?: boolean;
  activeDriveFileName?: string | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  sheet,
  theme,
  activePage = 'all',
  onChangePage,
  isDark = false,
  onToggleDark,
  onOpenPrint,
  onOpenSettings,
  onOpenCreationCalc,
  onResetCharacter,
  onExportJson,
  onImportJsonFile,
  onOpenQuickJsonImport,
  googleUser,
  hasGoogleToken = true,
  onOpenGoogleAuth,
  onOpenGoogleDriveManager,
  isSyncingWithDrive = false,
  activeDriveFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vtm_header_collapsed_mobile') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vtm_header_collapsed_mobile', String(next));
      } catch {}
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJsonFile) {
      onImportJsonFile(file);
    }
    e.target.value = '';
  };

  // Helper renderers for buttons to ensure balanced 2-row (tablet) and 3-row (mobile) layouts
  const renderJsonTools = (extraClass = '') => {
    if (!onExportJson && !onImportJsonFile && !onOpenQuickJsonImport) return null;
    return (
      <div
        className={`inline-flex items-center h-9 rounded-lg border p-0.5 gap-0.5 shadow-2xs shrink-0 ${
          isDark ? 'bg-zinc-900 border-zinc-750' : 'bg-white border-zinc-300'
        } ${extraClass}`}
      >
        {onExportJson && (
          <button
            id="btn-nav-export-json"
            onClick={onExportJson}
            className={`h-7.5 w-7.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
            title="Экспорт листа персонажа в файл .json"
            aria-label="Экспорт листа персонажа в файл .json"
          >
            <Upload className="w-4 h-4 text-red-500" />
          </button>
        )}
        {onImportJsonFile && (
          <button
            id="btn-nav-import-json-file"
            onClick={() => fileInputRef.current?.click()}
            className={`h-7.5 w-7.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
            title="Импорт листа персонажа из файла .json"
            aria-label="Импорт листа персонажа из файла .json"
          >
            <Download className="w-4 h-4 text-amber-500" />
          </button>
        )}
        {onOpenQuickJsonImport && (
          <button
            id="btn-nav-quick-json-prompt"
            onClick={onOpenQuickJsonImport}
            className={`h-7.5 w-7.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
            title="Быстрый импорт JSON массива / Промпт для ИИ"
            aria-label="Быстрый импорт JSON массива / Промпт для ИИ"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    );
  };

  const renderPrintButton = (extraClass = '', fullLabel = false) => (
    <button
      id="btn-nav-print-pdf"
      onClick={onOpenPrint}
      className={`h-9 px-3 border rounded-lg text-xs font-serif font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
        isDark
          ? 'bg-zinc-900 hover:bg-white hover:text-black text-zinc-200 border-zinc-700'
          : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900'
      } ${extraClass}`}
      title="Печать или экспорт в PDF"
    >
      <Printer className="w-4 h-4 text-zinc-300 shrink-0" />
      <span className="truncate">{fullLabel ? 'Печать / PDF' : 'Печать'}</span>
    </button>
  );

  const renderSettingsButton = (extraClass = '', label = 'Настройки') => (
    <button
      id="btn-nav-app-settings"
      onClick={onOpenSettings}
      className={`h-9 px-3 border rounded-lg text-xs font-serif font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
        isDark
          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
          : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:text-black'
      } ${extraClass}`}
      title="Настройки приложения"
    >
      <Settings className="w-4 h-4 text-red-600 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  const renderNewCharButton = (extraClass = '', label = 'Новый') => (
    <button
      id="btn-nav-reset"
      onClick={onResetCharacter}
      className={`h-9 px-3 border rounded-lg text-xs font-serif font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
        isDark
          ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/60 hover:text-red-300'
          : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300 hover:text-red-900'
      } ${extraClass}`}
      title="Создать нового персонажа по правилам V5"
    >
      <UserPlus className="w-4 h-4 text-red-600 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  const renderGoogleDriveButton = (extraClass = '') => {
    if (!googleUser) {
      return (
        <button
          id="btn-nav-google-auth"
          onClick={onOpenGoogleAuth}
          className={`h-9 px-3 border rounded-lg text-xs font-serif font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800 text-blue-400 border-blue-900/50 hover:text-blue-300'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:text-blue-900'
          } ${extraClass}`}
          title="Авторизация через Google Диск"
        >
          <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">Google Диск</span>
        </button>
      );
    }
    return (
      <button
        id="btn-nav-google-profile"
        onClick={onOpenGoogleDriveManager}
        className={`h-9 px-3 border rounded-lg text-xs font-serif font-medium cursor-pointer transition-all flex items-center justify-center gap-2 shadow-2xs ${
          isDark
            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600'
            : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:border-zinc-400'
        } ${extraClass}`}
        title="Управление персонажами на Google Диске (VtM5eSheet)"
      >
        {googleUser.photoURL ? (
          <img
            src={googleUser.photoURL}
            alt={googleUser.displayName || 'Google Profile'}
            className="w-5 h-5 rounded-full object-cover border border-zinc-400/50 shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {googleUser.displayName?.charAt(0) || 'V'}
          </div>
        )}
        <span className="truncate font-medium">
          {googleUser.displayName || 'Google Диск'}
        </span>
        {!hasGoogleToken ? (
          <span
            className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"
            title="Сессия Google Диска истекла, нажмите для подтверждения"
          />
        ) : isSyncingWithDrive ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" title="Синхронизация..." />
        ) : activeDriveFileName ? (
          <span
            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
            title={`Синхронизируется с файлом: ${activeDriveFileName}`}
          />
        ) : null}
      </button>
    );
  };

  const renderCollapseButton = (idSuffix: string, extraClass = '') => (
    <button
      type="button"
      id={`btn-collapse-header-${idSuffix}`}
      onClick={toggleCollapse}
      className={`h-9 px-3 border rounded-lg text-xs font-serif font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs shrink-0 ${
        isDark
          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
          : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:text-black'
      } ${extraClass}`}
      title="Свернуть шапку сайта"
      aria-label="Свернуть шапку сайта"
    >
      <ChevronUp className="w-3.5 h-3.5 text-red-500 shrink-0" />
      <span className="text-[11px] whitespace-nowrap">Свернуть</span>
    </button>
  );
  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b no-print transition-colors ${
      isDark
        ? 'bg-[#0a0a0a]/95 border-red-900/40 text-white'
        : 'bg-[#faf8f5]/95 border-zinc-300 text-zinc-900 shadow-sm'
    }`}>
      {/* Collapsed Compact Bar for Mobile & Tablet (lg:hidden) */}
      {isCollapsed && (
        <div className="lg:hidden max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg border-2 flex items-center justify-center p-0.5 shrink-0 shadow-xs"
              style={{
                borderColor: theme.accentColor,
                backgroundColor: theme.accentBg,
                color: theme.accentColor,
              }}
            >
              <ClanSymbol
                clan={sheet.info.clan}
                generation={sheet.info.generation}
                className="w-4.5 h-4.5 object-contain"
                color={theme.accentColor}
              />
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-bold font-serif truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {sheet.info.name || 'Безымянный Сородич'}
              </span>
              <span
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full border font-serif font-bold shrink-0 hidden sm:inline-block"
                style={{
                  borderColor: theme.accentColor,
                  backgroundColor: theme.accentBg,
                  color: theme.accentColor,
                }}
              >
                {sheet.info.clan === 'custom' && sheet.info.customClanName
                  ? sheet.info.customClanName
                  : theme.name}
              </span>
            </div>
            <span className={`text-[10px] sm:text-[10.5px] px-1.5 sm:px-2 py-0.5 rounded border font-serif truncate shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-750 text-zinc-400' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
            }`}>
              {String(activePage) === 'all'
                ? 'Все листы'
                : String(activePage) === '1'
                ? 'Лист 1: Персонаж'
                : String(activePage) === '2'
                ? 'Лист 2: Кровь'
                : String(activePage) === '3'
                ? 'Лист 3: Биография'
                : String(activePage) === '4'
                ? 'Лист 4: Заметки'
                : String(activePage) === '5'
                ? 'Лист 5: Схема отношений'
                : 'Лист 6: Подсказки'}
            </span>
          </div>

          <button
            type="button"
            id="btn-expand-header-mobile-tablet"
            onClick={toggleCollapse}
            className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium cursor-pointer transition-all flex items-center gap-1.5 shrink-0 border shadow-xs ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600'
                : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:border-zinc-400'
            }`}
            title="Развернуть шапку сайта"
            aria-label="Развернуть шапку сайта"
          >
            <ChevronDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-sans font-medium">Развернуть</span>
          </button>
        </div>
      )}

      {/* Main Expanded Header Row */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 py-2.5 transition-all ${
        isCollapsed ? 'hidden lg:flex' : 'flex'
      } flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3`}>
        {/* Left / Top Row: Brand & Clan Badge (+ Mobile Collapse Button on < sm) */}
        <div className="flex items-center justify-between gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center p-1 shadow-lg shrink-0"
              style={{
                borderColor: theme.accentColor,
                backgroundColor: theme.accentBg,
                color: theme.accentColor,
              }}
              title={`Клан: ${sheet.info.clan === 'custom' && sheet.info.customClanName ? sheet.info.customClanName : theme.name}`}
            >
              <ClanSymbol
                clan={sheet.info.clan}
                generation={sheet.info.generation}
                className="w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain"
                color={theme.accentColor}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-base font-bold font-serif tracking-tight truncate ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {sheet.info.name || 'Безымянный Сородич'}
                </h1>
                <span
                  className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-serif font-bold shrink-0"
                  style={{
                    borderColor: theme.accentColor,
                    backgroundColor: theme.accentBg,
                    color: theme.accentColor,
                  }}
                >
                  {sheet.info.clan === 'custom' && sheet.info.customClanName
                    ? sheet.info.customClanName
                    : theme.name}
                </span>
              </div>
              <p className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] text-red-700 font-bold truncate">
                Vampire: The Masquerade V5 • {sheet.info.generation}-е Поколение
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          id="file-input-import-json"
        />

        {/* 1. Mobile Buttons Layout (< sm): Exactly 3 balanced rows */}
        <div className="flex sm:hidden flex-col gap-2 w-full pt-1">
          {/* Row 1: JSON Tools (narrow) + Print / PDF (stretched full) */}
          <div className="flex items-center gap-2 w-full">
            {renderJsonTools('shrink-0')}
            {renderPrintButton('flex-1', true)}
          </div>
          {/* Row 2: Settings (50%) + New Character (50%) */}
          <div className="flex items-center gap-2 w-full">
            {renderSettingsButton('flex-1', 'Настройки')}
            {renderNewCharButton('flex-1', 'Новый')}
          </div>
          {/* Row 3: Google Drive (stretched) + Collapse (narrow) */}
          <div className="flex items-center gap-2 w-full">
            {renderGoogleDriveButton('flex-1 min-w-0')}
            {renderCollapseButton('mobile', 'shrink-0')}
          </div>
        </div>

        {/* 2. Tablet Buttons Layout (sm to lg): Exactly 2 balanced rows */}
        <div className="hidden sm:flex lg:hidden flex-col gap-2 w-full pt-1">
          {/* Row 1: JSON Tools (narrow) + Print / PDF (stretched) + Settings (stretched) + Collapse (narrow) */}
          <div className="flex items-center gap-2 w-full">
            {renderJsonTools('shrink-0')}
            {renderPrintButton('flex-1', true)}
            {renderSettingsButton('flex-1', 'Настройки')}
            {renderCollapseButton('tablet', 'shrink-0')}
          </div>
          {/* Row 2: New Character (stretched 1) + Google Drive (stretched 1.3) */}
          <div className="flex items-center gap-2 w-full">
            {renderNewCharButton('flex-1', 'Новый персонаж')}
            {renderGoogleDriveButton('flex-[1.3] min-w-0')}
          </div>
        </div>

        {/* 3. Desktop Buttons Layout (lg+): Single horizontal row on the right */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {renderJsonTools()}
          {renderPrintButton('', false)}
          {renderSettingsButton('', 'Настройки')}
          {renderNewCharButton('', 'Новый')}
          {renderGoogleDriveButton()}
        </div>
      </div>

      {/* Sub-header: Page tabs for V5 sheet layout */}
      {onChangePage && (
        <div className={`border-t px-3 sm:px-6 py-1.5 overflow-x-auto transition-colors ${
          isCollapsed ? 'hidden lg:block' : 'block'
        } ${
          isDark
            ? 'bg-[#0f0f11] border-red-950/60'
            : 'bg-[#f2ece2] border-zinc-300'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs font-serif min-w-max">
            <span className={`text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1 ${
              isDark ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              <Layers className="w-3.5 h-3.5 text-red-700" />
              Листы:
            </span>
            {[
              { id: 'all', label: 'Все листы (Печать / Полный)' },
              { id: 1, label: 'Лист 1: Персонаж' },
              { id: 2, label: 'Лист 2: Преимущества и Кровь' },
              { id: 3, label: 'Лист 3: Биография' },
              { id: 4, label: 'Лист 4: Заметки' },
              { id: 5, label: 'Лист 5: Схема отношений' },
              { id: 6, label: 'Лист 6: Подсказки' },
            ].map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => onChangePage(page.id as any)}
                className={`px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer ${
                  activePage === page.id
                    ? 'bg-red-800 text-white font-bold border border-red-700 shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/80 border border-transparent'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

