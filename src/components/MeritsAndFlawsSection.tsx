import React, { useState } from 'react';
import { CharacterSheet, MeritFlawItem } from '../types';
import { Award, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';

interface MeritsAndFlawsSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  onAddCustomMeritFlaw: (item: Omit<MeritFlawItem, 'id'>) => void;
  onDeleteMeritFlaw: (id: string) => void;
  onOpenLibrary: () => void;
}

export const MeritsAndFlawsSection: React.FC<MeritsAndFlawsSectionProps> = ({
  sheet,
  accentColor,
  onAddCustomMeritFlaw,
  onDeleteMeritFlaw,
  onOpenLibrary,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'merit' | 'flaw'>('merit');
  const [cost, setCost] = useState(1);
  const [category, setCategory] = useState<'physical' | 'social' | 'mental' | 'supernatural'>('physical');
  const [description, setDescription] = useState('');

  const merits = (sheet.meritsAndFlaws || []).filter((item) => item.type === 'merit');
  const flaws = (sheet.meritsAndFlaws || []).filter((item) => item.type === 'flaw');

  const totalMeritsCost = merits.reduce((sum, m) => sum + (m.points || m.cost || 0), 0);
  const totalFlawsGain = flaws.reduce((sum, f) => sum + (f.points || f.cost || 0), 0);
  const netBalance = totalFlawsGain - totalMeritsCost;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCustomMeritFlaw({
      name: name.trim(),
      type,
      points: cost,
      cost,
      category,
      description: description.trim() || undefined,
    });
    setName('');
    setDescription('');
    setShowAdd(false);
  };

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-red-900/20 gap-2">
        <div>
          <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-red-500" />
            Достоинства и Недостатки (Merits & Flaws)
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans">
            Особые черты, дающие бонусы или создающие сюжетные трудности
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono">
            <span className="text-emerald-400 font-bold">+{totalMeritsCost}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-red-400 font-bold">-{totalFlawsGain}</span>
            <span className="text-zinc-500 ml-1.5 font-sans">
              (Баланс: <strong className={netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>{netBalance > 0 ? `+${netBalance}` : netBalance}</strong>)
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/70 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            Из библиотеки
          </button>

          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            Своё
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-zinc-950/90 rounded-lg border border-red-900/40 space-y-3">
          <h4 className="text-xs font-bold text-white font-serif">
            Создать пользовательскую черту
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Название черты..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'merit' | 'flaw')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
              >
                <option value="merit">Достоинство (+)</option>
                <option value="flaw">Недостаток (-)</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                min={1}
                max={7}
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
                placeholder="Стоимость (1-7)"
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Описание эффекта или правил..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:border-red-900 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-900/70 rounded text-xs font-bold cursor-pointer transition-colors"
            >
              Сохранить черту
            </button>
          </div>
        </form>
      )}

      {/* Two columns: Merits vs Flaws */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Merits column */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold pb-2 border-b border-zinc-900 flex items-center justify-between font-sans">
            <span>Достоинства ({merits.length})</span>
            <span className="text-[11px] font-mono">+{totalMeritsCost} очков</span>
          </h3>

          {merits.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-3">
              Нет выбранных достоинств. Добавьте из библиотеки!
            </p>
          ) : (
            merits.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-850 hover:border-emerald-900/50 transition-all flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-serif text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-bold font-mono">
                      +{item.points || item.cost} т.
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteMeritFlaw(item.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Flaws column */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-widest text-red-400 font-bold pb-2 border-b border-zinc-900 flex items-center justify-between font-sans">
            <span>Недостатки ({flaws.length})</span>
            <span className="text-[11px] font-mono">-{totalFlawsGain} очков</span>
          </h3>

          {flaws.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-3">
              Нет выбранных недостатков. Добавьте из библиотеки!
            </p>
          ) : (
            flaws.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-850 hover:border-red-900/50 transition-all flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-serif text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-900/80 font-bold font-mono">
                      -{item.points || item.cost} т.
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteMeritFlaw(item.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
