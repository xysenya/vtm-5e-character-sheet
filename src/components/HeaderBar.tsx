import React, { useRef } from 'react';
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
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderBarProps {
  sheet: CharacterSheet;
  theme: ClanTheme;
  activePage?: 'all' | 1 | 2 | 3 | 4 | 5;
  onChangePage?: (page: 'all' | 1 | 2 | 3 | 4 | 5) => void;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJsonFile) {
      onImportJsonFile(file);
    }
    e.target.value = '';
  };
  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b no-print transition-colors ${
      isDark
        ? 'bg-[#0a0a0a]/95 border-red-900/40 text-white'
        : 'bg-[#faf8f5]/95 border-zinc-300 text-zinc-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Clan Badge */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg border-2 flex items-center justify-center p-1 shadow-lg"
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
              className="w-6 h-6 object-contain"
              color={theme.accentColor}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold font-serif tracking-tight flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                <span>{sheet.info.name || 'Безымянный Сородич'}</span>
              </h1>
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-serif font-bold"
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
            <p className="text-[10px] uppercase tracking-[0.18em] text-red-700 font-bold">
              Vampire: The Masquerade V5 • {sheet.info.generation}-е Поколение
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Hidden File Input for JSON import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            id="file-input-import-json"
          />

          {/* Unified JSON Tools Group (Export / Import / AI Prompt) */}
          {(onExportJson || onImportJsonFile || onOpenQuickJsonImport) && (
            <div
              className={`inline-flex items-center rounded-lg border p-0.5 gap-0.5 shadow-xs ${
                isDark
                  ? 'bg-zinc-900 border-zinc-750'
                  : 'bg-white border-zinc-300'
              }`}
            >
              {/* Export JSON Button (Icon: Upload, swapped as requested) */}
              {onExportJson && (
                <button
                  id="btn-nav-export-json"
                  onClick={onExportJson}
                  className={`p-1.5 sm:p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  }`}
                  title="Экспорт листа персонажа в файл .json"
                  aria-label="Экспорт листа персонажа в файл .json"
                >
                  <Upload className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}

              {/* Import JSON File Button (Icon: Download, swapped as requested) */}
              {onImportJsonFile && (
                <button
                  id="btn-nav-import-json-file"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 sm:p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  }`}
                  title="Импорт листа персонажа из файла .json"
                  aria-label="Импорт листа персонажа из файла .json"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                </button>
              )}

              {/* Quick JSON Array / AI Prompt Import Button (Icon: Sparkles) */}
              {onOpenQuickJsonImport && (
                <button
                  id="btn-nav-quick-json-prompt"
                  onClick={onOpenQuickJsonImport}
                  className={`p-1.5 sm:p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  }`}
                  title="Быстрый импорт JSON массива / Промпт для ИИ"
                  aria-label="Быстрый импорт JSON массива / Промпт для ИИ"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}

          {/* Print PDF Button */}
          <button
            id="btn-nav-print-pdf"
            onClick={onOpenPrint}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-zinc-900 hover:bg-white hover:text-black text-zinc-200 border-zinc-700'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900'
            }`}
            title="Печать или экспорт в PDF"
          >
            <Printer className="w-4 h-4 text-zinc-300" />
            <span>Печать / PDF</span>
          </button>

          {/* App Settings Button (Шестеренка справа от кнопки Печать) */}
          <button
            id="btn-nav-app-settings"
            onClick={onOpenSettings}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:text-black'
            }`}
            title="Настройки приложения"
          >
            <Settings className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">Настройки приложения</span>
          </button>

          {/* New / Reset */}
          <button
            id="btn-nav-reset"
            onClick={onResetCharacter}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
              isDark
                ? 'bg-red-950/40 hover:bg-red-900/60 text-red-500 border-red-900/60 hover:text-red-400'
                : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300 hover:text-red-900'
            }`}
            title="Создать нового персонажа по правилам V5"
          >
            <UserPlus className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline font-medium">Новый персонаж</span>
          </button>

          {/* Google Drive Auth or Account Button (Справа от кнопки "Новый персонаж") */}
          {!googleUser ? (
            <button
              id="btn-nav-google-auth"
              onClick={onOpenGoogleAuth}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-blue-400 border-blue-900/50 hover:text-blue-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:text-blue-900'
              }`}
              title="Авторизация через Google Диск"
            >
              <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="hidden sm:inline font-medium">Авторизация через Google Диск</span>
              <span className="sm:hidden font-medium">Google Диск</span>
            </button>
          ) : (
            <button
              id="btn-nav-google-profile"
              onClick={onOpenGoogleDriveManager}
              className={`px-2.5 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-2 shadow-xs ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600'
                  : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:border-zinc-400'
              }`}
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
              <span className="max-w-[110px] sm:max-w-[140px] truncate font-medium">
                {googleUser.displayName || 'Google Диск'}
              </span>
              {!hasGoogleToken ? (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse"
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
          )}
        </div>
      </div>

      {/* Sub-header: Page tabs for V5 sheet layout */}
      {onChangePage && (
        <div className={`border-t px-3 sm:px-6 py-1.5 overflow-x-auto transition-colors ${
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
              { id: 5, label: 'Лист 5: Подсказки' },
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

