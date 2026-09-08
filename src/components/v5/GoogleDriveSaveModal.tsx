import React, { useState, useEffect } from 'react';
import { CloudUpload, X, Loader2, FileCheck, CopyPlus } from 'lucide-react';
import { CharacterSheet } from '../../types';

interface GoogleDriveSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  activeFile?: { id: string; name: string } | null;
  activeDriveFile?: { id: string; name: string } | null;
  onSave: (options: { isNewFile: boolean; customFileName?: string }) => Promise<void>;
  isDark?: boolean;
}

export const GoogleDriveSaveModal: React.FC<GoogleDriveSaveModalProps> = ({
  isOpen,
  onClose,
  sheet,
  activeFile,
  activeDriveFile,
  onSave,
}) => {
  const effectiveActiveFile = activeFile ?? activeDriveFile ?? null;
  const defaultName = `${sheet.info.name?.trim() || 'Безымянный Сородич'} - VtM5e.json`;
  const [fileName, setFileName] = useState(defaultName);
  const [saveMode, setSaveMode] = useState<'update' | 'new'>(effectiveActiveFile ? 'update' : 'new');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultName);
      setSaveMode(effectiveActiveFile ? 'update' : 'new');
      setErrorMessage(null);
    }
  }, [isOpen, sheet.info.name, effectiveActiveFile]);

  if (!isOpen) return null;

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSave({
        isNewFile: saveMode === 'new',
        customFileName: fileName.trim() || defaultName,
      });
      onClose();
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setErrorMessage(err?.message || 'Не удалось сохранить лист на Google Диск.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/95 p-6 relative transition-all ring-1 ring-red-950/40 vtm-modal-root"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-100">Сохранить на Google Диск</h3>
            <p className="text-xs text-zinc-400">В папку VtM5eSheet</p>
          </div>
        </div>

        {/* Character Brief Info */}
        <div className="p-3 rounded-lg border border-zinc-800/90 bg-zinc-900/80 mb-4 text-xs">
          <div className="font-semibold text-sm mb-1 text-red-400">
            {sheet.info.name || 'Безымянный Сородич'}
          </div>
          <div className="text-zinc-400">
            Клан: <span className="font-medium text-zinc-200">{sheet.info.clan}</span> •{' '}
            {sheet.info.generation}-е поколение
          </div>
        </div>

        {/* Mode selector if active file exists */}
        {activeFile && (
          <div className="space-y-2 mb-4">
            <label className="text-xs font-semibold text-zinc-300">Режим сохранения:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaveMode('update')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                  saveMode === 'update'
                    ? 'border-red-600 bg-red-950/40 text-red-300 font-semibold ring-1 ring-red-600/70'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>Обновить файл</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 truncate">{activeFile.name}</span>
              </button>

              <button
                type="button"
                onClick={() => setSaveMode('new')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                  saveMode === 'new'
                    ? 'border-red-600 bg-red-950/40 text-red-300 font-semibold ring-1 ring-red-600/70'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CopyPlus className="w-3.5 h-3.5 text-red-400" />
                  <span>Создать новый</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">Новый файл на Диске</span>
              </button>
            </div>
          </div>
        )}

        {/* File name input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 text-zinc-300">
            Имя файла на Google Диске:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-hidden focus:border-red-600"
            placeholder="Имя персонажа - VtM5e.json"
          />
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                <span>Сохранить</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
