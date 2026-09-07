import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Minus,
  Plus,
  RotateCcw,
  Palette,
  Check,
} from 'lucide-react';

export interface RichTextFloatingToolbarProps {
  isOpen: boolean;
  position: { top: number; left: number };
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number;
  currentColor: string;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrikethrough: () => void;
  onChangeFontSize: (newSize: number) => void;
  onChangeColor: (color: string) => void;
  onResetColor: () => void;
  onToolbarInteractionStart?: () => void;
  onToolbarInteractionEnd?: () => void;
  isDark?: boolean;
}

// Curated vampire gothic & essential palette
export const PALETTE_COLORS = [
  { hex: '#8b0000', name: 'Кровь' },
  { hex: '#dc2626', name: 'Алый' },
  { hex: '#991b1b', name: 'Рубин' },
  { hex: '#ea580c', name: 'Огонь' },
  { hex: '#d97706', name: 'Янтарь' },
  { hex: '#059669', name: 'Изумруд' },
  { hex: '#2563eb', name: 'Ночь' },
  { hex: '#7c3aed', name: 'Мистика' },
  { hex: '#71717a', name: 'Пепел' },
  { hex: '#18181b', name: 'Тень' },
  { hex: '#f4f4f5', name: 'Свет' },
];

export const RichTextFloatingToolbar: React.FC<RichTextFloatingToolbarProps> = ({
  isOpen,
  position,
  bold,
  italic,
  underline,
  strikethrough,
  fontSize,
  currentColor,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikethrough,
  onChangeFontSize,
  onChangeColor,
  onResetColor,
  onToolbarInteractionStart,
  onToolbarInteractionEnd,
  isDark = false,
}) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [inputFontSize, setInputFontSize] = useState<string>(String(fontSize || 14));
  const popoverRef = useRef<HTMLDivElement>(null);
  const colorPickerInputRef = useRef<HTMLInputElement>(null);

  // Sync font size input when prop changes
  useEffect(() => {
    setInputFontSize(String(fontSize || 14));
  }, [fontSize]);

  // Close color popover when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // If toolbar is closed, also reset color popover state
  useEffect(() => {
    if (!isOpen) {
      setShowColorPicker(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFontSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInt(inputFontSize, 10);
      if (!isNaN(parsed) && parsed >= 8 && parsed <= 48) {
        onChangeFontSize(parsed);
      } else {
        setInputFontSize(String(fontSize));
      }
      e.currentTarget.blur();
    }
  };

  const handleFontSizeBlur = () => {
    const parsed = parseInt(inputFontSize, 10);
    if (!isNaN(parsed) && parsed >= 8 && parsed <= 48) {
      onChangeFontSize(parsed);
    } else {
      setInputFontSize(String(fontSize));
    }
    onToolbarInteractionEnd?.();
  };

  const toolbarContent = (
    <div
      ref={popoverRef}
      data-rich-toolbar="true"
      onMouseEnter={onToolbarInteractionStart}
      onMouseLeave={onToolbarInteractionEnd}
      className={`fixed z-[99999] transition-all duration-75 flex items-center gap-1 p-1 rounded-md shadow-2xl backdrop-blur-md select-none border print:hidden ${
        isDark
          ? 'bg-[#18181b]/95 border-red-900/60 text-zinc-100 shadow-[0_10px_25px_rgba(0,0,0,0.8)]'
          : 'bg-[#faf8f5]/95 border-zinc-300 text-zinc-800 shadow-[0_10px_25px_rgba(0,0,0,0.2)]'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      // CRITICAL: Prevent mouse down from stealing focus / clearing selection in editor
      onMouseDown={(e) => {
        onToolbarInteractionStart?.();
        // If clicking inside the font size text input, allow focus so user can type
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          return;
        }
        e.preventDefault();
      }}
    >
      {/* 1. BOLD */}
      <button
        type="button"
        title="Жирный (Ctrl+B)"
        onClick={onToggleBold}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs font-bold cursor-pointer ${
          bold
            ? isDark
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-red-100 text-red-900 border border-red-300 font-bold'
            : isDark
            ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
            : 'hover:bg-zinc-200 text-zinc-700 hover:text-black'
        }`}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* 2. ITALIC */}
      <button
        type="button"
        title="Курсив (Ctrl+I)"
        onClick={onToggleItalic}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs cursor-pointer ${
          italic
            ? isDark
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-red-100 text-red-900 border border-red-300'
            : isDark
            ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
            : 'hover:bg-zinc-200 text-zinc-700 hover:text-black'
        }`}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* 3. UNDERLINE */}
      <button
        type="button"
        title="Подчеркнутый (Ctrl+U)"
        onClick={onToggleUnderline}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs cursor-pointer ${
          underline
            ? isDark
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-red-100 text-red-900 border border-red-300'
            : isDark
            ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
            : 'hover:bg-zinc-200 text-zinc-700 hover:text-black'
        }`}
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* 4. STRIKETHROUGH */}
      <button
        type="button"
        title="Зачеркнутый (Ctrl+Shift+X)"
        onClick={onToggleStrikethrough}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs cursor-pointer ${
          strikethrough
            ? isDark
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-red-100 text-red-900 border border-red-300'
            : isDark
            ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
            : 'hover:bg-zinc-200 text-zinc-700 hover:text-black'
        }`}
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      {/* DIVIDER */}
      <div className={`w-px h-5 mx-0.5 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />

      {/* 5. FONT SIZE CONTROLS: [-] [14] [+] */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          title="Уменьшить шрифт"
          onClick={() => onChangeFontSize(Math.max(8, fontSize - 1))}
          className={`w-6 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
            isDark ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="relative">
          <input
            type="text"
            value={inputFontSize}
            onChange={(e) => setInputFontSize(e.target.value)}
            onFocus={onToolbarInteractionStart}
            onKeyDown={handleFontSizeInputKeyDown}
            onBlur={handleFontSizeBlur}
            title="Размер шрифта в px (нажмите Enter)"
            className={`w-7 h-6 text-center text-[11px] font-mono rounded border transition-colors leading-none p-0 ${
              isDark
                ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-red-500'
                : 'bg-white border-zinc-300 text-zinc-900 focus:border-red-600'
            }`}
          />
        </div>

        <button
          type="button"
          title="Увеличить шрифт"
          onClick={() => onChangeFontSize(Math.min(48, fontSize + 1))}
          className={`w-6 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
            isDark ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* DIVIDER */}
      <div className={`w-px h-5 mx-0.5 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />

      {/* 6. COLOR PICKER BUTTON */}
      <div className="relative">
        <button
          type="button"
          title="Цвет текста (палитра)"
          onClick={() => setShowColorPicker((prev) => !prev)}
          className={`h-7 px-1.5 flex items-center gap-1.5 rounded transition-colors cursor-pointer ${
            showColorPicker
              ? isDark
                ? 'bg-red-950 border border-red-800'
                : 'bg-red-100 border border-red-300'
              : isDark
              ? 'hover:bg-zinc-800'
              : 'hover:bg-zinc-200'
          }`}
        >
          {/* Current color indicator circle */}
          <span
            className="w-4 h-4 rounded-full border border-black/30 dark:border-white/40 shadow-xs inline-block shrink-0"
            style={{ backgroundColor: currentColor || (isDark ? '#f4f4f5' : '#18181b') }}
          />
          <Palette className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Color Popover */}
        {showColorPicker && (
          <div
            data-rich-toolbar="true"
            onMouseEnter={onToolbarInteractionStart}
            onMouseLeave={onToolbarInteractionEnd}
            className={`absolute left-0 top-full mt-1.5 p-2 rounded-md shadow-2xl border min-w-[200px] z-[100000] ${
              isDark
                ? 'bg-[#18181b] border-red-900/60 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.9)]'
                : 'bg-white border-zinc-300 text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
            }`}
            onMouseDown={(e) => {
              onToolbarInteractionStart?.();
              e.stopPropagation();
              if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className={`text-[10px] font-benguiat uppercase font-bold tracking-wider ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                Цвет текста
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetColor();
                  setShowColorPicker(false);
                }}
                title="Сбросить к исходному цвету"
                className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Сброс</span>
              </button>
            </div>

            {/* Color Palette Grid */}
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {PALETTE_COLORS.map((col) => {
                const isSelected = currentColor.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.name}
                    onClick={() => {
                      onChangeColor(col.hex);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-black/20 dark:border-white/30 shadow-xs flex items-center justify-center transition-transform hover:scale-115 cursor-pointer relative"
                    style={{ backgroundColor: col.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 stroke-[3] ${
                          col.hex === '#f4f4f5' ? 'text-black' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <label className="text-[11px] font-serif cursor-pointer flex items-center gap-1.5">
                <input
                  ref={colorPickerInputRef}
                  type="color"
                  value={currentColor.startsWith('#') ? currentColor : '#8b0000'}
                  onChange={(e) => {
                    onChangeColor(e.target.value);
                  }}
                  className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
                />
                <span className={`text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Свой цвет
                </span>
              </label>

              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {currentColor}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(toolbarContent, document.body);
};
