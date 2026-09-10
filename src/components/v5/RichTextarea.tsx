import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { RichTextFloatingToolbar } from './RichTextFloatingToolbar';

export interface RichTextareaProps {
  value: string;
  onChange?: ((value: string) => void) | ((e: { target: { value: string } }) => void);
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  isDark?: boolean;
  disabled?: boolean;
  minHeight?: number | string;
  height?: number | string;
  maxFontSize?: number;
  minFontSize?: number;
  notebookRuled?: boolean;
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

// Helper to convert rgb(r, g, b) to hex
function rgbToHex(rgbStr: string): string {
  if (!rgbStr) return '';
  if (rgbStr.startsWith('#')) return rgbStr;
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return rgbStr;
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Helper to check if HTML content is visually empty
function isContentEmpty(html: string): boolean {
  if (!html) return true;
  const stripped = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return stripped.length === 0;
}

// Convert legacy plain text with \n into HTML <br> tags if not already HTML
function formatInitialHtml(val: string): string {
  if (!val) return '';
  // If string already contains tags like <p>, <div>, <b>, <span>, <br>
  if (/<(p|div|b|i|u|s|span|br|font)\b[^>]*>/i.test(val)) {
    return val;
  }
  // Convert plain newlines to <br>
  return val.replace(/\n/g, '<br>');
}

export const RichTextarea = forwardRef<HTMLDivElement, RichTextareaProps>(
  (
    {
      value,
      onChange,
      placeholder = '',
      className = '',
      style,
      isDark = false,
      disabled = false,
      minHeight,
      height,
      maxFontSize,
      minFontSize,
      notebookRuled = false,
      id,
      onKeyDown,
      onPaste,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

    const lastHtmlRef = useRef<string>(value || '');
    const isFocusedRef = useRef<boolean>(false);
    const [isEmpty, setIsEmpty] = useState<boolean>(isContentEmpty(value));

    // Floating toolbar state
    const [toolbarState, setToolbarState] = useState<{
      isOpen: boolean;
      position: { top: number; left: number };
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
      fontSize: number;
      currentColor: string;
    }>({
      isOpen: false,
      position: { top: 0, left: 0 },
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: 14,
      currentColor: isDark ? '#f4f4f5' : '#18181b',
    });

    const savedRangeRef = useRef<Range | null>(null);
    const isInteractingWithToolbarRef = useRef<boolean>(false);

    // Notify parent of changes
    const emitChange = useCallback(
      (newHtml: string) => {
        lastHtmlRef.current = newHtml;
        setIsEmpty(isContentEmpty(newHtml));

        if (onChange) {
          (onChange as any)(newHtml);
        }
      },
      [onChange]
    );

    // Synchronize HTML with incoming value prop without resetting cursor
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;

      const formatted = formatInitialHtml(value || '');
      // Only set innerHTML if different from current DOM to preserve selection cursor
      if (el.innerHTML !== formatted && lastHtmlRef.current !== value) {
        el.innerHTML = formatted;
        lastHtmlRef.current = formatted;
        setIsEmpty(isContentEmpty(formatted));
      }
    }, [value]);

    // Initial load
    useLayoutEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      const formatted = formatInitialHtml(value || '');
      el.innerHTML = formatted;
      lastHtmlRef.current = formatted;
      setIsEmpty(isContentEmpty(formatted));
    }, []);

