import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { RichTextarea } from './RichTextarea';

interface AutoFitTextareaProps {
  maxFontSize?: number;
  minFontSize?: number;
  value: string;
  onChange?: (e: any) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  isDark?: boolean;
  [key: string]: any;
}

export const AutoFitTextarea: React.FC<AutoFitTextareaProps> = ({
  maxFontSize = 12,
  minFontSize = 7,
  value,
  style,
  className = '',
  onChange,
  placeholder,
  isDark = false,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFontSize, setCurrentFontSize] = useState<number>(maxFontSize);

  const calculateFittingSize = useCallback(() => {
    const el = containerRef.current;
    if (!el || el.clientHeight === 0) return;

    // Reset to maximum font size to see if text fits or overflows
    let size = maxFontSize;
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = size <= 9 ? '1.18' : '1.3';

    // If text does not overflow at max size, we are done
    if (el.scrollHeight <= el.clientHeight + 1) {
      setCurrentFontSize(size);
      return;
    }

    // Step down font size until it fits inside the container
    while (size > minFontSize) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = size <= 9 ? '1.18' : '1.25';

      if (el.scrollHeight <= el.clientHeight + 1) {
        break;
      }
    }

    setCurrentFontSize(size);
  }, [maxFontSize, minFontSize]);

  useLayoutEffect(() => {
    calculateFittingSize();
  }, [value, calculateFittingSize]);

  // Handle container resizing (e.g. responsive layout changes, print mode)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        calculateFittingSize();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', calculateFittingSize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        calculateFittingSize();
      });
    }

    return () => window.removeEventListener('resize', calculateFittingSize);
  }, [calculateFittingSize]);

  // Also re-calculate on print events
  useEffect(() => {
    const handleBeforePrint = () => {
      calculateFittingSize();
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, [calculateFittingSize]);

  return (
    <RichTextarea
      ref={containerRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDark={isDark}
      className={`w-full overflow-hidden ${className}`}
      style={{
        ...style,
        fontSize: `${currentFontSize}px`,
        lineHeight: currentFontSize <= 9 ? 1.18 : 1.25,
      }}
      {...rest}
    />
  );
};
