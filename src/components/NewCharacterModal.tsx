import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Dices,
  Sparkles,
  X,
  Shuffle,
  Info,
  FileText,
} from 'lucide-react';
import { CharacterSheet, ClanId } from '../types';
import { CLAN_THEMES } from '../data/clans';
import { PREDATOR_TYPES } from '../data/predatorTypes';
import {
  generateV5Character,
  CONCEPT_ARCHETYPES,
  V5_NAMES_MALE,
  V5_NAMES_FEMALE,
  V5_SIRES,
  V5GeneratorOptions,
} from '../utils/v5CharacterGenerator';
import { createBlankCharacterSheet } from '../utils/defaultCharacter';

interface NewCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (character: CharacterSheet, isBlank?: boolean) => void;
}

export const NewCharacterModal: React.FC<NewCharacterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // Generator form states
  const [clanChoice, setClanChoice] = useState<string>('random');
  const [predatorChoice, setPredatorChoice] = useState<string>('random');
  const [conceptChoice, setConceptChoice] = useState<string>('random');
  const [skillTemplate, setSkillTemplate] = useState<'balanced' | 'specialist' | 'jack'>('balanced');
  const [name, setName] = useState<string>('');
  const [sire, setSire] = useState<string>('');

  // Random preview seed
  const [previewSeed, setPreviewSeed] = useState<number>(() => Date.now());

  const generatorOptions: V5GeneratorOptions = useMemo(() => {
    return {
      clanId: clanChoice === 'random' ? 'random' : (clanChoice as ClanId),
      predatorTypeId: predatorChoice === 'random' ? 'random' : predatorChoice,
      conceptId: conceptChoice === 'random' ? 'random' : conceptChoice,
      skillTemplate,
      name: name.trim() || undefined,
      sire: sire.trim() || undefined,
    };
  }, [clanChoice, predatorChoice, conceptChoice, skillTemplate, name, sire, previewSeed]);

  const previewCharacter = useMemo(() => {
    return generateV5Character(generatorOptions);
  }, [generatorOptions]);

  const handleRandomizeName = () => {
    const isFem = Math.random() > 0.5;
    const pool = isFem ? V5_NAMES_FEMALE : V5_NAMES_MALE;
    setName(pool[Math.floor(Math.random() * pool.length)]);
  };

  const handleRandomizeSire = () => {
    setSire(V5_SIRES[Math.floor(Math.random() * V5_SIRES.length)]);
  };

  const handleFullRandomize = () => {
    setClanChoice('random');
    setPredatorChoice('random');
    setConceptChoice('random');
    setName('');
    setSire('');
    setPreviewSeed(Date.now());
  };

  const handleApplyCreation = () => {
    onConfirm(previewCharacter, false);
  };

  const handleCreateBlank = () => {
    const blankChar = createBlankCharacterSheet();
    onConfirm(blankChar, true);
  };

  const clansList = Object.entries(CLAN_THEMES);
  const predatorList = Object.entries(PREDATOR_TYPES);

  return (
    <div
      id="new-character-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs overflow-y-auto overflow-x-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="new-character-modal-container"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl shadow-black/95 border border-red-900/50 bg-[#0d0d0d] text-zinc-100 overflow-hidden my-auto"
      >
        {/* Ornate top blood line */}
        <div className="h-[2px] bg-gradient-to-r from-red-950 via-red-600 to-red-950 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-red-900/30 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-500 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-benguiat uppercase tracking-wider text-red-600">
                Создание нового персонажа (V5)
              </h2>
              <p className="text-xs text-zinc-400">
                Генерация сородича по официальным правилам Vampire: The Masquerade 5th Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFullRandomize}
              className="px-3 py-1.5 rounded-lg border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
              title="Сгенерировать полностью случайного персонажа"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Случайно</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two columns (Controls & Live Preview) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#0d0d0d]">
          {/* Left Column: Configuration Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Clan & Predator Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Clan Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Клан Сородича
                </label>
                <select
                  value={clanChoice}
                  onChange={(e) => setClanChoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 text-xs font-medium focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="random">🎲 Случайный клан</option>
                  {clansList.map(([id, clan]) => (
                    <option key={id} value={id}>
                      {clan.name} ({clan.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Predator Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Тип хищника (Стиль охоты)
                </label>
                <select
                  value={predatorChoice}
                  onChange={(e) => setPredatorChoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 text-xs font-medium focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="random">🎲 Случайный стиль охоты</option>
                  {predatorList.map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.name} ({p.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Concept Archetype */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Концепция персонажа
              </label>
              <select
                value={conceptChoice}
                onChange={(e) => setConceptChoice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 text-xs font-medium focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="random">🎲 Случайная концепция (под клан)</option>
                {CONCEPT_ARCHETYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-400 mt-1 italic">
                {previewCharacter.info.concept} — {previewCharacter.info.ambition}
              </p>
            </div>

            {/* Name and Sire Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Имя персонажа
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeName}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Dices className="w-3 h-3" /> Случайное
                  </button>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Напр. ${previewCharacter.info.name || 'Маркус Вейн'}`}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 text-xs font-serif focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              {/* Sire */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Сир персонажа
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeSire}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Dices className="w-3 h-3" /> Случайный
                  </button>
                </div>
                <input
                  type="text"
                  value={sire}
                  onChange={(e) => setSire(e.target.value)}
                  placeholder={`Напр. ${previewCharacter.info.sire || 'Барон Артур «Седой»'}`}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 text-xs font-serif focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Skill Distribution Template (V5 Rules) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Распределение навыков (Правила V5)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillTemplate('balanced')}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                    skillTemplate === 'balanced'
                      ? 'border-red-600 bg-red-950/40 text-white shadow-xs'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">Сбалансированный</div>
                  <div className="text-[10px] opacity-75 mt-0.5">3×3, 5×2, 7×1 (26 точек)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSkillTemplate('specialist')}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                    skillTemplate === 'specialist'
                      ? 'border-red-600 bg-red-950/40 text-white shadow-xs'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">Специалист</div>
                  <div className="text-[10px] opacity-75 mt-0.5">1×4, 3×3, 3×2, 3×1 (22 точки)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSkillTemplate('jack')}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                    skillTemplate === 'jack'
                      ? 'border-red-600 bg-red-950/40 text-white shadow-xs'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">На все руки</div>
                  <div className="text-[10px] opacity-75 mt-0.5">1×3, 8×2, 10×1 (29 точек)</div>
                </button>
              </div>
            </div>

            {/* V5 Rules Compliance Info Banner */}
            <div className="p-3 rounded-lg border border-red-950/60 bg-red-950/20 text-zinc-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px] leading-relaxed">
                <span className="font-bold text-red-400 block">Стандарты создания V5:</span>
                <p className="text-zinc-400">
                  Атрибуты: 4/3/3/3/2/2/2/2/1 (22 точки) • Дисциплины: 2 клановые + 1 от стиля охоты с силами крови • 7 преимуществ и 2 недостатка • Здоровье = Вын + 3, Воля = Сам + Реш.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Sheet Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/70 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b pb-2 border-red-900/30">
                <span className="text-xs font-benguiat font-bold uppercase tracking-wider text-red-600">
                  Предпросмотр Сородича
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/50 font-bold">
                  V5 Правила соблюдены
                </span>
              </div>

              {/* Character Identity */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Имя:</span>
                  <span className="font-bold text-zinc-200">
                    {previewCharacter.info.name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Клан:</span>
                  <span className="font-bold text-red-500">
                    {CLAN_THEMES[previewCharacter.info.clan]?.name || previewCharacter.info.clan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Стиль охоты:</span>
                  <span className="font-medium text-zinc-300">
                    {previewCharacter.info.predatorType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Сир:</span>
                  <span className="text-zinc-300">
                    {previewCharacter.info.sire || '—'}
                  </span>
                </div>
              </div>

              {/* Attributes (V5: 4, 3, 3, 3, 2, 2, 2, 2, 1) */}
              <div className="border-t pt-2 border-zinc-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Атрибуты (4 • 3×3 • 4×2 • 1):
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-400 block text-[10px]">Физ</span>
                    <div className="font-mono">
                      Сил: <span className="font-bold text-red-500">{previewCharacter.attributes.physical.strength.value}</span> | Лов:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.physical.dexterity.value}</span> | Вын:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.physical.stamina.value}</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-400 block text-[10px]">Соц</span>
                    <div className="font-mono">
                      Хар: <span className="font-bold text-red-500">{previewCharacter.attributes.social.charisma.value}</span> | Ман:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.social.manipulation.value}</span> | Сам:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.social.composure.value}</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-400 block text-[10px]">Мент</span>
                    <div className="font-mono">
                      Инт: <span className="font-bold text-red-500">{previewCharacter.attributes.mental.intelligence.value}</span> | Смек:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.mental.wits.value}</span> | Реш:{' '}
                      <span className="font-bold text-red-500">{previewCharacter.attributes.mental.resolve.value}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disciplines & Library Powers */}
              <div className="border-t pt-2 border-zinc-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Дисциплины и силы крови (из библиотеки):
                </span>
                <div className="space-y-1 text-xs">
                  {previewCharacter.v5Disciplines
                    .filter((d) => d.name && d.dots > 0)
                    .map((disc, idx) => (
                      <div key={disc.id || idx} className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-500">{disc.name}</span>
                          <span className="font-mono text-zinc-300 font-bold">{disc.dots} ●</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {disc.powers.filter(Boolean).join(', ') || 'Сила 1-го уровня'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Merits & Flaws */}
              <div className="border-t pt-2 border-zinc-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Преимущества и недостатки:
                </span>
                <div className="text-[11px] space-y-0.5">
                  <div className="text-emerald-400">
                    <span className="font-bold">Преимущества:</span>{' '}
                    {previewCharacter.v5Merits
                      .filter((m) => m.name && m.dots > 0)
                      .map((m) => `${m.name} (${m.dots}●)`)
                      .join(', ') || 'Стандартный набор'}
                  </div>
                  <div className="text-rose-400">
                    <span className="font-bold">Недостатки:</span>{' '}
                    {previewCharacter.v5Flaws
                      .filter((f) => f.name && f.dots > 0)
                      .map((f) => `${f.name} (${f.dots}●)`)
                      .join(', ') || 'Стандартный набор'}
                  </div>
                </div>
              </div>

              {/* Health & Willpower */}
              <div className="border-t pt-2 border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Здоровье: <strong className="text-zinc-200">{previewCharacter.v5Tracks.health.max}</strong></span>
                <span>Сила воли: <strong className="text-zinc-200">{previewCharacter.v5Tracks.willpower.max}</strong></span>
                <span>Человечность: <strong className="text-zinc-200">{previewCharacter.v5Tracks.humanity.value}</strong></span>
                <span>Сила крови: <strong className="text-zinc-200">{previewCharacter.v5Blood.potency}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-red-900/30 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Отмена
            </button>

            {/* Separate button to create a completely blank character sheet */}
            <button
              type="button"
              onClick={handleCreateBlank}
              className="px-4 py-2 rounded-lg border border-zinc-700/80 hover:border-red-700/70 bg-zinc-900 hover:bg-zinc-800/90 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Создать полностью пустой лист персонажа без заполненных данных"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Создать чистый бланк</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFullRandomize}
              className="px-4 py-2 rounded-lg border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Dices className="w-4 h-4 text-amber-500" />
              <span>Перемешать (🎲)</span>
            </button>

            <button
              type="button"
              onClick={handleApplyCreation}
              className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Создать персонажа</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
