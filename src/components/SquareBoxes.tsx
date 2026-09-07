import React from 'react';

interface SquareBoxesProps {
  current: number;
  max: number;
  onChange: (val: number) => void;
  color?: string;
  iconType?: 'check' | 'blood' | 'dot';
  idPrefix?: string;
}

export const SquareBoxes: React.FC<SquareBoxesProps> = ({
  current,
  max,
  onChange,
  color = '#dc2626',
  iconType = 'check',
  idPrefix = 'sq-box',
}) => {
  const boxes = [];

  const handleToggle = (index: number) => {
    // If clicked on an already filled box, set current to that index (reducing)
    // If clicked on an empty box, set current to index + 1
    if (index < current) {
      // If clicking exactly the last filled box, remove it
      if (index === current - 1) {
        onChange(index);
      } else {
        onChange(index + 1);
      }
    } else {
      onChange(index + 1);
    }
  };

  for (let i = 0; i < max; i++) {
    const isFilled = i < current;
    boxes.push(
      <button
        key={i}
        type="button"
        id={`${idPrefix}-${i + 1}`}
        onClick={() => handleToggle(i)}
        title={`Ячейка ${i + 1}`}
        className={`w-5 h-5 rounded sm:w-6 sm:h-6 flex items-center justify-center border transition-all cursor-pointer ${
          isFilled
            ? 'shadow-[0_0_8px_rgba(220,38,38,0.4)] border-red-500'
            : 'bg-neutral-900/90 border-neutral-700 hover:border-neutral-500'
        }`}
        style={{
          backgroundColor: isFilled ? color : undefined,
          borderColor: isFilled ? color : undefined,
        }}
      >
        {isFilled && iconType === 'blood' ? (
          <span className="text-[11px] font-bold text-white drop-shadow">🩸</span>
        ) : isFilled ? (
          <span className="w-2 h-2 bg-white rounded-xs" />
        ) : null}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {boxes}
    </div>
  );
};
