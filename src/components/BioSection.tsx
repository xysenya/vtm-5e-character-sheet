import React from 'react';
import { CharacterSheet } from '../types';
import { User, Home, BookOpen, Shield } from 'lucide-react';

interface BioSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  onUpdateBio: (updates: Partial<CharacterSheet['notes']>) => void;
}

export const BioSection: React.FC<BioSectionProps> = ({
  sheet,
  accentColor,
  onUpdateBio,
}) => {
  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-red-900/20">
        <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-500" />
          Биография, Внешность и Заметки (Lore & Notes)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Appearance & Age */}
        <div className="space-y-3 bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-850">
          <h3 className="font-bold text-white font-serif flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            Внешность и Даты
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">Видимый возраст:</label>
              <input
                type="text"
                value={sheet.notes.apparentAge || ''}
                onChange={(e) => onUpdateBio({ apparentAge: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
                placeholder="25 лет"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">Истинный возраст / Рождение:</label>
              <input
                type="text"
                value={sheet.notes.dateOfBirth || ''}
                onChange={(e) => onUpdateBio({ dateOfBirth: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
                placeholder="1884 г."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">Дата Становления (Объятия):</label>
            <input
              type="text"
              value={sheet.notes.dateOfEmbrace || ''}
              onChange={(e) => onUpdateBio({ dateOfEmbrace: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-red-900 focus:outline-none"
              placeholder="1921 г."
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">
              Описание внешности, одежды и шрамов:
            </label>
            <textarea
              rows={3}
              value={sheet.notes.appearanceDescription || ''}
              onChange={(e) => onUpdateBio({ appearanceDescription: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:border-red-900 focus:outline-none custom-scrollbar"
              placeholder="Опишите рост, телосложение, манеру одеваться, прическу, цвет глаз и приметные черты..."
            />
          </div>
        </div>

        {/* Possessions & Haven details */}
        <div className="space-y-3 bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-850">
          <h3 className="font-bold text-white font-serif flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-zinc-400" />
            Убежище и Снаряжение
          </h3>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">
              Убежище (Безопасность, охрана, тайники):
            </label>
            <textarea
              rows={2}
              value={sheet.notes.havenDescription || ''}
              onChange={(e) => onUpdateBio({ havenDescription: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:border-red-900 focus:outline-none custom-scrollbar"
              placeholder="Укрепленный подвал заброшенного театра, тяжелые стальные жалюзи, скрытый аварийный тоннель..."
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-sans">
              Снаряжение, оружие и реликвии:
            </label>
            <textarea
              rows={2}
              value={sheet.notes.equipment || ''}
              onChange={(e) => onUpdateBio({ equipment: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:border-red-900 focus:outline-none custom-scrollbar"
              placeholder="Пистолет Glock 19, антикварный серебряный кинжал, связка отмычек, шифрованный телефон..."
            />
          </div>
        </div>
      </div>

      {/* Chronicle Notes and Allies */}
      <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-850 space-y-2">
        <label className="text-xs font-bold text-white font-serif block">
          Заметки хроники, тайны и долги крови:
        </label>
        <textarea
          rows={3}
          value={sheet.notes.otherNotes || ''}
          onChange={(e) => onUpdateBio({ otherNotes: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:border-red-900 focus:outline-none custom-scrollbar"
          placeholder="Договоры, престиж при дворе Камарильи, долги перед Тремерами, текущие зацепки расследования..."
        />
      </div>
    </section>
  );
};
