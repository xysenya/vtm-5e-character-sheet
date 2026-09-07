import React from 'react';

interface DotRatingProps {
  value: number;
  max?: number;
  min?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  accentColor?: string;
}

export const DotRating: React.FC<DotRatingProps> = ({
  value,
  max = 5,
  min = 0,
  onChange,
  readOnly = false,
  size = 'md',
  id,
  accentColor = '#dc2626',
}) => {
  const dots = [];

  const sizeClasses =
    size === 'sm'
      ? 'w-2.5 h-2.5 m-0.5'
      : size === 'lg'
      ? 'w-4 h-4 m-1'
      : 'w-3 h-3 m-0.5';

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    const targetValue = index + 1;
    // If clicking on the currently selected dot and targetValue equals current, allow reducing
    if (targetValue === value) {
      const nextVal = Math.max(min, targetValue - 1);
      onChange(nextVal);
    } else {
      const nextVal = Math.max(min, targetValue);
      onChange(nextVal);
    }
  };

  for (let i = 0; i < max; i++) {
    const isFilled = i < value;
    dots.push(
      <button
        key={i}
        type="button"
        disabled={readOnly}
        id={id ? `${id}-dot-${i + 1}` : undefined}
        onClick={() => handleClick(i)}
        aria-label={`Значение ${i + 1}`}
        className={`rounded-full transition-all duration-150 relative inline-flex items-center justify-center ${sizeClasses} ${
          readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125 focus:outline-none'
        } ${
          isFilled
            ? 'shadow-[0_0_8px_rgba(220,38,38,0.4)]'
            : 'bg-neutral-800/80 hover:bg-neutral-700'
        } border ${
          isFilled ? 'border-red-500/80' : 'border-neutral-600/80'
        }`}
        style={{
          backgroundColor: isFilled ? accentColor : undefined,
          borderColor: isFilled ? accentColor : undefined,
        }}
      >
        {isFilled && (
          <span className="w-1 h-1 rounded-full bg-white/40 absolute top-0.5 left-0.5 pointer-events-none" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center flex-wrap" id={id}>
      {dots}
    </div>
  );
};
