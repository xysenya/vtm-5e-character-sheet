import React, { useState } from 'react';
import { CharacterSheet, TraitItem } from '../types';
import { DotRating } from './DotRating';
import { Dices, Plus, Trash2 } from 'lucide-react';

interface AbilitiesSectionProps {
  sheet: CharacterSheet;
  accentColor: string;
  maxTrait: number;
  onUpdateAbility: (category: 'talents' | 'skills' | 'knowledges', id: string, updates: Partial<TraitItem>) => void;
  onAddAbility: (category: 'talents' | 'skills' | 'knowledges', name: string) => void;
  onDeleteAbility: (category: 'talents' | 'skills' | 'knowledges', id: string) => void;
  onQuickRollAbility: (abilId: string) => void;
}

export const AbilitiesSection: React.FC<AbilitiesSectionProps> = ({
  sheet,
  accentColor,
  maxTrait,
  onUpdateAbility,
  onAddAbility,
  onDeleteAbility,
  onQuickRollAbility,
}) => {
  const [newTalentName, setNewTalentName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newKnowledgeName, setNewKnowledgeName] = useState('');

  const [showAddTalent, setShowAddTalent] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);

  const renderAbilityRow = (category: 'talents' | 'skills' | 'knowledges', item: TraitItem) => {
    const hasSpecialty = item.value >= 4;

    return (
      <div
        key={item.id}
        className="group bg-zinc-900/30 px-2.5 py-1 rounded border-l-2 border-zinc-800/80 hover:border-red-900/80 transition-all mb-1"
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onQuickRollAbility(item.id)}
              className="text-zinc-500 hover:text-red-400 cursor-pointer p-0.5 rounded transition-colors shrink-0"
              title={`Бросить кубики со способностью ${item.name}`}
            >
              <Dices className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-zinc-200 truncate font-medium font-serif">
              {item.name}
            </span>
            {item.nameEn && (
              <span className="text-[10px] text-zinc-500 hidden sm:inline truncate font-sans">
                ({item.nameEn})
              </span>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <DotRating
              id={`abil-${item.id}`}
              value={item.value}
              max={maxTrait}
              min={0}
              onChange={(newVal) => onUpdateAbility(category, item.id, { value: newVal })}
              accentColor={accentColor}
              size="sm"
            />
            {item.isCustom && (
              <button
                type="button"
                onClick={() => onDeleteAbility(category, item.id)}
                className="text-zinc-600 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                title="Удалить способность"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Specialty field for 4+ dots */}
        {hasSpecialty && (
          <div className="mt-0.5 pl-5">
            <input
              type="text"
              placeholder="Специализация (4+ точки)..."
              value={item.specialty || ''}
              onChange={(e) => onUpdateAbility(category, item.id, { specialty: e.target.value })}
              className="w-full text-[10px] bg-zinc-950/70 border-b border-red-900/50 text-red-300 placeholder:text-zinc-600 px-1 py-0.5 focus:outline-none focus:border-red-500 italic"
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
          Способности (Abilities)
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          Точки от 0 до {maxTrait}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Talents */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
              Таланты (Talents)
            </h3>
            <div className="space-y-0.5">
              {sheet.abilities.talents.map((t) => renderAbilityRow('talents', t))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-zinc-800/80">
            {showAddTalent ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Новый талант..."
                  value={newTalentName}
                  onChange={(e) => setNewTalentName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTalentName.trim()) {
                      onAddAbility('talents', newTalentName.trim());
                      setNewTalentName('');
                      setShowAddTalent(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTalentName.trim()) {
                      onAddAbility('talents', newTalentName.trim());
                      setNewTalentName('');
                      setShowAddTalent(false);
                    }
                  }}
                  className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-900/70 text-red-200 rounded text-xs cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTalent(false)}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTalent(true)}
                className="w-full py-1 text-xs text-zinc-500 hover:text-red-400 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Добавить строку таланта
              </button>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
              Навыки (Skills)
            </h3>
            <div className="space-y-0.5">
              {sheet.abilities.skills.map((s) => renderAbilityRow('skills', s))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-zinc-800/80">
            {showAddSkill ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Новый навык..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkillName.trim()) {
                      onAddAbility('skills', newSkillName.trim());
                      setNewSkillName('');
                      setShowAddSkill(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillName.trim()) {
                      onAddAbility('skills', newSkillName.trim());
                      setNewSkillName('');
                      setShowAddSkill(false);
                    }
                  }}
                  className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-900/70 text-red-200 rounded text-xs cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddSkill(true)}
                className="w-full py-1 text-xs text-zinc-500 hover:text-red-400 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Добавить строку навыка
              </button>
            )}
          </div>
        </div>

        {/* Knowledges */}
        <div className="bg-zinc-950/50 p-3.5 rounded-lg border border-zinc-800/80 hover:border-red-900/30 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-red-700 font-bold border-b border-red-900/20 pb-2 mb-3 font-sans">
              Познания (Knowledges)
            </h3>
            <div className="space-y-0.5">
              {sheet.abilities.knowledges.map((k) => renderAbilityRow('knowledges', k))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-zinc-800/80">
            {showAddKnowledge ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Новое познание..."
                  value={newKnowledgeName}
                  onChange={(e) => setNewKnowledgeName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:border-red-900 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKnowledgeName.trim()) {
                      onAddAbility('knowledges', newKnowledgeName.trim());
                      setNewKnowledgeName('');
                      setShowAddKnowledge(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newKnowledgeName.trim()) {
                      onAddAbility('knowledges', newKnowledgeName.trim());
                      setNewKnowledgeName('');
                      setShowAddKnowledge(false);
                    }
                  }}
                  className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-900/70 text-red-200 rounded text-xs cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddKnowledge(false)}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddKnowledge(true)}
                className="w-full py-1 text-xs text-zinc-500 hover:text-red-400 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Добавить строку познания
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
