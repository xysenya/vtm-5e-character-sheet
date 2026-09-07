import React, { useEffect, useRef } from 'react';
import { CharacterSheet } from '../../types';
import { SheetHeader, SectionDivider } from './SheetHeader';
import { useIsPrinting } from '../../utils/useIsPrinting';
import { Plus } from 'lucide-react';
import { RichTextarea } from './RichTextarea';

interface SheetPage4Props {
  sheet: CharacterSheet;
  onChange: (updated: CharacterSheet) => void;
  isDark?: boolean;
  notesHeight?: number;
}

export const SheetPage4: React.FC<SheetPage4Props> = ({
  sheet,
  onChange,
  isDark = false,
  notesHeight = 880,
}) => {
  const isPrinting = useIsPrinting();
  const ph = (text: string) => (isPrinting ? '' : text);

  // Line calculations: 28px per ruled line, 16px total vertical padding (8px top + 8px bottom)
  const page1MaxLines = Math.max(10, Math.floor((notesHeight - 16) / 28)); // 31 lines for 900px
  const contPageMaxLines = 35; // 35 lines for 1000px continuation page

  // Parse initial pages array from sheet.notesPages or sheet.pageNotes
  const parsePagesFromSheet = (): string[] => {
    if (sheet.notesPages && sheet.notesPages.length > 0) {
      return sheet.notesPages;
    }
    const raw = sheet.pageNotes !== undefined ? sheet.pageNotes : sheet.notes?.otherNotes || '';
    if (!raw) return [''];

    // If text contains our page separator
    if (raw.includes('\n\n--- СТРАНИЦА ')) {
      const parts = raw.split(/\n\n--- СТРАНИЦА \d+ ---\n\n/);
      return parts.length > 0 ? parts : [''];
    }

    // Auto-split legacy long text if it exceeds page 1 max lines
    const lines = raw.split('\n');
    if (lines.length <= page1MaxLines) {
      return [raw];
    }
    const p1 = lines.slice(0, page1MaxLines).join('\n');
    const remaining = [...lines.slice(page1MaxLines)];
    const pagesList = [p1];
    while (remaining.length > 0) {
      pagesList.push(remaining.splice(0, contPageMaxLines).join('\n'));
    }
    return pagesList;
  };

  const pages = parsePagesFromSheet();
  const textareaRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update pages and keep sheet.pageNotes and sheet.notes.otherNotes synchronized
  const handlePagesUpdate = (newPages: string[]) => {
    const sanitized = newPages.length > 0 ? newPages : [''];
    const combinedNotes = sanitized.join('\n\n--- СТРАНИЦА ---\n\n');
    onChange({
      ...sheet,
      notesPages: sanitized,
      pageNotes: combinedNotes,
      notes: {
        ...sheet.notes,
        otherNotes: sanitized.join('\n\n'),
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddPage = () => {
    const newPages = [...pages, ''];
    handlePagesUpdate(newPages);
    setTimeout(() => {
      const nextEl = textareaRefs.current[newPages.length - 1];
      if (nextEl) {
        nextEl.focus();
      }
    }, 50);
  };

  const handleRemovePage = (idx: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== idx);
    handlePagesUpdate(newPages);
  };

  const handleAddTimestamp = () => {
    const dateStr = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const targetIdx = 0;
    const currentText = pages[targetIdx] || '';
    const prefix = currentText.trim() ? `${currentText}\n\n` : '';
    const newText = `${prefix}=== Запись от ${dateStr} ===\n- `;

    const lines = newText.split('\n');
    if (lines.length > page1MaxLines) {
      const p1 = lines.slice(0, page1MaxLines).join('\n');
      const rest = lines.slice(page1MaxLines).join('\n');
      const newPages = [...pages];
      newPages[0] = p1;
      if (newPages.length > 1) {
        newPages[1] = rest + (newPages[1] ? '\n' + newPages[1] : '');
      } else {
        newPages.push(rest);
      }
      handlePagesUpdate(newPages);
    } else {
      const newPages = [...pages];
      newPages[0] = newText;
      handlePagesUpdate(newPages);
    }
  };

  // Keyboard navigation and enter/backspace handling across pages
  const handleKeyDown = (
    pageIdx: number,
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const maxLines = pageIdx === 0 ? page1MaxLines : contPageMaxLines;
    const target = e.currentTarget;
    const lines = target.value.split('\n');

    if (e.key === 'Enter') {
      // If adding a line reaches or exceeds capacity, move to next page
      if (lines.length >= maxLines) {
        e.preventDefault();
        const newPages = [...pages];
        if (pageIdx + 1 >= newPages.length) {
          newPages.push('');
        }
        handlePagesUpdate(newPages);
        setTimeout(() => {
          const nextEl = textareaRefs.current[pageIdx + 1];
          if (nextEl) {
            nextEl.focus();
            nextEl.setSelectionRange(0, 0);
          }
        }, 40);
      }
    } else if (
      e.key === 'Backspace' &&
      target.selectionStart === 0 &&
      target.selectionEnd === 0
    ) {
      if (pageIdx > 0) {
        e.preventDefault();
        const prevIdx = pageIdx - 1;
        const curText = pages[pageIdx];

        if (!curText.trim()) {
          // If continuation page is completely empty, remove it and focus end of previous page
          const newPages = pages.filter((_, idx) => idx !== pageIdx);
          handlePagesUpdate(newPages);
          setTimeout(() => {
            const prevEl = textareaRefs.current[prevIdx];
            if (prevEl) {
              prevEl.focus();
              const len = prevEl.value.length;
              prevEl.setSelectionRange(len, len);
            }
          }, 40);
        } else {
          // Just focus end of previous page
          const prevEl = textareaRefs.current[prevIdx];
          if (prevEl) {
            prevEl.focus();
            const len = prevEl.value.length;
            prevEl.setSelectionRange(len, len);
          }
        }
      }
    }
  };

  // Text change handler with overflow detection
  const handleTextChange = (
    pageIdx: number,
    e: React.ChangeEvent<HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === 'string' ? e : e?.target?.value ?? '';
    const maxLines = pageIdx === 0 ? page1MaxLines : contPageMaxLines;
    const lines = value.split('\n');

    // If string HTML or event, safely check lines
    if (lines.length > maxLines) {
      const thisPageLines = lines.slice(0, maxLines).join('\n');
      const overflowLines = lines.slice(maxLines).join('\n');

      const newPages = [...pages];
      newPages[pageIdx] = thisPageLines;

      if (pageIdx + 1 < newPages.length) {
        newPages[pageIdx + 1] =
          overflowLines + (newPages[pageIdx + 1] ? '\n' + newPages[pageIdx + 1] : '');
      } else {
        newPages.push(overflowLines);
      }
      handlePagesUpdate(newPages);

      setTimeout(() => {
        const nextEl = textareaRefs.current[pageIdx + 1];
        if (nextEl) {
          nextEl.focus();
        }
      }, 40);
      return;
    }

    const newPages = [...pages];
    newPages[pageIdx] = value;
    handlePagesUpdate(newPages);
  };

  // Paste handler: intelligently distributes text across pages if it exceeds page height
  const handlePaste = (
    pageIdx: number,
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const pastedLines = pasted.split('\n');
    const target = e.currentTarget;
    const currentLines = target.value.split('\n');
    const maxLines = pageIdx === 0 ? page1MaxLines : contPageMaxLines;

    if (currentLines.length + pastedLines.length - 1 > maxLines) {
      e.preventDefault();
      const selStart = target.selectionStart;
      const selEnd = target.selectionEnd;
      const fullText = target.value.slice(0, selStart) + pasted + target.value.slice(selEnd);

      const allLines = fullText.split('\n');
      const newPages = [...pages.slice(0, pageIdx)];

      let remainingLines = allLines;
      const firstLimit = pageIdx === 0 ? page1MaxLines : contPageMaxLines;
      newPages.push(remainingLines.slice(0, firstLimit).join('\n'));
      remainingLines = remainingLines.slice(firstLimit);

      while (remainingLines.length > 0) {
        newPages.push(remainingLines.slice(0, contPageMaxLines).join('\n'));
        remainingLines = remainingLines.slice(contPageMaxLines);
      }

      handlePagesUpdate(newPages);
    }
  };

  // Notebook ruling styles
  const getNotebookStyle = (isContinuation: boolean = false): React.CSSProperties => ({
    minHeight: isContinuation ? '1000px' : `${notesHeight}px`,
    height: isContinuation ? '1000px' : `${notesHeight}px`,
    lineHeight: '28px',
    backgroundOrigin: 'content-box',
    backgroundPosition: '0 0',
    backgroundRepeat: 'repeat-y',
    backgroundSize: '100% 28px',
    backgroundImage: isDark
      ? 'linear-gradient(to bottom, transparent 27px, rgba(153, 27, 27, 0.28) 27px, rgba(153, 27, 27, 0.28) 28px)'
      : 'linear-gradient(to bottom, transparent 27px, rgba(153, 27, 27, 0.16) 27px, rgba(153, 27, 27, 0.16) 28px)',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    paddingRight: '16px',
  });

  return (
    <div className="w-full">
      {/* PAGE 1 (Initial Notes Sheet with Vampire Header & Title) */}
      <div
        className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-4 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
          isDark ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800' : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
        }`}
        style={{
          boxShadow: isDark
            ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
        }}
      >
        <SheetHeader
          pageTitle="Заметки"
          themeMode={isDark ? 'dark' : 'light'}
          useGraphicLogo={sheet.v5UseGraphicLogo}
        />

        <div className="flex-1 flex flex-col my-2 min-h-0 print-calib-p4-notes-container">
          <div className="relative flex items-center justify-center mb-2">
            <div className="w-full">
              <SectionDivider title="Хроника и Дневник" isDark={isDark} />
            </div>
            <button
              type="button"
              onClick={handleAddTimestamp}
              className={`absolute right-0 text-[11px] font-serif uppercase tracking-wider px-2.5 py-1 rounded cursor-pointer shrink-0 print:hidden transition-colors border ${
                isDark
                  ? 'text-red-500 border-red-800/60 hover:text-red-400 hover:bg-zinc-850'
                  : 'text-red-800 border-red-800/40 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              + Добавить дату
            </button>
          </div>

          {/* Ruled notebook writing area (Page 1) */}
          <div className="flex-1 flex flex-col relative min-h-0">
            <RichTextarea
              ref={(el) => {
                textareaRefs.current[0] = el;
              }}
              value={pages[0] || ''}
              onChange={(val) => handleTextChange(0, val as any)}
              placeholder={ph('Сюда можно записывать союзников, долги, тайны, цели сессий и события хроники...')}
              className={`flex-1 print:min-h-[250mm] print:h-[250mm] w-full border rounded-xs font-serif text-sm leading-7 transition-colors overflow-y-auto notebook-ruled-textarea print-white-bg ${
                isDark
                  ? 'dark-ruled bg-zinc-900/90 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-red-500'
                  : 'bg-white border-zinc-400 text-zinc-900 placeholder:text-zinc-400 focus:border-red-700'
              }`}
              style={getNotebookStyle(false)}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* CONTINUATION PAGES (Generated when text reaches bottom or when user adds page) */}
      {pages.slice(1).map((pageText, idx) => {
        const pageNumber = idx + 2; // page 1 is the main sheet
        const actualIndex = idx + 1;

        return (
          <div
            key={`notes-continuation-${actualIndex}`}
            className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-4 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
              isDark
                ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800'
                : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
            }`}
            style={{
              boxShadow: isDark
                ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
                : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Header bar with page badge and continuation subtitle (printed as well, with delete button hidden on print) */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-300 dark:border-zinc-800 print:border-zinc-300 print:pb-1 print:mb-2">
              <div className="flex items-center gap-2 print:gap-1.5">
                <span className={`font-benguiat text-xs font-bold uppercase tracking-wider print:text-black print:text-[11px] ${
                  isDark ? 'text-red-500' : 'text-red-800'
                }`}>
                  Хроника и Дневник (лист {pageNumber})
                </span>
                <span className={`text-[11px] font-sans print:text-zinc-600 print:text-[10px] ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  — продолжение заметок
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePage(actualIndex)}
                className={`text-[11px] font-serif border px-2 py-0.5 rounded cursor-pointer transition-colors print:hidden ${
                  isDark
                    ? 'text-red-500 border-red-800/60 hover:text-red-400 hover:bg-zinc-800'
                    : 'text-red-800 border-red-800/40 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Удалить этот лист"
              >
                ✕ Удалить лист
              </button>
            </div>

            {/* Ruled textarea filling the entire page without vampire header */}
            <div className="flex-1 flex flex-col relative min-h-0">
              <RichTextarea
                ref={(el) => {
                  textareaRefs.current[actualIndex] = el;
                }}
                value={pageText}
                onChange={(val) => handleTextChange(actualIndex, val as any)}
                placeholder={ph(`Продолжение заметок хроники (лист ${pageNumber})...`)}
                className={`flex-1 print:min-h-[265mm] print:h-[265mm] w-full border rounded-xs font-serif text-sm leading-7 transition-colors overflow-y-auto notebook-ruled-textarea print-white-bg ${
                  isDark
                    ? 'dark-ruled bg-zinc-900/90 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-red-500'
                    : 'bg-white border-zinc-400 text-zinc-900 placeholder:text-zinc-400 focus:border-red-700'
                }`}
                style={getNotebookStyle(true)}
                isDark={isDark}
              />
            </div>
          </div>
        );
      })}

      {/* Button to manually add a new continuation page on screen (hidden on print) */}
      <div className="flex justify-center my-4 print:hidden">
        <button
          type="button"
          onClick={handleAddPage}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-serif text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isDark
              ? 'bg-zinc-900/90 hover:bg-zinc-800 border-red-900/40 text-red-500 hover:text-red-400'
              : 'bg-[#faf8f5] hover:bg-white border-zinc-300 text-red-800 hover:border-red-400'
          }`}
          title="Добавить дополнительную страницу для заметок"
        >
          <Plus className="w-4 h-4 text-red-600" />
          <span>+ Добавить следующую страницу хроники</span>
        </button>
      </div>
    </div>
  );
};
