import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  Download,
  Play,
  Cloud,
  LogOut,
  Search,
  CheckCircle2,
  FileText,
  AlertTriangle,
  FolderSync,
  Unlink,
  Plus,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DriveCharacterFile } from '../../services/googleDriveService';
import { CLAN_THEMES } from '../../data/clans';
import { ClanId } from '../../types';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => Promise<void>;
  files: DriveCharacterFile[];
  isLoadingFiles: boolean;
  onRefreshFiles: () => Promise<void>;
  activeFile: { id: string; name: string } | null;
  onLoadCharacter: (file: DriveCharacterFile) => Promise<void>;
  onDeleteCharacter: (file: DriveCharacterFile) => void;
  onDetachActiveFile: () => void;
  onOpenSaveModal: () => void;
  hasToken?: boolean;
  onReauthorize?: () => Promise<void>;
  isDark?: boolean;
}

/**
 * Vampire Icon component used as fallback when character has no portrait
 */
const VampireSilhouetteIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Вампир"
  >
    {/* Dark oval background / frame */}
    <circle cx="32" cy="32" r="30" fill="#180407" stroke="#7f1d1d" strokeWidth="2" />
    {/* Vampire Cape Collar */}
    <path
      d="M12 50 C16 34, 20 22, 26 16 C28 26, 36 26, 38 16 C44 22, 48 34, 52 50 C44 56, 20 56, 12 50 Z"
      fill="#450a0a"
    />
    {/* Vampire face silhouette */}
    <path
      d="M23 26 C23 20, 27 15, 32 15 C37 15, 41 20, 41 26 C41 33, 37 39, 32 41 C27 39, 23 33, 23 26 Z"
      fill="#e4e4e7"
    />
    {/* Slicked dark hair / widow's peak */}
    <path
      d="M23 23 C25 18, 28 14, 32 14 C36 14, 39 18, 41 23 C38 19, 35 18, 32 20 C29 18, 26 19, 23 23 Z"
      fill="#09090b"
    />
    {/* Eyes (red glowing dots) */}
    <ellipse cx="28" cy="25" rx="1.5" ry="1" fill="#dc2626" />
    <ellipse cx="36" cy="25" rx="1.5" ry="1" fill="#dc2626" />
    {/* Vampire Fangs */}
    <polygon points="29,32 30,35 31,32" fill="#ffffff" />
    <polygon points="33,32 34,35 35,32" fill="#ffffff" />
    <line x1="28" y1="32" x2="36" y2="32" stroke="#991b1b" strokeWidth="1" />
  </svg>
);

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  files,
  isLoadingFiles,
  onRefreshFiles,
  activeFile,
  onLoadCharacter,
  onDeleteCharacter,
  onDetachActiveFile,
  onOpenSaveModal,
  hasToken = true,
  onReauthorize,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter files by search term
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase().trim();
    return files.filter((f) => {
      const nameMatch = f.name?.toLowerCase().includes(q);
      const charNameMatch = f.summary?.name?.toLowerCase().includes(q);
      const clanMatch = f.summary?.clan?.toLowerCase().includes(q);
      const conceptMatch = f.summary?.concept?.toLowerCase().includes(q);
      return nameMatch || charNameMatch || clanMatch || conceptMatch;
    });
  }, [files, searchQuery]);

  if (!isOpen) return null;

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      onClose();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleReauthClick = async () => {
    if (!onReauthorize) return;
    setIsReauthorizing(true);
    try {
      await onReauthorize();
    } catch (e) {
      console.error('Reauthorization error:', e);
    } finally {
      setIsReauthorizing(false);
    }
  };

  const handleLoadClick = async (file: DriveCharacterFile) => {
    setLoadingFileId(file.id);
    try {
      await onLoadCharacter(file);
      onClose();
    } catch (e) {
      console.error('Failed to load character:', e);
    } finally {
      setLoadingFileId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/95 overflow-hidden transition-all ring-1 ring-red-950/40 vtm-modal-root"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: User Profile & Actions */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google Profile'}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-900 text-white flex items-center justify-center font-bold font-serif text-sm shadow-xs">
                {user.displayName?.charAt(0) || 'V'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]">
                  {user.displayName || 'Google Диск'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/50">
                  VtM5eSheet
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-[250px] sm:max-w-md">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasToken && onReauthorize && (
              <button
                onClick={handleReauthClick}
                disabled={isReauthorizing}
                className="px-3 py-1.5 border border-amber-800/60 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300"
                title="Подтвердить доступ к Google Диску"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>{isReauthorizing ? 'Подключение...' : 'Подключить Диск'}</span>
              </button>
            )}
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="px-3 py-1.5 border border-zinc-800 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              title="Выйти из Google аккаунта"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Missing / Expired token notification banner */}
        {!hasToken && (
          <div className="px-4 py-3 bg-amber-950/50 border-b border-amber-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-amber-200 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold">Требуется подтвердить доступ: </span>
                <span>Сессия Google Диска была сброшена после обновления страницы. Нажмите кнопку справа, чтобы загрузить персонажей.</span>
              </div>
            </div>
            {onReauthorize && (
              <button
                onClick={handleReauthClick}
                disabled={isReauthorizing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-zinc-950 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isReauthorizing ? 'Подключение...' : 'Подключить Google Диск'}</span>
              </button>
            )}
          </div>
        )}

        {/* Active Loaded File Banner (if syncing) */}
        {activeFile && (
          <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-red-300 min-w-0">
              <FolderSync className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <span className="font-semibold text-white">Активный лист: </span>
                <span className="text-red-200">{activeFile.name}</span>
                <span className="hidden sm:inline text-zinc-400 text-[11px] ml-2">
                  (все изменения синхронизируются с Google Диском)
                </span>
              </div>
            </div>
            <button
              onClick={onDetachActiveFile}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Отвязать текущий лист от файла на Диске, чтобы редактировать локально"
            >
              <Unlink className="w-3 h-3 text-amber-400" />
              <span>Отвязать</span>
            </button>
          </div>
        )}

        {/* Controls Bar: Save Current Sheet, Refresh, Search */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/90 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenSaveModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-red-800 hover:bg-red-700 text-white shadow-xs"
              title="Сохранить текущий лист персонажа на Google Диск"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Сохранить текущий лист на Диск</span>
            </button>

            <button
              onClick={!hasToken && onReauthorize ? handleReauthClick : onRefreshFiles}
              disabled={isLoadingFiles || isReauthorizing}
              className="px-3 py-1.5 border border-zinc-800 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
              title="Обновить список файлов с Google Диска"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles || isReauthorizing ? 'animate-spin text-red-500' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, клану..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-hidden focus:border-red-600"
            />
          </div>
        </div>

        {/* Main Body: List of Character Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-zinc-950">
          {isLoadingFiles && files.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
              <p className="text-sm font-medium">Загрузка файлов из папки VtM5eSheet...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <Cloud className="w-12 h-12 text-zinc-600" />
              {searchQuery ? (
                <>
                  <p className="text-sm font-medium text-zinc-300">По запросу «{searchQuery}» ничего не найдено</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-red-400 hover:underline cursor-pointer"
                  >
                    Сбросить поиск
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-300">В папке «VtM5eSheet» пока нет сохраненных персонажей</p>
                  <p className="text-xs max-w-sm text-zinc-500">
                    Нажмите «Сохранить текущий лист на Диск», чтобы сохранить созданного персонажа для дальнейших игр.
                  </p>
                  <button
                    onClick={onOpenSaveModal}
                    className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-800 hover:bg-red-700 text-white cursor-pointer shadow-sm transition-all"
                  >
                    Сохранить текущий лист сейчас
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredFiles.map((file) => {
                const charName = file.summary?.name || file.name.replace(/\.json$/i, '');
                const clanId = (file.summary?.clan as ClanId) || 'brujah';
                const clanTheme = CLAN_THEMES[clanId] || CLAN_THEMES.brujah;
                const portraitUrl = file.summary?.portraitUrl;
                const isCurrentlyActive = activeFile?.id === file.id;
                const isLoadingThis = loadingFileId === file.id;

                const formattedDate = file.modifiedTime
                  ? new Date(file.modifiedTime).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null;

                return (
                  <div
                    key={file.id}
                    className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 shadow-xs ${
                      isCurrentlyActive
                        ? 'border-red-600/90 bg-red-950/30 ring-1 ring-red-600/80'
                        : 'border-zinc-800/90 bg-zinc-900/70 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top part: Portrait + Info */}
                    <div className="flex items-start gap-3">
                      {/* Portrait thumbnail or Vampire icon */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center relative">
                        {portraitUrl ? (
                          <img
                            src={portraitUrl}
                            alt={charName}
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // If image fails, replace with vampire icon
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <VampireSilhouetteIcon className="w-12 h-12" />
                        )}

                        {isCurrentlyActive && (
                          <div
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-red-700 text-white shadow-xs"
                            title="Сейчас загружен в редактор"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm truncate text-zinc-100">
                            {charName}
                          </h4>
                        </div>

                        {/* Clan badge & Generation */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border font-serif"
                            style={{
                              borderColor: clanTheme.accentColor,
                              backgroundColor: clanTheme.accentBg,
                              color: clanTheme.accentColor,
                            }}
                          >
                            {clanTheme.name}
                          </span>
                          {file.summary?.generation && (
                            <span className="text-[10px] text-zinc-400">
                              {file.summary.generation}-е поколение
                            </span>
                          )}
                        </div>

                        {/* Concept or file name */}
                        {file.summary?.concept && (
                          <p className="text-[11px] text-zinc-300 truncate mt-1">
                            {file.summary.concept}
                          </p>
                        )}

                        {/* Date info */}
                        {formattedDate && (
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Изменен: {formattedDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom part: Action buttons */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {/* Delete button */}
                        <button
                          onClick={() => onDeleteCharacter(file)}
                          className="p-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 text-zinc-400 hover:text-red-400 hover:bg-red-950/40"
                          title="Удалить персонажа с Google Диска"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Load character button */}
                        <button
                          onClick={() => handleLoadClick(file)}
                          disabled={isLoadingThis}
                          className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                            isCurrentlyActive
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-red-800 hover:bg-red-700 text-white shadow-xs'
                          }`}
                        >
                          {isLoadingThis ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>{isCurrentlyActive ? 'Загрузить заново' : 'Загрузить для игры'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-800/90 text-center text-[11px] text-zinc-400 shrink-0">
          Файлы персонажей хранятся в формате JSON в папке «VtM5eSheet» на Вашем Google Диске.
        </div>
      </div>
    </div>
  );
};
