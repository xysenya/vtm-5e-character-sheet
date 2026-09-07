import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CharacterSheet } from '../types';
import { Printer, ExternalLink, AlertTriangle } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  isSheetDark?: boolean;
  isInkSaver: boolean;
  onToggleInkSaver: (val: boolean) => void;
  keepTextFieldsLight: boolean;
  onToggleKeepTextFieldsLight: (val: boolean) => void;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  id?: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  sheet,
  isSheetDark = false,
  isInkSaver,
  onToggleInkSaver,
  keepTextFieldsLight,
  onToggleKeepTextFieldsLight,
  onBeforePrint,
  onAfterPrint,
}) => {
  const [isAiStudioIframe, setIsAiStudioIframe] = useState<boolean>(false);

  useEffect(() => {
    try {
      // In a standalone tab/window, window.self === window.top.
      // Inside Google AI Studio preview, the app runs within an iframe sandbox.
      const inIframe = typeof window !== 'undefined' && window.self !== window.top;
      setIsAiStudioIframe(inIframe);
    } catch {
      // Cross-origin iframe throws error when accessing window.top
      setIsAiStudioIframe(true);
    }
  }, []);

  const handleOpenNewPage = () => {
    try {
      localStorage.setItem('vtm_v5_sheet', JSON.stringify(sheet));
      if (sheet.syncCode) {
        localStorage.setItem(`vtm_sheet_${sheet.syncCode}`, JSON.stringify(sheet));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage before opening new tab', e);
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('sync');
      url.searchParams.delete('openPrint');
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTriggerPrint = () => {
    document.documentElement.classList.add('is-printing');
    document.body.classList.add('is-printing');
    if (isInkSaver) {
      document.documentElement.classList.add('print-ink-saver');
      document.body.classList.add('print-ink-saver');
    }
    if (keepTextFieldsLight) {
      document.documentElement.classList.add('print-light-text-fields');
      document.body.classList.add('print-light-text-fields');
    }

    if (onBeforePrint) {
      onBeforePrint();
    }

    onClose();
    setTimeout(() => {
      const cleanup = () => {
        document.documentElement.classList.remove('is-printing');
        document.body.classList.remove('is-printing');
        document.documentElement.classList.remove('print-ink-saver');
        document.body.classList.remove('print-ink-saver');
        document.documentElement.classList.remove('print-light-text-fields');
        document.body.classList.remove('print-light-text-fields');
        window.removeEventListener('afterprint', cleanup);
        if (onAfterPrint) {
          onAfterPrint();
        }
      };

      window.addEventListener('afterprint', cleanup);

      try {
        window.print();
      } catch (e) {
        console.warn('window.print failed:', e);
      } finally {
        // Fallback cleanup in case afterprint event is not supported or missed
        setTimeout(cleanup, 1200);
      }
    }, 250);
  };

  return (
    <Modal
      id="vtm-print-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-red-500" />
          Печать и Экспорт листа персонажа в PDF
        </span>
      }
      subtitle="Подготовка к печати на листах формата A4 или сохранению в векторный PDF"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Google AI Studio / iframe warning & quick action (only visible inside AI Studio embedded iframe) */}
        {isAiStudioIframe && (
          <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ограничение интерфейса Google AI Studio</span>
            </div>
            <p className="text-xs text-amber-200/90 font-serif leading-relaxed">
              Встроенное окно предпросмотра Google AI Studio блокирует диалоговые окна печати браузера.
              Откройте сайт на отдельной вкладке, чтобы распечатать лист или сохранить его в PDF без ограничений.
            </p>
            <button
              type="button"
              id="btn-open-in-new-page-banner"
              onClick={handleOpenNewPage}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-serif font-bold text-xs rounded-lg transition-colors shadow-md cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-black" />
              Открыть на новой странице
            </button>
          </div>
        )}

        {/* Options */}
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-red-900/20 space-y-3">
          <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-widest font-sans">
            Опции оформления для печати:
          </span>

          <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer p-2.5 rounded hover:bg-zinc-950 border border-transparent hover:border-zinc-850 transition-colors">
            <input
              type="checkbox"
              id="checkbox-ink-saver"
              checked={isInkSaver}
              onChange={(e) => onToggleInkSaver(e.target.checked)}
              className="rounded accent-red-600 w-4 h-4 mt-0.5 cursor-pointer"
            />
            <div>
              <strong className="text-white block font-serif">
                Экономичный режим чернил (Ink Saver / Черно-белый)
              </strong>
              <span className="text-zinc-400 font-serif leading-relaxed block mt-1">
                Лист становится черно-белым только в окне печати (чистый белый фон без фоновых заливок и ч/б элементы). В интерфейсе программы оформление остается неизменным.
              </span>
            </div>
          </label>

          {isSheetDark && (
            <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer p-2.5 rounded hover:bg-zinc-950 border border-transparent hover:border-zinc-850 transition-colors">
              <input
                type="checkbox"
                id="checkbox-keep-text-fields-light"
                checked={keepTextFieldsLight}
                onChange={(e) => onToggleKeepTextFieldsLight(e.target.checked)}
                className="rounded accent-red-600 w-4 h-4 mt-0.5 cursor-pointer"
              />
              <div>
                <strong className="text-white block font-serif">
                  Оставить текстовые поля светлыми
                </strong>
                <span className="text-zinc-400 font-serif leading-relaxed block mt-1">
                  Если включить, то при печати в тёмной теме все текстовые поля ввода, блоки описаний и заметки будут со светлым фоном (удобно для рукописных пометок ручкой или карандашом).
                </span>
              </div>
            </label>
          )}

          {/* Theme and Print status banner */}
          <div className="text-[11px] font-serif p-2.5 rounded bg-zinc-950/70 border border-zinc-850 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Текущая тема листа: <strong className="text-white">{isSheetDark ? 'Тёмная' : 'Светлая'}</strong></span>
              <span className={isInkSaver ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                {isInkSaver ? 'Режим печати: Черно-белый (Ink Saver)' : `Режим печати: Цветной (${isSheetDark ? 'Тёмная тема' : 'Светлая тема'})`}
              </span>
            </div>
            {!isInkSaver && isSheetDark && (
              <p className="text-zinc-400 text-[10.5px] leading-tight pt-1 text-amber-200/80">
                💡 При цветной печати тёмной темы убедитесь, что в диалоге браузера включена опция «Фоновые рисунки» (Background graphics).
              </p>
            )}
          </div>
        </div>

        {/* Character brief preview */}
        <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded border border-zinc-850 flex items-center justify-between">
          <span>Персонаж: <strong className="text-white font-serif">{sheet.info.name || 'Безымянный'}</strong> ({sheet.info.clan.toUpperCase()})</span>
          <span>Поколение: <strong className="text-white font-mono">{sheet.info.generation}-е</strong></span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-900/20">
          <div>
            {isAiStudioIframe && (
              <button
                type="button"
                id="btn-open-in-new-page-footer"
                onClick={handleOpenNewPage}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-amber-800/70 text-amber-300 hover:text-amber-200 font-serif font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Открыть лист на отдельной полноэкранной вкладке без ограничений iFrame"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                Открыть на новой странице
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
            >
              Отмена
            </button>
            <button
              id="btn-print-pdf-trigger"
              onClick={handleTriggerPrint}
              className="px-5 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-900/90 text-red-100 font-bold text-xs rounded-lg shadow-lg cursor-pointer flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Открыть диалог печати (PDF)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
