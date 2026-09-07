import React, { useState } from 'react';
import { Modal } from './Modal';
import { CharacterSheet } from '../types';
import {
  AI_CHARACTER_PROMPT_TEMPLATE,
  parseCharacterJson,
} from '../utils/characterJson';
import {
  Sparkles,
  Copy,
  Check,
  Code2,
  AlertCircle,
  FileCheck,
  ClipboardPaste,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface QuickJsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessParsed: (character: CharacterSheet) => void;
}

export const QuickJsonImportModal: React.FC<QuickJsonImportModalProps> = ({
  isOpen,
  onClose,
  onSuccessParsed,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(AI_CHARACTER_PROMPT_TEMPLATE);
      } else {
        const ta = document.createElement('textarea');
        ta.value = AI_CHARACTER_PROMPT_TEMPLATE;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (e) {
      console.warn('Failed to copy prompt:', e);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setJsonText(text);
          setErrorMessage(null);
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleClear = () => {
    setJsonText('');
    setErrorMessage(null);
  };

  const handleConfirmImport = () => {
    setErrorMessage(null);
    const res = parseCharacterJson(jsonText);
    if (!res.success || !res.character) {
      setErrorMessage(res.error || 'Не удалось разобрать JSON персонажа.');
      return;
    }

    onSuccessParsed(res.character);
    onClose();
  };

  return (
    <Modal
      id="vtm-quick-json-import-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-red-500" />
          Быстрый импорт JSON массива / Промпт для ИИ
        </span>
      }
      subtitle="Вставка JSON-массива персонажа и готовый промпт для генерации через нейросеть"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Top: AI Prompt Banner */}
        <div className="bg-[#121016] border border-red-900/40 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-serif font-bold text-xs sm:text-sm text-white">
                Генерация персонажа через нейросетевого ассистента
              </span>
            </div>

            <button
              type="button"
              id="btn-copy-ai-prompt"
              onClick={handleCopyPrompt}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                copiedPrompt
                  ? 'bg-emerald-800 text-emerald-100 border border-emerald-600'
                  : 'bg-red-950/90 hover:bg-red-900 text-red-100 border border-red-800 hover:border-red-600'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Промпт скопирован!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-red-300" />
                  <span>Скопировать промт</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-300 font-serif leading-relaxed">
            Нажмите на эту кнопку, чтобы скопировать промт с запросом для вашего нейросетевого
            ассистена с просьбой сгенерировать для вас json массив для вашего персонажа.
            Отредактируйте промт согласно вашим пожеланиям, но не меняйте структуру шаблона массива.
          </p>

          {/* Collapsible Prompt Preview */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-serif cursor-pointer transition-colors"
            >
              {showPromptPreview ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-red-500" />
                  Скрыть текст промпта
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-red-500" />
                  Посмотреть шаблон промпта
                </>
              )}
            </button>

            {showPromptPreview && (
              <div className="mt-2 p-3 bg-black/80 rounded-lg border border-zinc-800 max-h-48 overflow-y-auto font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {AI_CHARACTER_PROMPT_TEMPLATE}
              </div>
            )}
          </div>
        </div>

        {/* Textarea Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="textarea-quick-json"
              className="text-xs font-serif font-bold text-zinc-300 flex items-center gap-1.5"
            >
              <span>Вставьте JSON-массив или объект персонажа:</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-serif cursor-pointer transition-colors px-2 py-0.5 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                title="Вставить из буфера обмена"
              >
                <ClipboardPaste className="w-3 h-3 text-red-400" />
                Вставить из буфера
              </button>
              {jsonText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 font-serif cursor-pointer transition-colors px-2 py-0.5 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                  title="Очистить поле ввода"
                >
                  <Trash2 className="w-3 h-3" />
                  Очистить
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="textarea-quick-json"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              rows={9}
              placeholder={`Вставьте сюда JSON персонажа (например: [ { "info": { "name": "...", "clan": "brujah" }, ... } ])`}
              className="w-full bg-[#0a0a0c] text-zinc-200 font-mono text-xs p-3 rounded-lg border border-zinc-700 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none leading-relaxed resize-y placeholder:text-zinc-600 shadow-inner"
            />
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs font-serif text-red-200 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 whitespace-pre-wrap">{errorMessage}</div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-red-900/20">
          <span className="text-[11px] text-zinc-500 font-serif hidden sm:inline">
            Поддерживается формат одиночного объекта или массива с персонажем
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              id="btn-confirm-quick-json-import"
              onClick={handleConfirmImport}
              disabled={!jsonText.trim()}
              className={`px-5 py-2 text-xs font-serif font-bold rounded-lg shadow-lg cursor-pointer flex items-center gap-1.5 transition-all ${
                jsonText.trim()
                  ? 'bg-red-900 hover:bg-red-800 text-white border border-red-700 hover:border-red-500'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Подтвердить импорт</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