    // Ensure selection is active in editor; restore from saved range if needed
    const ensureSelection = useCallback(() => {
      const el = editorRef.current;
      if (!el) return false;

      let sel = window.getSelection();
      if ((!sel || sel.rangeCount === 0 || sel.isCollapsed) && savedRangeRef.current) {
        el.focus();
        sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current.cloneRange());
        }
      }
      sel = window.getSelection();
      return !!(sel && sel.rangeCount > 0 && !sel.isCollapsed);
    }, []);

    // Update toolbar position and active state on selection
    const updateToolbar = useCallback((overrideFontSize?: number) => {
      const el = editorRef.current;
      if (!el) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        if (!isInteractingWithToolbarRef.current) {
          setToolbarState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
        }
        return;
      }

      const range = sel.getRangeAt(0);
      const commonNode = range.commonAncestorContainer;
      const isInside = el.contains(commonNode);

      if (!isInside || !sel.toString().trim()) {
        if (!isInteractingWithToolbarRef.current) {
          setToolbarState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
        }
        return;
      }

      // Keep savedRangeRef up-to-date
      savedRangeRef.current = range.cloneRange();

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      // Detect active format states
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const strikethrough = document.queryCommandState('strikeThrough');

      // Detect font size
      let curFontSize = typeof overrideFontSize === 'number' ? overrideFontSize : 14;
      if (typeof overrideFontSize !== 'number') {
        const parentEl =
          sel.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? (sel.anchorNode as HTMLElement)
            : sel.anchorNode?.parentElement;

        const sizeEl = (parentEl?.closest('span[style*="font-size"]') ||
          (parentEl !== el && parentEl?.style.fontSize ? parentEl : null) ||
          parentEl?.querySelector('span[style*="font-size"]')) as HTMLElement | null;

        if (sizeEl && sizeEl.style.fontSize) {
          const parsed = parseFloat(sizeEl.style.fontSize);
          if (!isNaN(parsed) && parsed > 0) {
            curFontSize = Math.round(parsed);
          }
        } else if (parentEl) {
          const computedSize = window.getComputedStyle(parentEl).fontSize;
          const parsed = parseFloat(computedSize);
          if (!isNaN(parsed) && parsed > 0) {
            curFontSize = Math.round(parsed);
          }
        }
      }

      // Detect current color
      let curColor = isDark ? '#f4f4f5' : '#18181b';
      const queryColor = document.queryCommandValue('foreColor');
      if (queryColor) {
        const hex = rgbToHex(queryColor);
        if (hex) curColor = hex;
      } else {
        const parentEl =
          sel.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? (sel.anchorNode as HTMLElement)
            : sel.anchorNode?.parentElement;
        if (parentEl) {
          const compColor = window.getComputedStyle(parentEl).color;
          const hex = rgbToHex(compColor);
          if (hex) curColor = hex;
        }
      }

      // Toolbar dimensions estimate
      const toolbarWidth = 310;
      const toolbarHeight = 44;

      let top = rect.top - toolbarHeight - 8;
      let left = rect.left + rect.width / 2 - toolbarWidth / 2;

      // If too close to top of viewport, flip to bottom of selection
      if (top < 10) {
        top = rect.bottom + 8;
      }
      left = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, left));

      setToolbarState({
        isOpen: true,
        position: { top, left },
        bold,
        italic,
        underline,
        strikethrough,
        fontSize: curFontSize,
        currentColor: curColor,
      });
    }, [isDark]);

    // Handle outside clicks to close toolbar
    useEffect(() => {
      const handleDocMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const isInsideEditor = editorRef.current?.contains(target);
        const isInsideToolbar = !!target.closest('[data-rich-toolbar]');
        if (!isInsideEditor && !isInsideToolbar) {
          isInteractingWithToolbarRef.current = false;
          setToolbarState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
        }
      };

      document.addEventListener('mousedown', handleDocMouseDown);
      return () => document.removeEventListener('mousedown', handleDocMouseDown);
    }, []);

    // Handle selection changes across document
    useEffect(() => {
      const handleSelectionChange = () => {
        if (!isFocusedRef.current && !isInteractingWithToolbarRef.current) return;
        updateToolbar();
      };

      const handleScroll = () => {
        if (toolbarState.isOpen) {
          updateToolbar();
        }
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, [updateToolbar, toolbarState.isOpen]);

    // Internal input handler
    const handleInput = () => {
      const el = editorRef.current;
      if (!el) return;
      emitChange(el.innerHTML);
      updateToolbar();
    };

    // Standard Keyboard Shortcuts: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X
    const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          document.execCommand('bold', false);
          handleInput();
          return;
        }
        if (key === 'i') {
          e.preventDefault();
          document.execCommand('italic', false);
          handleInput();
          return;
        }
        if (key === 'u') {
          e.preventDefault();
          document.execCommand('underline', false);
          handleInput();
          return;
        }
        if (e.shiftKey && (key === 'x' || key === 's')) {
          e.preventDefault();
          document.execCommand('strikeThrough', false);
          handleInput();
          return;
        }
      }

      if (e.altKey && e.shiftKey && e.key === '5') {
        e.preventDefault();
        document.execCommand('strikeThrough', false);
        handleInput();
        return;
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // Actions from floating toolbar
    const handleToggleBold = () => {
      ensureSelection();
      document.execCommand('bold', false);
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const handleToggleItalic = () => {
      ensureSelection();
      document.execCommand('italic', false);
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const handleToggleUnderline = () => {
      ensureSelection();
      document.execCommand('underline', false);
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const handleToggleStrikethrough = () => {
      ensureSelection();
      document.execCommand('strikeThrough', false);
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const handleChangeFontSize = (newSize: number) => {
      const el = editorRef.current;
      if (!el) return;

      if (!ensureSelection()) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');

      const fonts = Array.from(el.querySelectorAll('font[size="7"]')) as HTMLElement[];
      if (fonts.length === 0) {
        handleInput();
        return;
      }

      const createdSpans: HTMLElement[] = [];

      fonts.forEach((font) => {
        const parent = font.parentElement;
        if (
          parent &&
          parent !== el &&
          parent.tagName.toLowerCase() === 'span' &&
          parent.childNodes.length === 1
        ) {
          parent.style.fontSize = `${newSize}px`;
          const c = font.getAttribute('color');
          if (c) parent.style.color = c;
          while (font.firstChild) {
            parent.insertBefore(font.firstChild, font);
          }
          parent.removeChild(font);
          createdSpans.push(parent);
        } else {
          const span = document.createElement('span');
          span.style.fontSize = `${newSize}px`;
          const c = font.getAttribute('color');
          if (c) span.style.color = c;
          span.innerHTML = font.innerHTML;
          font.parentNode?.replaceChild(span, font);
          createdSpans.push(span);
        }
      });

      // Re-establish selection over modified spans
      if (createdSpans.length > 0) {
        const firstSpan = createdSpans[0];
        const lastSpan = createdSpans[createdSpans.length - 1];

        const newRange = document.createRange();

        if (firstSpan.firstChild && firstSpan.firstChild.nodeType === Node.TEXT_NODE) {
          newRange.setStart(firstSpan.firstChild, 0);
        } else {
          newRange.setStart(firstSpan, 0);
        }

        if (lastSpan.lastChild && lastSpan.lastChild.nodeType === Node.TEXT_NODE) {
          newRange.setEnd(
            lastSpan.lastChild,
            lastSpan.lastChild.textContent?.length || 0
          );
        } else {
          newRange.setEnd(lastSpan, lastSpan.childNodes.length);
        }

        const s = window.getSelection();
        if (s) {
          s.removeAllRanges();
          s.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
        }
      }

      emitChange(el.innerHTML);
      updateToolbar(newSize);
    };

    const handleChangeColor = (newColor: string) => {
      ensureSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, newColor);
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const handleResetColor = () => {
      ensureSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, 'inherit');
      savedRangeRef.current = window.getSelection()?.getRangeAt(0)?.cloneRange() || null;
      handleInput();
    };

    const toCssDim = (val?: number | string) => {
      if (val === undefined || val === null || val === '') return undefined;
      if (typeof val === 'number') return `${val}px`;
      return String(val);
    };

    const resolvedMinHeight = toCssDim(minHeight) ?? toCssDim(style?.minHeight);
    const resolvedHeight = toCssDim(height) ?? toCssDim(style?.height);

    return (
      <div
        className={`relative flex flex-col w-full print-rich-textarea-wrapper ${resolvedHeight ? '' : 'flex-1 min-h-0'}`}
        style={{
          minHeight: resolvedMinHeight,
          height: resolvedHeight,
        }}
      >
        {/* Placeholder overlay when content is empty */}
        {isEmpty && placeholder && (
          <div
            className={`absolute top-2 left-2.5 right-2.5 pointer-events-none font-serif text-xs select-none line-clamp-2 print:hidden ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            {placeholder}
          </div>
        )}

        {/* ContentEditable Div acting as the Rich Text Editor */}
        <div
          id={id}
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            // Delay closing slightly so clicking toolbar or typing font size doesn't immediately close
            setTimeout(() => {
              if (isInteractingWithToolbarRef.current) return;
              if (!isFocusedRef.current) {
                const sel = window.getSelection();
                if (!sel || sel.isCollapsed) {
                  setToolbarState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
                }
              }
            }, 250);
          }}
          onMouseUp={updateToolbar}
          onKeyUp={updateToolbar}
          onKeyDown={handleEditorKeyDown}
          onPaste={onPaste}
          className={`outline-none whitespace-pre-wrap break-words overflow-y-auto ${resolvedHeight ? 'h-full flex-1' : ''} ${className || ''}`}
          style={{
            ...style,
            minHeight: resolvedMinHeight,
            height: resolvedHeight ? '100%' : style?.height,
          }}
        />

        {/* Floating Toolbar with Bold, Italic, Underline, Strikethrough, Font Size, and Palette */}
        <RichTextFloatingToolbar
          isOpen={toolbarState.isOpen}
          position={toolbarState.position}
          bold={toolbarState.bold}
          italic={toolbarState.italic}
          underline={toolbarState.underline}
          strikethrough={toolbarState.strikethrough}
          fontSize={toolbarState.fontSize}
          currentColor={toolbarState.currentColor}
          onToggleBold={handleToggleBold}
          onToggleItalic={handleToggleItalic}
          onToggleUnderline={handleToggleUnderline}
          onToggleStrikethrough={handleToggleStrikethrough}
          onChangeFontSize={handleChangeFontSize}
          onChangeColor={handleChangeColor}
          onResetColor={handleResetColor}
          onToolbarInteractionStart={() => {
            isInteractingWithToolbarRef.current = true;
          }}
          onToolbarInteractionEnd={() => {
            isInteractingWithToolbarRef.current = false;
          }}
          isDark={isDark}
        />
      </div>
    );
  }
);

RichTextarea.displayName = 'RichTextarea';
