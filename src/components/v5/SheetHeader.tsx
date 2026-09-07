import React from 'react';

interface SheetHeaderProps {
  pageTitle?: string;
  pageNumber?: number;
  themeMode?: 'light' | 'dark';
  useGraphicLogo?: boolean;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  pageTitle,
  pageNumber,
  themeMode = 'light',
  useGraphicLogo = false,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header className="relative pt-2 pb-3 mb-3 print:pt-1 print:pb-1.5 print:mb-2 print-calib-header border-b-2 border-red-900/40 select-none overflow-hidden">
      {/* Decorative Blood Splatters in corner */}
      <div className="absolute -top-3 -right-2 print:top-0 print:right-0 w-28 h-28 print:w-20 print:h-20 pointer-events-none opacity-85 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-red-800/60 drop-shadow-sm vtm-header-blood-splatter">
          <path d="M50 15 C45 25 35 28 32 38 C28 50 36 62 48 65 C60 68 70 58 68 45 C67 35 55 30 50 15 Z" />
          <circle cx="28" cy="25" r="5" />
          <circle cx="75" cy="32" r="6" />
          <circle cx="65" cy="72" r="4.5" />
          <circle cx="20" cy="58" r="3.5" />
          <circle cx="82" cy="55" r="2.5" />
          <path d="M35 38 Q25 45 18 42 Q15 48 24 50 Z" />
          <path d="M60 42 Q75 48 78 58 Q70 65 62 55 Z" />
        </svg>
      </div>

      <div className="flex flex-col items-center justify-center text-center relative z-10">
        {/* Main Logo / Title */}
        {useGraphicLogo ? (
          <div className="flex items-center justify-center h-12 sm:h-14 print:h-10 py-0.5 print:py-0.5 max-w-full">
            <img
              src="./assets/site/logo.svg"
              alt="Vampire: The Masquerade"
              className={`h-full w-auto max-w-[280px] sm:max-w-[340px] print:max-w-[260px] print-calib-logo object-contain select-none pointer-events-none transition-all ${
                isDark ? 'invert brightness-125 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : ''
              } print:filter-none print:invert-0`}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 print:gap-2.5">
              <span className="text-red-700 text-lg sm:text-xl print:text-base print-calib-ankh select-none">☥</span>
              <h1
                className={`font-benguiat tracking-[0.25em] text-2xl sm:text-3xl print:text-2xl print-calib-title font-black uppercase ${
                  isDark ? 'text-zinc-100 text-shadow-dark' : 'text-zinc-950'
                }`}
                style={{ fontFamily: "'Benguiat', 'Benguiat Rus', 'Cinzel', serif" }}
              >
                ВАМПИРЫ
              </h1>
              <span className="text-red-700 text-lg sm:text-xl print:text-base print-calib-ankh select-none">☥</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 print:mt-0.5">
              <span className="h-px w-10 sm:w-16 print:w-10 bg-gradient-to-r from-transparent to-red-800"></span>
              <span
                className={`text-xs sm:text-sm print:text-xs print-calib-subtitle tracking-[0.35em] font-bold uppercase font-benguiat ${
                  isDark ? 'text-red-600' : 'text-red-800'
                }`}
                style={{ fontFamily: "'Benguiat', 'Benguiat Rus', 'Cinzel', serif" }}
              >
                † М А С К А Р А Д †
              </span>
              <span className="h-px w-10 sm:w-16 print:w-10 bg-gradient-to-l from-transparent to-red-800"></span>
            </div>
          </>
        )}

        {pageTitle && (
          <div className="mt-1 flex items-center justify-center gap-3">
            <span
              className={`text-xs sm:text-sm font-benguiat tracking-widest uppercase font-bold px-3 py-0.5 rounded ${
                isDark ? 'text-red-600 bg-red-950/40 border border-red-900/60' : 'text-red-950 bg-red-100/70 border border-red-300'
              }`}
              style={{ fontFamily: "'Benguiat', 'Benguiat Rus', 'Cinzel', serif" }}
            >
              {pageTitle}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export const SectionDivider: React.FC<{ title: string; isDark?: boolean; action?: React.ReactNode }> = ({
  title,
  isDark = false,
  action,
}) => {
  return (
    <div className="my-2 sm:my-2.5 print:my-1.5 print-calib-section-divider flex items-center gap-2 section-divider-wrapper">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-800/60 to-red-800 section-divider-line section-divider-line-left"></div>
      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 print:py-0.5 section-divider-content">
        <span className="text-red-700 text-xs print:text-[10px] section-divider-diamond">◆</span>
        <h2
          className={`text-xs sm:text-sm print:text-xs font-bold tracking-[0.2em] uppercase font-benguiat section-divider-title ${
            isDark ? 'text-zinc-100' : 'text-zinc-900'
          }`}
          style={{ fontFamily: "'Benguiat', 'Benguiat Rus', 'Cinzel', serif" }}
        >
          {title}
        </h2>
        <span className="text-red-700 text-xs print:text-[10px] section-divider-diamond">◆</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-red-800/60 to-red-800 section-divider-line section-divider-line-right"></div>
      {action && <div className="ml-1">{action}</div>}
    </div>
  );
};
