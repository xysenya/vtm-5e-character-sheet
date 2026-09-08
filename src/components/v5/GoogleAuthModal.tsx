import React, { useState } from 'react';
import { Cloud, ShieldCheck, FolderPlus, X, Loader2, AlertCircle } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: () => Promise<void>;
  isDark?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthorize,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onAuthorize();
      onClose();
    } catch (err: any) {
      console.error('Google authorization error:', err);
      // Friendly message for popup closed by user or actual network errors
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Окно авторизации было закрыто. Попробуйте снова.');
      } else {
        setErrorMessage(err?.message || 'Не удалось выполнить авторизацию. Попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/90 p-6 relative transition-all ring-1 ring-red-950/40 vtm-modal-root"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-100">Авторизация через Google Диск</h3>
            <p className="text-xs text-zinc-400">Синхронизация и хранение персонажей</p>
          </div>
        </div>

        {/* User requested explanation text */}
        <div className="p-4 rounded-lg border border-zinc-800/90 bg-zinc-900/90 text-sm leading-relaxed mb-4 text-zinc-300">
          <p className="mb-3">
            При желании Вы можете авторизоваться через Google Диск. На Вашем Google Диске будет создана папка{' '}
            <strong className="text-red-400 font-semibold font-mono tracking-wide">VtM5eSheet</strong>, в
            которой будут храниться Ваши созданные персонажи. Вы в любой момент сможете загружать созданных персонажей
            для игры.
          </p>
          <p className="flex items-start gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>Приложение получит доступ только к этой папке, у него не будет доступа к другим Вашим файлам.</span>
          </p>
        </div>

        {/* Highlight points */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <FolderPlus className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Автоматическое создание папки «VtM5eSheet»</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Моментальное сохранение изменений в файл при игре</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            Отмена
          </button>

          {/* Official styled Google Sign In Button */}
          <button
            type="button"
            onClick={handleAuthClick}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2.5 shadow-md bg-white hover:bg-zinc-100 text-zinc-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                <span>Подключение к Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Авторизоваться через Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
