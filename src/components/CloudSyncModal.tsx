import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CharacterSheet } from '../types';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Copy,
  Check,
  Share2,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Database,
  Download,
  Upload,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  syncCode: string;
  isSyncing: boolean;
  lastSyncedAt?: string;
  onManualSync: () => Promise<void>;
  onLoadByCode: (code: string) => Promise<boolean>;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onShowAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  id?: string;
}

interface CloudCharSummary {
  syncCode: string;
  name: string;
  clan: string;
  player: string;
  chronicle: string;
  updatedAt: string;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  sheet,
  syncCode,
  isSyncing,
  lastSyncedAt,
  onManualSync,
  onLoadByCode,
  onExportJson,
  onImportJson,
  onShowAlert,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [cloudList, setCloudList] = useState<CloudCharSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Fetch list of characters in cloud storage
  const fetchCloudCharacters = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch('/api/characters');
      if (res.ok) {
        const data = await res.json();
        if (data.characters) {
          setCloudList(data.characters);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud list:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudCharacters();
    }
  }, [isOpen]);

  const handleCopyCode = async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      onShowAlert('Код синхронизации', syncCode, 'info');
    }
  };

  const handleCopyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sync', syncCode);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      onShowAlert('Ссылка синхронизации', url.toString(), 'info');
    }
  };

  const handleLoadByCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setLoadingCode(true);
    const success = await onLoadByCode(inputCode.trim());
    setLoadingCode(false);
    if (success) {
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <Modal
      id="vtm-cloud-sync-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-red-500" />
          Облачная синхронизация между устройствами
        </span>
      }
      subtitle="Синхронизируйте лист персонажа на телефоне, ноутбуке или планшете"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Current Sync Code & Share Link */}
        <div className="bg-[#0a0a0a] p-5 rounded-xl border border-red-900/30 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-sans">
                Уникальный код персонажа в облаке:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black font-mono tracking-widest text-red-500">
                  {syncCode || 'Генерация...'}
                </span>
                <button
                  id="btn-copy-sync-code"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  title="Скопировать код"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">Статус:</span>
              <div className="flex items-center gap-1.5 justify-end mt-1 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  }`}
                />
                <span className="text-zinc-300 font-medium">
                  {isSyncing ? 'Синхронизация...' : 'Облако активно'}
                </span>
              </div>
              {lastSyncedAt && (
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Сохранено: {lastSyncedAt}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              id="btn-manual-sync-now"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-red-950/70 hover:bg-red-900 border border-red-900/80 disabled:opacity-50 text-red-200 text-xs font-semibold rounded-lg shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <CloudUpload className="w-4 h-4" />
              {isSyncing ? 'Сохранение...' : 'Синхронизировать сейчас'}
            </button>

            <button
              id="btn-copy-share-url"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-800 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-red-500" />
              {copiedLink ? 'Ссылка скопирована!' : 'Скопировать ссылку для другого устройства'}
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-serif">
            Откройте эту ссылку на телефоне или планшете во время игры — лист загрузится мгновенно, а любые изменения автоматически сохраняются в единое облако!
          </p>
        </div>

        {/* Load by Code Section */}
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-red-900/20 space-y-3">
          <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
            <CloudDownload className="w-4 h-4 text-red-400" />
            Загрузить персонажа по коду синхронизации
          </h3>
          <form onSubmit={handleLoadByCodeSubmit} className="flex gap-2">
            <input
              id="input-sync-code-load"
              type="text"
              placeholder="Например: VTM-7X9K"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 uppercase font-mono tracking-wider bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-red-900 focus:outline-none"
            />
            <button
              id="btn-submit-load-code"
              type="submit"
              disabled={loadingCode || !inputCode.trim()}
              className="px-5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-900/90 disabled:opacity-50 text-red-200 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1"
            >
              {loadingCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              Загрузить
            </button>
          </form>
        </div>

        {/* Cloud Chronicle Vault - saved characters list */}
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-red-900/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Database className="w-4 h-4 text-red-500" />
              Хранилище Сородичей в облаке ({cloudList.length})
            </h3>
            <button
              onClick={fetchCloudCharacters}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>

          <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-2">
            {cloudList.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2 text-center font-serif">
                В облачном хранилище пока сохранен только текущий персонаж.
              </p>
            ) : (
              cloudList.map((item) => {
                const isCurrent = item.syncCode === syncCode;
                return (
                  <div
                    key={item.syncCode}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-red-950/40 border-red-900/60'
                        : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-serif text-white">
                          {item.name}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 text-red-400 font-mono border border-zinc-800">
                          {item.syncCode}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-sans">
                            Текущий
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {item.clan} • {item.chronicle || 'Без хроники'}
                      </span>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={async () => {
                          const ok = await onLoadByCode(item.syncCode);
                          if (ok) onClose();
                        }}
                        className="px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-800 cursor-pointer"
                      >
                        Загрузить
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* JSON Import/Export fallback */}
        <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <span>Резервная копия на диск:</span>
          <div className="flex items-center gap-2">
            <button
              id="btn-export-json"
              onClick={onExportJson}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать JSON
            </button>
            <label className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Загрузить JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
