import React from 'react';
import { CharacterSheet, TraitItem } from '../types';
import { DotRating } from './DotRating';
import { Dices } from 'lucide-react';

interface AttributesSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  maxTrait: number;
  onUpdateAttribute: (category: 'physical' | 'social' | 'mental', traitKey: string, updates: Partial<TraitItem>) => void;
  onQuickRollAttribute: (attrId: string) => void;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({
  sheet,
  accentColor,
  maxTrait,
  onUpdateAttribute,
  onQuickRollAttribute,
}) => {
  const renderAttributeRow = (category: 'physical' | 'social' | 'mental', traitKey: string, trait: TraitItem) => {
    const hasSpecialty = trait.value >= 4;

    return (
      <div
        key={trait.id}
        className="group bg-zinc-900/40 px-2.5 py-1.5 rounded border-l-2 border-zinc-800 hover:border-red-900/80 transition-all mb-1.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onQuickRollAttribute(trait.id)}
              className="text-zinc-500 hover:text-red-400 cursor-pointer p-0.5 rounded transition-colors"
              title={`Бросить кубики с характеристикой ${trait.name}`}
            >
              <Dices className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-white font-serif truncate">
              {trait.name}
            </span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline font-sans">
              ({trait.nameEn})
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <DotRating
              id={`attr-${trait.id}`}
              value={trait.value}
              max={maxTrait}
              min={trait.id === 'app' && sheet.info.clan === 'nosferatu' ? 0 : 1}
              onChange={(newVal) => onUpdateAttribute(category, traitKey, { value: newVal })}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Specialty field for high ratings (4+) */}
        {hasSpecialty && (
          <div className="mt-1 pl-5">
            <input
              type="text"
              placeholder="Специализация (4+ точки)..."
              value={trait.specialty || ''}
              onChange={(e) => onUpdateAttribute(category, traitKey, { specialty: e.target.value })}
              className="w-full text-[11px] bg-zinc-950/70 border-b border-red-900/50 text-red-300 placeholder:text-zinc-600 px-1 py-0.5 focus:outline-none focus:border-red-500 italic"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="bg-[#0d0d0d]/90 border border-red-900/30 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/20">
        <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-700" />
          Характеристики (Attributes)
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          Базовое значение: 1 точка • Лимит: {maxTrait}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Physical */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors">
          <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
            Физические (Physical)
          </h3>
          <div className="space-y-1">
            {renderAttributeRow('physical', 'strength', sheet.attributes.physical.strength)}
            {renderAttributeRow('physical', 'dexterity', sheet.attributes.physical.dexterity)}
            {renderAttributeRow('physical', 'stamina', sheet.attributes.physical.stamina)}
          </div>
        </div>

        {/* Social */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors">
          <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
            Социальные (Social)
          </h3>
          <div className="space-y-1">
            {renderAttributeRow('social', 'charisma', sheet.attributes.social.charisma)}
            {renderAttributeRow('social', 'manipulation', sheet.attributes.social.manipulation)}
            {renderAttributeRow('social', 'appearance', sheet.attributes.social.appearance)}
          </div>
        </div>

        {/* Mental */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors">
          <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
            Ментальные (Mental)
          </h3>
          <div className="space-y-1">
            {renderAttributeRow('mental', 'perception', sheet.attributes.mental.perception)}
            {renderAttributeRow('mental', 'intelligence', sheet.attributes.mental.intelligence)}
            {renderAttributeRow('mental', 'wits', sheet.attributes.mental.wits)}
          </div>
        </div>
      </div>
    </section>
  );
};
