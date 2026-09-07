import React from 'react';
import { DamageType } from '../../types';

interface V5DotsProps {
  value: number;
  max?: number;
  onChange: (val: number) => void;
  isDark?: boolean;
  min?: number;
  allowZero?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  activeColor?: string;
  ariaLabel?: string;
}

export const V5Dots: React.FC<V5DotsProps> = ({
  value,
  max = 5,
  onChange,
  isDark = false,
  min = 0,
  allowZero = true,
  size = 'md',
  activeColor,
  ariaLabel,
}) => {
  const dotSize =
    size === 'xs'
      ? 'w-2.5 h-2.5 print:w-2 print:h-2 text-[8px] print:text-[7px]'
      : size === 'sm'
      ? 'w-3 h-3 print:w-2.5 print:h-2.5 text-[9px] print:text-[8px]'
      : size === 'lg'
      ? 'w-5 h-5 print:w-4 print:h-4 text-sm print:text-xs'
      : 'w-4 h-4 print:w-3.5 print:h-3.5 text-xs print:text-[10px]';

  return (
    <div
      className={`inline-flex items-center shrink-0 select-none ${
        size === 'xs' ? 'gap-0.5' : size === 'sm' ? 'gap-1 print:gap-0.5' : 'gap-1'
      } print:gap-0.5`}
      role="radiogroup"
      aria-label={ariaLabel || 'Уровень характеристики'}
    >
      {Array.from({ length: max }, (_, index) => {
        const dotIndex = index + 1;
        const isFilled = dotIndex <= value;

        return (
          <button
            key={dotIndex}
            type="button"
            role="radio"
            aria-checked={isFilled}
            tabIndex={0}
            onClick={() => {
              if (allowZero && value === dotIndex) {
                onChange(Math.max(min, dotIndex - 1));
              } else {
                onChange(Math.max(min, dotIndex));
              }
            }}
            className={`${dotSize} rounded-full transition-transform active:scale-90 flex items-center justify-center cursor-pointer ${
              isFilled
                ? activeColor || (isDark ? 'bg-zinc-100 ring-1 ring-zinc-400' : 'bg-zinc-900 ring-1 ring-black')
                : isDark
                ? 'border border-zinc-500 hover:border-red-400 hover:bg-red-950/30'
                : 'border border-zinc-600 hover:border-red-700 hover:bg-red-100/40'
            }`}
            title={`Значение: ${dotIndex}`}
          />
        );
      })}
    </div>
  );
};

interface V5SquareTrackProps {
  totalBoxes?: number;
  maxPoints?: number;
  superficial: number;
  aggravated: number;
  boxes?: ('empty' | 'superficial' | 'aggravated')[];
  onChange: (
    superficial: number,
    aggravated: number,
    boxes?: ('empty' | 'superficial' | 'aggravated')[]
  ) => void;
  onMaxChange?: (max: number) => void;
  isDark?: boolean;
  label: string;
  labelWidth?: string;
  labelClassName?: string;
  boxesClassName?: string;
}

