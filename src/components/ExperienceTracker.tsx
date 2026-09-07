import React, { useState } from 'react';
import { CharacterSheet, ExperienceLogItem } from '../types';
import { TrendingUp, Plus, Minus, History, Trash2 } from 'lucide-react';

interface ExperienceTrackerProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateExperience: (updates: Partial<CharacterSheet['experience']>) => void;
  onAddLogEntry: (entry: Omit<ExperienceLogItem, 'id' | 'date'>) => void;
  onDeleteLogEntry: (id: string) => void;
}

export const ExperienceTracker: React.FC<ExperienceTrackerProps> = ({
  sheet,
  accentColor,
  onUpdateExperience,
  onAddLogEntry,
  onDeleteLogEntry,
}) => {
  const [showAddLog, setShowAddLog] = useState(false);
  const [logReason, setLogReason] = useState('');
  const [logAmount, setLogAmount] = useState(2);
  const [logType, setLogType] = useState<'gained' | 'spent'>('gained');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logReason.trim()) return;
    onAddLogEntry({
      reason: logReason.trim(),
      amount: Math.abs(logAmount),
      type: logType,
    });
    setLogReason('');
    setShowAddLog(false);
  };

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-red-900/20 gap-2">
        <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Опыт Персонажа (Experience Points)
        </h2>

        <button
          type="button"
          onClick={() => setShowAddLog(!showAddLog)}
          className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          Запись в журнал опыта
        </button>
      </div>

      {/* XP summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-sans">
            Всего получено:
          </span>
          <input
            type="number"
            min={0}
            value={sheet.experience.total}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value) || 0);
              onUpdateExperience({
                total: val,
                unspent: Math.max(0, val - sheet.experience.spent),
              });
            }}
            className="w-20 text-center text-xl font-bold font-mono text-white bg-transparent focus:outline-none focus:border-b border-red-800"
          />
        </div>

        <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-sans">
            Потрачено:
          </span>
          <input
            type="number"
            min={0}
            value={sheet.experience.spent}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value) || 0);
              onUpdateExperience({
                spent: val,
                unspent: Math.max(0, sheet.experience.total - val),
              });
            }}
            className="w-20 text-center text-xl font-bold font-mono text-red-400 bg-transparent focus:outline-none focus:border-b border-red-800"
          />
        </div>

        <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-sans">
            Свободный остаток:
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 block mt-0.5">
            {sheet.experience.unspent}
          </span>
        </div>
      </div>

      {/* Add log entry modal/inline form */}
      {showAddLog && (
        <form onSubmit={handleAddLog} className="mb-4 p-4 bg-zinc-950/90 rounded-lg border border-red-900/40 space-y-2">
          <h4 className="text-xs font-bold text-white font-serif">Новая запись опыта</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Причина (напр. Сессия 4: выживание, покупка Внимательности 3)..."
                value={logReason}
                onChange={(e) => setLogReason(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value as 'gained' | 'spent')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
              >
                <option value="gained">Получено (+)</option>
                <option value="spent">Потрачено (-)</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                min={1}
                value={logAmount}
                onChange={(e) => setLogAmount(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
                placeholder="Кол-во XP"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddLog(false)}
              className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-900/70 rounded text-xs font-bold cursor-pointer transition-colors"
            >
              Добавить в журнал
            </button>
          </div>
        </form>
      )}

      {/* History table */}
      {((sheet.experience.logs || sheet.experience.log || []).length > 0) && (
        <div className="mt-3">
          <span className="text-xs font-serif font-bold text-zinc-300 block mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-500" />
            Журнал опыта ({(sheet.experience.logs || sheet.experience.log || []).length})
          </span>
          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1">
            {(sheet.experience.logs || sheet.experience.log || []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 text-xs border border-zinc-850"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold ${
                      entry.type === 'gained' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {entry.type === 'gained' ? `+${entry.amount}` : `-${entry.amount}`} XP
                  </span>
                  <span className="text-zinc-300">{entry.reason || entry.description}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">{entry.date}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteLogEntry(entry.id)}
                    className="text-zinc-600 hover:text-red-400 cursor-pointer"
                    title="Удалить запись"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
