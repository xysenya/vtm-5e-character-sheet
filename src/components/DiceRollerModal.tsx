import React, { useState } from 'react';
import { Modal } from './Modal';
import { CharacterSheet, DiceRollResult } from '../types';
import { rollVtMDice, rollV5Dice } from '../utils/calculations';
import { Dices, Flame, Sparkles, History, RotateCcw, AlertOctagon, CheckCircle } from 'lucide-react';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSpendWillpower?: () => void;
  onSpendBlood?: () => void;
  onIncreaseHunger?: () => void;
  initialAttribute?: string;
  initialAbility?: string;
  id?: string;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onSpendWillpower,
  onSpendBlood,
  onIncreaseHunger,
  initialAttribute,
  initialAbility,
}) => {
  const [selectedAttr, setSelectedAttr] = useState<string>(initialAttribute || 'str');
  const [selectedAbil, setSelectedAbil] = useState<string>(initialAbility || 'brawl');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [useCustomPool, setUseCustomPool] = useState<boolean>(false);
  const [customDice, setCustomDice] = useState<number>(5);
  const [hungerDice, setHungerDice] = useState<number>(sheet.v5Tracks?.hunger || 1);
  const [spendWp, setSpendWp] = useState<boolean>(false);
  const [bloodBuff, setBloodBuff] = useState<boolean>(false);
  const [actionLabel, setActionLabel] = useState<string>('Проверка V5');

  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);
  const [rouseResult, setRouseResult] = useState<{ roll: number; success: boolean } | null>(null);

  // V5 Attributes list
  const v5Attributes = [
    { id: 'str', group: 'Физические', name: 'Сила', val: sheet.attributes.physical.strength.value },
    { id: 'dex', group: 'Физические', name: 'Ловкость', val: sheet.attributes.physical.dexterity.value },
    { id: 'sta', group: 'Физические', name: 'Выносливость', val: sheet.attributes.physical.stamina.value },
    { id: 'cha', group: 'Социальные', name: 'Харизма', val: sheet.attributes.social.charisma.value },
    { id: 'man', group: 'Социальные', name: 'Манипуляция', val: sheet.attributes.social.manipulation.value },
    { id: 'com', group: 'Социальные', name: 'Самообладание', val: sheet.attributes.social.composure?.value || 2 },
    { id: 'int', group: 'Ментальные', name: 'Интеллект', val: sheet.attributes.mental.intelligence.value },
    { id: 'wit', group: 'Ментальные', name: 'Смекалка', val: sheet.attributes.mental.wits.value },
    { id: 'res', group: 'Ментальные', name: 'Решительность', val: sheet.attributes.mental.resolve?.value || 2 },
  ];

  // V5 Skills list
  const v5Skills = (sheet.v5Skills && sheet.v5Skills.length > 0)
    ? sheet.v5Skills.map(s => ({
        id: s.id,
        group: s.category === 'physical' ? 'Физические' : s.category === 'social' ? 'Социальные' : 'Ментальные',
        name: s.name,
        val: s.value,
      }))
    : [
        { id: 'ath', group: 'Физические', name: 'Атлетика', val: 2 },
        { id: 'brawl', group: 'Физические', name: 'Драка', val: 3 },
        { id: 'drive', group: 'Физические', name: 'Вождение', val: 2 },
        { id: 'firearms', group: 'Физические', name: 'Стрельба', val: 2 },
        { id: 'stealth', group: 'Физические', name: 'Скрытность', val: 1 },
      ];

  const currentAttr = v5Attributes.find(a => a.id === selectedAttr) || v5Attributes[0];
  const currentAbil = v5Skills.find(a => a.id === selectedAbil);

  // Calculate base pool
  let calculatedPool = 0;
  if (useCustomPool) {
    calculatedPool = customDice;
  } else {
    calculatedPool = currentAttr.val + (currentAbil ? currentAbil.val : 0);
  }

  if (bloodBuff) {
    calculatedPool += 2; // V5 Blood Surge
  }

  const finalPool = Math.max(1, calculatedPool);

  const handleRoll = () => {
    let name = '';
    if (useCustomPool) {
      name = actionLabel || 'Бросок кубиков';
    } else {
      name = `${currentAttr.name} + ${currentAbil?.name || ''}`;
    }

    const result: DiceRollResult = rollV5Dice(finalPool, hungerDice, difficulty, name, spendWp, bloodBuff);

    setLastResult(result);
    setRollHistory(prev => [result, ...prev.slice(0, 9)]);

    if (spendWp && onSpendWillpower && sheet.willpower.current > 0) {
      onSpendWillpower();
    }
  };

  const handleRouseCheck = () => {
    const roll = Math.floor(Math.random() * 10) + 1;
    const success = roll >= 6;
    setRouseResult({ roll, success });
    if (!success && onIncreaseHunger) {
      onIncreaseHunger();
    }
  };

  return (
    <Modal
      id="vtm-dice-roller-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-red-500" />
          Генератор и калькулятор пула кубиков (D10)
        </span>
      }
      subtitle="Броски по правилам Vampire: The Masquerade 5-й редакции (V5)"
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Pool formulation */}
        <div className="space-y-4 bg-[#0a0a0a] p-4 rounded-xl border border-red-900/20">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <span className="text-xs font-serif font-bold text-red-400">
              V5: Пул + Кости Голода
            </span>

            <button
              type="button"
              onClick={() => setUseCustomPool(!useCustomPool)}
              className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              {useCustomPool ? 'Атрибут + Навык' : 'Произвольный пул'}
            </button>
          </div>

          {!useCustomPool ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  1. Характеристика:
                </label>
                <select
                  value={selectedAttr}
                  onChange={(e) => setSelectedAttr(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg p-2.5 focus:border-red-900 focus:outline-none"
                >
                  <optgroup label="Физические">
                    {v5Attributes.filter(a => a.group === 'Физические').map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.val} точек)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Социальные">
                    {v5Attributes.filter(a => a.group === 'Социальные').map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.val} точек)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Ментальные">
                    {v5Attributes.filter(a => a.group === 'Ментальные').map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.val} точек)</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  2. Навык:
                </label>
                <select
                  value={selectedAbil}
                  onChange={(e) => setSelectedAbil(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg p-2.5 focus:border-red-900 focus:outline-none"
                >
                  <option value="">-- Без навыка (только характеристика) --</option>
                  <optgroup label="Физические">
                    {v5Skills.filter(s => s.group === 'Физические').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.val} точек)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Социальные">
                    {v5Skills.filter(s => s.group === 'Социальные').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.val} точек)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Ментальные">
                    {v5Skills.filter(s => s.group === 'Ментальные').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.val} точек)</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Название действия:</label>
                <input
                  type="text"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg p-2 focus:border-red-900 focus:outline-none"
                  placeholder="Например: Противостояние воле"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Базовый пул кубиков (D10): {customDice}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={customDice}
                  onChange={(e) => setCustomDice(parseInt(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* V5 Hunger dice selector */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span className="flex items-center gap-1">
                <span className="text-red-500">🩸</span>
                <span>Кубики Голода (Hunger):</span>
                <strong className="text-red-500 font-mono font-bold text-sm">{hungerDice}</strong>
              </span>
              <span className="text-zinc-500 text-[11px]">
                (заменяют {Math.min(hungerDice, finalPool)} куб. из пула)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={hungerDice}
              onChange={(e) => setHungerDice(parseInt(e.target.value))}
              className="w-full accent-red-700 cursor-pointer"
            />
          </div>

          {/* Difficulty selector */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-zinc-300 mb-1">
              <span>Сложность (Difficulty): <strong className="text-red-400 font-bold text-sm font-mono">{difficulty}</strong></span>
              <span className="text-zinc-500 font-sans">
                {difficulty <= 1 ? 'Легко' : difficulty === 2 ? 'Стандарт' : difficulty === 3 ? 'Сложно' : difficulty === 4 ? 'Очень сложно' : 'Экстремально'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Modifiers */}
          <div className="pt-2 space-y-2 border-t border-zinc-900 text-xs">
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={bloodBuff}
                onChange={(e) => setBloodBuff(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                Прилив крови (Blood Surge): +2 кубика к пулу
              </span>
            </label>

            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={spendWp}
                onChange={(e) => setSpendWp(e.target.checked)}
                className="rounded text-red-500 focus:ring-red-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Трата Силы Воли: переброс кубиков
              </span>
            </label>
          </div>

          {/* Total summary & Action buttons */}
          <div className="bg-zinc-950 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">Итоговый пул:</span>
              <div className="text-xl font-bold font-serif text-red-500">
                {finalPool} d10 {hungerDice > 0 && <span className="text-xs text-red-400 font-mono">({hungerDice} 🩸)</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRouseCheck}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/40 text-xs font-bold rounded-lg cursor-pointer"
                title="Бросок 1d10 на проверку крови"
              >
                🩸 Rouse Check
              </button>
              <button
                type="button"
                onClick={handleRoll}
                className="px-5 py-2.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-bold rounded-lg shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Dices className="w-4 h-4" />
                Бросить!
              </button>
            </div>
          </div>

          {/* Rouse check alert */}
          {rouseResult && (
            <div className={`p-2.5 rounded text-xs border flex items-center justify-between ${
              rouseResult.success
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}>
              <span>
                Проверка крови: выкинуто <strong className="font-mono text-sm">{rouseResult.roll}</strong> —{' '}
                {rouseResult.success ? 'УСПЕХ (Голод не вырос)' : 'ПРОВАЛ (Голод +1!)'}
              </span>
              <button
                type="button"
                onClick={() => setRouseResult(null)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right column: Results & History */}
        <div className="space-y-4 flex flex-col">
          {lastResult ? (
            <div className="bg-[#0a0a0a] border border-red-900/20 rounded-xl p-5 shadow-inner">
              <div className="flex items-center justify-between text-xs text-zinc-500 pb-2 border-b border-zinc-900 font-sans">
                <span>{lastResult.actionName} (Сложность: {lastResult.difficulty})</span>
                <span>{lastResult.rolledAt}</span>
              </div>

              {/* Status banner */}
              <div className="py-4 text-center">
                {lastResult.isMessyCritical ? (
                  <div className="text-amber-500 flex flex-col items-center gap-1">
                    <AlertOctagon className="w-10 h-10 animate-pulse text-amber-500" />
                    <span className="text-lg font-black tracking-wider uppercase font-serif">
                      ГРЯЗНЫЙ ТРИУМФ (MESSY CRITICAL)!
                    </span>
                    <span className="text-xs text-amber-300">
                      Успех достигнут ценой пробуждения Зверя! Сопутствующий ущерб или клановая мания.
                    </span>
                  </div>
                ) : lastResult.isBestialFailure ? (
                  <div className="text-red-500 flex flex-col items-center gap-1">
                    <AlertOctagon className="w-10 h-10 animate-pulse text-red-500" />
                    <span className="text-lg font-black tracking-wider uppercase font-serif">
                      ЗВЕРИНЫЙ ПРОВАЛ (BESTIAL FAILURE)!
                    </span>
                    <span className="text-xs text-red-300">
                      Провал действия и выход Зверя из-под контроля! Немедленная компульсия.
                    </span>
                  </div>
                ) : lastResult.critSuccess ? (
                  <div className="text-amber-400 flex flex-col items-center gap-1">
                    <Sparkles className="w-10 h-10 text-amber-400" />
                    <span className="text-lg font-black tracking-wider uppercase font-serif">
                      КРИТИЧЕСКИЙ ТРИУМФ ({lastResult.successes} УСПЕХОВ)!
                    </span>
                    <span className="text-xs text-amber-200">
                      Великолепное исполнение без вмешательства Зверя.
                    </span>
                  </div>
                ) : lastResult.isSuccess ? (
                  <div className="text-emerald-400 flex flex-col items-center gap-1">
                    <CheckCircle className="w-9 h-9 text-emerald-400" />
                    <span className="text-lg font-bold tracking-wide font-serif">
                      УСПЕХ ({lastResult.successes} {lastResult.successes === 1 ? 'успех' : 'успеха'})
                    </span>
                    <span className="text-xs text-zinc-300">
                      Действие успешно завершено.
                    </span>
                  </div>
                ) : (
                  <div className="text-zinc-500 flex flex-col items-center gap-1">
                    <RotateCcw className="w-8 h-8 text-zinc-500" />
                    <span className="text-base font-semibold font-serif">НЕУДАЧА ({lastResult.successes} успехов)</span>
                    <span className="text-xs text-zinc-500">
                      Не хватило успехов для преодоления сложности {lastResult.difficulty}.
                    </span>
                  </div>
                )}
              </div>

              {/* Individual dice badges */}
              <div className="pt-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block font-sans">
                  Выпавшие кубики:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* Regular dice */}
                  {lastResult.regularRolls?.map((val, idx) => {
                    const isSuccess = val >= 6;
                    const isTen = val === 10;
                    return (
                      <div
                        key={`reg-${idx}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-md font-mono ${
                          isTen
                            ? 'bg-amber-600 text-black ring-2 ring-amber-400'
                            : isSuccess
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'bg-zinc-950 text-zinc-600 border border-zinc-800'
                        }`}
                        title={`Обычный кубик: ${val}`}
                      >
                        {val}
                      </div>
                    );
                  })}

                  {/* Hunger dice */}
                  {lastResult.hungerRolls?.map((val, idx) => {
                    const isSuccess = val >= 6;
                    const isTen = val === 10;
                    const isOne = val === 1;
                    return (
                      <div
                        key={`hng-${idx}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-md font-mono ${
                          isTen
                            ? 'bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
                            : isOne
                            ? 'bg-red-950 text-red-400 ring-2 ring-red-700'
                            : isSuccess
                            ? 'bg-red-900 text-red-100 border border-red-700'
                            : 'bg-red-950/70 text-red-500/80 border border-red-900/60'
                        }`}
                        title={`Кубик Голода: ${val}`}
                      >
                        {val}🩸
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 flex flex-col items-center justify-center h-48">
              <Dices className="w-12 h-12 mb-2 text-zinc-700" />
              <p className="text-sm font-serif">Сформируйте пул и нажмите кнопку «Бросить!»</p>
            </div>
          )}

          {/* History */}
          {rollHistory.length > 0 && (
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl p-3 flex-1 flex flex-col max-h-48 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-sans border-b border-zinc-900 pb-1">
                <History className="w-3.5 h-3.5 text-zinc-500" />
                <span>История бросков</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {rollHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-zinc-400 py-1 border-b border-zinc-950 text-[11px]">
                    <span className="truncate max-w-[170px]">{h.actionName}</span>
                    <div className="flex items-center gap-2">
                      <span className={h.isSuccess ? 'text-emerald-400' : 'text-zinc-600'}>
                        {h.successes} усп.
                      </span>
                      <span className="text-[10px] text-zinc-600">{h.rolledAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
