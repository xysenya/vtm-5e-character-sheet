import { useState, useEffect } from 'react';

/**
 * Hook to detect when the browser enters print mode.
 * Dynamically toggles placeholder texts and applies .is-printing class
 * to guarantee that no browser placeholders ever appear on printed pages.
 */
export function useIsPrinting(): boolean {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  useEffect(() => {
    const handleBefore = () => {
      setIsPrinting(true);
      document.documentElement.classList.add('is-printing');
      document.body.classList.add('is-printing');
    };

    const handleAfter = () => {
      setIsPrinting(false);
      document.documentElement.classList.remove('is-printing');
      document.body.classList.remove('is-printing');
    };

    window.addEventListener('beforeprint', handleBefore);
    window.addEventListener('afterprint', handleAfter);

    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('print');
      const handleMql = (e: MediaQueryListEvent) => {
        setIsPrinting(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('is-printing');
          document.body.classList.add('is-printing');
        } else {
          document.documentElement.classList.remove('is-printing');
          document.body.classList.remove('is-printing');
        }
      };
      if (mql.addEventListener) {
        mql.addEventListener('change', handleMql);
      }
    } catch {}

    return () => {
      window.removeEventListener('beforeprint', handleBefore);
      window.removeEventListener('afterprint', handleAfter);
    };
  }, []);

  return isPrinting;
}