export const V5SquareTrack: React.FC<V5SquareTrackProps> = ({
  totalBoxes = 10,
  maxPoints = 10,
  superficial,
  aggravated,
  boxes,
  onChange,
  onMaxChange,
  isDark = false,
  label,
  labelWidth,
  labelClassName,
  boxesClassName,
}) => {
  const activeMax = Math.min(totalBoxes, Math.max(1, maxPoints));

  // Compute current state of each box (independent)
  const currentBoxes: ('empty' | 'superficial' | 'aggravated')[] = React.useMemo(() => {
    if (boxes && boxes.length === totalBoxes) {
      return boxes;
    }
    return Array.from({ length: totalBoxes }, (_, i) => {
      if (i < aggravated) return 'aggravated';
      if (i < aggravated + superficial) return 'superficial';
      return 'empty';
    });
  }, [boxes, totalBoxes, aggravated, superficial]);

  // Click on single box: only change this clicked box
  const handleBoxClick = (index: number) => {
    const nextBoxes = [...currentBoxes];
    const cur = nextBoxes[index] || 'empty';
    let nextState: 'empty' | 'superficial' | 'aggravated' = 'superficial';
    if (cur === 'empty') {
      nextState = 'superficial';
    } else if (cur === 'superficial') {
      nextState = 'aggravated';
    } else {
      nextState = 'empty';
    }

    nextBoxes[index] = nextState;

    // Recalculate totals for active boxes
    const newAgg = nextBoxes.filter((b, i) => i < activeMax && b === 'aggravated').length;
    const newSup = nextBoxes.filter((b, i) => i < activeMax && b === 'superficial').length;

    onChange(newSup, newAgg, nextBoxes);
  };

  const clearAllDamage = () => {
    const emptyBoxes: ('empty' | 'superficial' | 'aggravated')[] = Array(totalBoxes).fill('empty');
    onChange(0, 0, emptyBoxes);
  };

  const isHealth = label.toLowerCase().includes('здоров');
  const isWillpower = label.toLowerCase().includes('вол');

  // Status calculation
  const isAllAggravated = activeMax > 0 && aggravated >= activeMax;
  const isFullDamage = activeMax > 0 && (aggravated + superficial) >= activeMax;
  const totalDamage = aggravated + superficial;
  const remainingActive = Math.max(0, activeMax - totalDamage);

  const renderBox = (index: number) => {
    const isEnabled = index < activeMax;
    const boxState = currentBoxes[index] || 'empty';
    const isAggravated = boxState === 'aggravated';
    const isSuperficial = boxState === 'superficial';

    let content = '';
    if (isAggravated) content = '✕';
    else if (isSuperficial) content = '/';

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleBoxClick(index)}
        title={
          !isEnabled
            ? `Ячейка ${index + 1} (вне максимума, нажмите для переключения)`
            : isAggravated
            ? `Ячейка ${index + 1}: Тяжелый урон (✕)`
            : isSuperficial
            ? `Ячейка ${index + 1}: Поверхностный урон (/)`
            : `Ячейка ${index + 1}: Целая`
        }
        className={`w-4 h-4 sm:w-[18px] sm:h-[18px] print:w-3.5 print:h-3.5 rounded-[3px] border text-[10px] sm:text-[11px] print:text-[9px] font-bold font-mono flex items-center justify-center transition-all cursor-pointer select-none leading-none ${
          !isEnabled
            ? isDark
              ? 'border-dashed border-zinc-700 bg-transparent text-transparent opacity-25 hover:opacity-75 hover:border-zinc-500'
              : 'border-dashed border-zinc-400 bg-zinc-100/40 text-transparent opacity-35 hover:opacity-85 hover:border-zinc-600'
            : isDark
            ? isAggravated
              ? 'border-red-500 bg-red-950/60 text-red-400'
              : isSuperficial
              ? 'border-amber-500 bg-amber-950/50 text-amber-300'
              : 'border-zinc-500 bg-zinc-950/60 hover:border-red-400 text-zinc-100'
            : isAggravated
            ? 'border-red-600 bg-red-100 text-red-900'
            : isSuperficial
            ? 'border-amber-600 bg-amber-50 text-amber-900'
            : 'border-zinc-800 bg-white hover:border-red-800 text-zinc-950 shadow-2xs'
        }`}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-start">
        {/* Label on the left */}
        <span className={`v5-track-label font-benguiat text-sm sm:text-base print:text-xs font-semibold tracking-normal flex-shrink-0 ${
          labelWidth || 'w-[114px] sm:w-[124px] print:w-[86px]'
        } flex items-center h-4 sm:h-5 print:h-4 pr-2 ${
          isDark ? 'text-zinc-100' : 'text-zinc-950'
        } ${labelClassName || ''}`}>
          {label}
        </span>

        {/* Column strictly containing the 10 boxes and the subrow controls */}
        <div className={`w-[192px] sm:w-[224px] print:w-[166px] flex-shrink-0 flex flex-col ${boxesClassName || ''}`}>
          {/* 10 rounded boxes in two groups of 5 with a gap between 5 and 6 */}
          <div className="flex items-center justify-between">
            {/* First 5 boxes */}
            <div className="flex items-center gap-0.5 sm:gap-1 print:gap-0.5">
              {Array.from({ length: 5 }, (_, i) => renderBox(i))}
            </div>

            {/* Gap between 5 and 6 */}
            <div className="w-2.5 sm:w-3 print:w-1.5 flex-shrink-0" aria-hidden="true" />

            {/* Second 5 boxes */}
            <div className="flex items-center gap-0.5 sm:gap-1 print:gap-0.5">
              {Array.from({ length: 5 }, (_, i) => renderBox(i + 5))}
            </div>
          </div>

          {/* Subrow under boxes: Max counter, Damage/Penalty info, and Reset (hidden in print) */}
          <div className="w-full flex items-center justify-between text-[10px] sm:text-[10.5px] pt-1 min-h-[18px] print:hidden">
            {/* Left: Max adjuster */}
            {onMaxChange ? (
              <div className="flex items-center gap-1 font-mono" title="Максимальное количество ячеек">
                <span className={`text-[10px] font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>макс:</span>
                <button
                  type="button"
                  onClick={() => onMaxChange(Math.max(1, activeMax - 1))}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                  }`}
                  title="Уменьшить максимум"
                >
                  -
                </button>
                <span className={`font-bold min-w-[12px] text-center ${isDark ? 'text-zinc-200' : 'text-zinc-950'}`}>
                  {activeMax}
                </span>
                <button
                  type="button"
                  onClick={() => onMaxChange(Math.min(totalBoxes, activeMax + 1))}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                  }`}
                  title="Увеличить максимум"
                >
                  +
                </button>
              </div>
            ) : (
              <div />
            )}

            {/* Right: Damage & Penalty Status */}
            <div className="flex items-center gap-1 ml-auto">
              {isHealth ? (
                <div>
                  {isAllAggravated ? (
                    <span className={`font-bold px-1 py-0.2 rounded border animate-pulse ${
                      isDark
                        ? 'text-red-400 bg-red-950/50 border-red-700/60'
                        : 'text-red-700 bg-red-100 border-red-300'
                    }`}>
                      ⚠️ Торпор
                    </span>
                  ) : isFullDamage ? (
                    <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      Без сознания ({aggravated > 0 ? `${aggravated} тяж.` : ''}{aggravated > 0 && superficial > 0 ? ', ' : ''}{superficial > 0 ? `${superficial} пов.` : ''})
                    </span>
                  ) : totalDamage > 0 ? (
                    <span className="font-mono">
                      {aggravated > 0 && <strong className={isDark ? 'text-red-400' : 'text-red-700'}>{aggravated} тяж.</strong>}
                      {aggravated > 0 && superficial > 0 && ', '}
                      {superficial > 0 && <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{superficial} пов.</span>}
                    </span>
                  ) : (
                    <span className={`text-[9.5px] italic ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>здоров</span>
                  )}
                </div>
              ) : isWillpower ? (
                <div>
                  {isAllAggravated ? (
                    <span className={`font-bold px-1 py-0.2 rounded border animate-pulse ${
                      isDark
                        ? 'text-red-400 bg-red-950/50 border-red-700/60'
                        : 'text-red-700 bg-red-100 border-red-300'
                    }`} title="Все ячейки поражены тяжелым уроном">
                      ⚠️ Сломлен (-2 кости)
                    </span>
                  ) : isFullDamage ? (
                    <span className={`font-bold px-1 py-0.2 rounded border ${
                      isDark
                        ? 'text-amber-400 bg-amber-950/50 border-amber-600/50'
                        : 'text-amber-800 bg-amber-100 border-amber-300'
                    }`} title="Штраф -2 кости на ментальные и социальные проверки">
                      ⚠️ Штраф -2 кости
                    </span>
                  ) : totalDamage > 0 ? (
                    <span className="font-mono">
                      {aggravated > 0 && <strong className={isDark ? 'text-red-400' : 'text-red-700'}>{aggravated} тяж.</strong>}
                      {aggravated > 0 && superficial > 0 && ', '}
                      {superficial > 0 && <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{superficial} пов.</span>}
                    </span>
                  ) : (
                    <span className={`text-[9.5px] italic ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>полна</span>
                  )}
                </div>
              ) : (
                <div>
                  {totalDamage > 0 ? (
                    <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{aggravated} тяж., {superficial} пов.</span>
                  ) : null}
                </div>
              )}

              {totalDamage > 0 && (
                <button
                  type="button"
                  onClick={clearAllDamage}
                  className={`text-[9.5px] underline cursor-pointer ml-1 ${
                    isDark ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-500 hover:text-red-600'
                  }`}
                  title="Очистить весь урон"
                >
                  сброс
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const V5HungerTrack: React.FC<{
  hunger: number;
  onChange: (val: number) => void;
  isDark?: boolean;
  labelWidth?: string;
  labelClassName?: string;
  boxesClassName?: string;
}> = ({ hunger, onChange, isDark = false, labelWidth, labelClassName, boxesClassName }) => {
  return (
    <div className="flex flex-col select-none">
      <div className="flex items-start">
        {/* Label on the left with alignment */}
        <span className={`v5-track-label font-benguiat text-sm sm:text-base print:text-xs font-semibold tracking-normal flex-shrink-0 ${
          labelWidth || 'w-[114px] sm:w-[124px] print:w-[86px]'
        } flex items-center h-4 sm:h-5 print:h-4 pr-2 ${
          isDark ? 'text-zinc-100' : 'text-zinc-950'
        } ${labelClassName || ''}`}>
          Голод
        </span>

        {/* Column strictly containing the 5 centered boxes and subrow */}
        {/* 5 rounded boxes strictly centered in the same width container as Willpower's 10 boxes */}
        {/* The 3rd box is aligned directly with the center of the gap between box 5 and 6 of Willpower */}
        <div className={`w-[192px] sm:w-[224px] print:w-[166px] flex-shrink-0 flex flex-col ${boxesClassName || ''}`}>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-0.5 sm:gap-1 print:gap-0.5">
              {Array.from({ length: 5 }, (_, index) => {
                const level = index + 1;
                const isFilled = level <= hunger;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      if (hunger === level) {
                        onChange(level - 1);
                      } else {
                        onChange(level);
                      }
                    }}
                    className={`w-4 h-4 sm:w-[18px] sm:h-[18px] print:w-3.5 print:h-3.5 rounded-[3px] border transition-all flex items-center justify-center cursor-pointer select-none ${
                      isFilled
                        ? 'bg-red-800 border-red-600 text-white shadow-xs'
                        : isDark
                        ? 'border-zinc-500 bg-zinc-950/60 hover:border-red-400'
                        : 'border-zinc-800 bg-white hover:border-red-700 shadow-2xs'
                    }`}
                    title={`Уровень Голода: ${level}`}
                  >
                    {isFilled ? (
                      <span className="text-[10px] leading-none">🩸</span>
                    ) : (
                      <span className={`text-[9px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{level}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subrow under hunger boxes: Only special status if hunger is 5 (hidden in print) */}
          <div className="w-full flex items-center justify-center text-[10px] sm:text-[10.5px] pt-1 min-h-[18px] print:hidden">
            {hunger === 5 ? (
              <span className={`font-serif font-bold text-[10px] animate-pulse ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                ⚠️ Жажда крови (5)
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export const V5HumanityTrack: React.FC<{
  humanity: number;
  stains: number;
  onChange: (humanity: number, stains: number) => void;
  isDark?: boolean;
  labelWidth?: string;
  labelClassName?: string;
  boxesClassName?: string;
}> = ({ humanity, stains, onChange, isDark = false, labelWidth, labelClassName, boxesClassName }) => {
  const handleBoxClick = (index: number) => {
    const boxNum = index + 1;
    if (humanity === boxNum) {
      onChange(Math.max(0, boxNum - 1), stains);
    } else {
      onChange(boxNum, stains);
    }
  };

  const handleAddStain = () => {
    if (stains < 10) {
      onChange(humanity, Math.min(10, stains + 1));
    }
  };

  const handleRemoveStain = () => {
    if (stains > 0) {
      onChange(humanity, stains - 1);
    }
  };

  const isDegenerationRisk = stains > (10 - humanity);

  const renderBox = (index: number) => {
    const boxNum = index + 1;
    const isHumanity = boxNum <= humanity;
    const isStained = boxNum > 10 - stains;
    const isOverlap = isHumanity && isStained;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleBoxClick(index)}
        title={`Ячейка ${boxNum}: ${
          isOverlap
            ? 'Конфликт человечности и пятна греха!'
            : isHumanity
            ? `Человечность (${humanity}/10)`
            : isStained
            ? 'Пятно греха (/)'
            : 'Пустая ячейка'
        }`}
        className={`w-4 h-4 sm:w-[18px] sm:h-[18px] print:w-3.5 print:h-3.5 rounded-[3px] border text-[10px] sm:text-[11px] print:text-[9px] font-bold font-mono flex items-center justify-center transition-all cursor-pointer select-none leading-none ${
          isOverlap
            ? 'bg-red-950 border-2 border-red-500 text-amber-300 animate-pulse'
            : isHumanity
            ? isDark
              ? 'bg-zinc-200 border-zinc-200 text-zinc-950'
              : 'bg-zinc-900 border-zinc-900 text-white'
            : isStained
            ? isDark
              ? 'border-red-500 bg-red-950/50 text-red-400'
              : 'border-red-700 bg-red-100 text-red-800'
            : isDark
            ? 'border-zinc-500 bg-zinc-950/60 hover:border-zinc-200'
            : 'border-zinc-800 bg-white hover:border-zinc-950 shadow-2xs'
        }`}
      >
        {isOverlap ? '✕' : isHumanity ? '■' : isStained ? '/' : ''}
      </button>
    );
  };

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-start">
        {/* Label on the left with ample width for "Человечность" and padding */}
        <span className={`v5-track-label font-benguiat text-sm sm:text-base print:text-xs font-semibold tracking-normal flex-shrink-0 ${
          labelWidth || 'w-[114px] sm:w-[124px] print:w-[124px]'
        } flex items-center h-4 sm:h-5 print:h-4 pr-2 ${
          isDark ? 'text-zinc-100' : 'text-zinc-950'
        } ${labelClassName || ''}`}>
          Человечность
        </span>

        {/* Column strictly containing the 10 boxes and stains subrow */}
        <div className={`w-[192px] sm:w-[224px] print:w-[166px] flex-shrink-0 flex flex-col ${boxesClassName || ''}`}>
          {/* 10 rounded boxes in two groups of 5 with a gap between 5 and 6 */}
          <div className="flex items-center justify-between">
            {/* First 5 boxes */}
            <div className="flex items-center gap-0.5 sm:gap-1 print:gap-0.5">
              {Array.from({ length: 5 }, (_, i) => renderBox(i))}
            </div>

            {/* Gap between 5 and 6 */}
            <div className="w-2.5 sm:w-3 print:w-1.5 flex-shrink-0" aria-hidden="true" />

            {/* Second 5 boxes */}
            <div className="flex items-center gap-0.5 sm:gap-1 print:gap-0.5">
              {Array.from({ length: 5 }, (_, i) => renderBox(i + 5))}
            </div>
          </div>

          {/* Subrow under boxes: Stains counter and Degeneration status (hidden in print) */}
          <div className="w-full flex items-center justify-between text-[10px] sm:text-[10.5px] pt-1 min-h-[18px] print:hidden">
            {/* Left: Compact stain adjuster */}
            <div className="flex items-center gap-1 font-mono text-[10.5px]" title="Пятна греха (Stains)">
              <span className={`text-[10px] font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>пятна:</span>
              <button
                type="button"
                onClick={handleRemoveStain}
                disabled={stains === 0}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                } disabled:opacity-20`}
                title="Убрать пятно"
              >
                -
              </button>
              <span className={`font-mono text-xs font-bold min-w-[12px] text-center ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>{stains}</span>
              <button
                type="button"
                onClick={handleAddStain}
                disabled={stains >= 10}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[10px] font-bold flex items-center justify-center bg-red-800 hover:bg-red-700 text-white cursor-pointer disabled:opacity-20 transition-colors"
                title="Добавить пятно"
              >
                +
              </button>
            </div>

            {/* Right: Degeneration warning if applicable */}
            <div className="flex items-center gap-1 ml-auto">
              {isDegenerationRisk ? (
                <span className={`font-bold animate-pulse text-[10px] ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  ⚠️ Риск дегенерации!
                </span>
              ) : stains > 0 ? (
                <span className={`text-[9.5px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  до проверки: {Math.max(0, 10 - humanity - stains)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
