import React, { useState } from 'react';
import { Settings, ChevronDown, HelpCircle, Dices, X, Image, Sun, Moon } from 'lucide-react';
import { CharacterSheet, ClanId, TraitItem, V5SkillItem } from '../../types';
import { SheetHeader, SectionDivider } from './SheetHeader';
import { V5Dots, V5SquareTrack, V5HumanityTrack, V5HungerTrack } from './V5Controls';
import { CLAN_THEMES } from '../../data/clans';
import { ClanSymbol } from '../ClanSymbol';
import { useIsPrinting } from '../../utils/useIsPrinting';
import {
  HeaderSettingsModal,
  HeaderFieldKey,
  DEFAULT_HEADER_SLOTS,
  HEADER_FIELDS_MAP,
  GENERATION_OPTIONS,
  getGenerationDisplayLabel,
} from '../HeaderSettingsModal';
import { ClanSelectModal } from './ClanSelectModal';
import { PredatorTypeSelectModal } from './PredatorTypeSelectModal';
import { DisciplineSelectModal } from './DisciplineSelectModal';
import { DisciplinePowerSelectModal } from './DisciplinePowerSelectModal';
import { RandomizeAttributesModal } from './RandomizeAttributesModal';
import { RandomizeSkillsModal, SkillDistributionTemplate } from './RandomizeSkillsModal';
import { showFloatingDiceToast } from '../FloatingDiceRoller';

interface SheetPage1Props {
  sheet: CharacterSheet;
  onChange: (updated: CharacterSheet) => void;
  onOpenDiceRoller: (pool: number, label: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const SheetPage1: React.FC<SheetPage1Props> = ({
  sheet,
  onChange,
  onOpenDiceRoller,
  isDark = false,
  onToggleTheme,
}) => {
  const info = sheet.info;
  const tracks = sheet.v5Tracks || {
    health: { max: 5, superficial: 0, aggravated: 0 },
    willpower: { max: 5, superficial: 0, aggravated: 0 },
    humanity: { value: 7, stains: 0 },
    hunger: 1,
  };

  const attributes = sheet.attributes;
  const skills = sheet.v5Skills || [];
  const disciplines = sheet.v5Disciplines || [
    { id: 'd1', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd2', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd3', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd4', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd5', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd6', name: '', dots: 0, powers: ['', '', '', '', ''] },
  ];

  const isPrinting = useIsPrinting();
  const ph = (text: string) => (isPrinting ? '' : text);

  // State for header settings modal
  const [isHeaderSettingsOpen, setIsHeaderSettingsOpen] = useState(false);
  // State for clan selection modal
  const [isClanModalOpen, setIsClanModalOpen] = useState(false);
  // State for predator type selection modal
  const [isPredatorModalOpen, setIsPredatorModalOpen] = useState(false);
  // State for discipline selection modal
  const [selectedDisciplineSlot, setSelectedDisciplineSlot] = useState<number | null>(null);
  // State for discipline power selection modal
  const [selectedPowerSlot, setSelectedPowerSlot] = useState<{
    disciplineIndex: number;
    powerIndex: number;
    disciplineName: string;
    currentValue: string;
  } | null>(null);

  // States for attributes & skills help popups and randomization modals
  const [showAttrHelp, setShowAttrHelp] = useState(false);
  const [showSkillsHelp, setShowSkillsHelp] = useState(false);
  const [isRandomAttrModalOpen, setIsRandomAttrModalOpen] = useState(false);
  const [isRandomSkillsModalOpen, setIsRandomSkillsModalOpen] = useState(false);

  const handlePowerLineClick = (dIndex: number, pIndex: number) => {
    const disc = disciplines[dIndex];
    if (!disc || !disc.name || !disc.name.trim()) {
      showFloatingDiceToast('Для начала выберите дисциплину', 'warning');
      return;
    }
    setSelectedPowerSlot({
      disciplineIndex: dIndex,
      powerIndex: pIndex,
      disciplineName: disc.name,
      currentValue: disc.powers[pIndex] || '',
    });
  };

  // Check if slots are the temporary initial default from the prior update
  const isOldDefault = (slots?: string[]) => {
    if (!slots || slots.length !== 9) return true;
    const oldKeys = ['name', 'ambition', 'predatorType', 'clan', 'touchstones', 'generation', 'concept', 'chronicleTenet', 'sire'];
    return slots.every((s, i) => s === oldKeys[i]);
  };

  // Active 9 header slots configuration (defaulting to official V5 core rulebook:
  // Col 1: Имя, Хроника, Сир | Col 2: Концепция, Цель, Прихоть | Col 3: Стиль охоты, Клан, Поколение)
  const activeSlots: HeaderFieldKey[] =
    sheet.v5HeaderSlots && sheet.v5HeaderSlots.length === 9 && !isOldDefault(sheet.v5HeaderSlots)
      ? (sheet.v5HeaderSlots as HeaderFieldKey[])
      : DEFAULT_HEADER_SLOTS;

  const handleUpdateHeaderSlots = (newSlots: string[]) => {
    onChange({
      ...sheet,
      v5HeaderSlots: newSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to update sheet info
  const handleInfoChange = (key: keyof CharacterSheet['info'], value: string | number) => {
    const updatedInfo: any = {
      ...sheet.info,
      [key]: value,
    };
    // Keep concept and conceptDetail in sync
    if (key === 'conceptDetail') {
      updatedInfo.concept = String(value);
    } else if (key === 'concept') {
      updatedInfo.conceptDetail = String(value);
    }
    // Keep purpose and ambition in sync
    if (key === 'purpose') {
      updatedInfo.ambition = String(value);
    } else if (key === 'ambition') {
      updatedInfo.purpose = String(value);
    }

    onChange({
      ...sheet,
      info: updatedInfo,
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to update attribute value
  const handleAttrChange = (
    category: 'physical' | 'social' | 'mental',
    key: string,
    value: number
  ) => {
    const cat = attributes[category] as any;
    const current = cat[key] || { id: key, name: key, value: 1 };
    onChange({
      ...sheet,
      attributes: {
        ...attributes,
        [category]: {
          ...cat,
          [key]: {
            ...current,
            value,
          },
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to update skill value
  const handleSkillChange = (id: string, value: number) => {
    const updatedSkills = skills.map((s) => (s.id === id ? { ...s, value } : s));
    onChange({
      ...sheet,
      v5Skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to update skill specialty
  const handleSkillSpecialtyChange = (id: string, specialty: string) => {
    const updatedSkills = skills.map((s) => (s.id === id ? { ...s, specialty } : s));
    onChange({
      ...sheet,
      v5Skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    });
  };

  // Random distribution of attributes according to V5 rules (1x4, 3x3, 4x2, 1x1)
  const handleRandomizeAttributes = () => {
    const values = [4, 3, 3, 3, 2, 2, 2, 2, 1];
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    const [
      strengthVal,
      dexterityVal,
      staminaVal,
      charismaVal,
      manipulationVal,
      composureVal,
      intelligenceVal,
      witsVal,
      resolveVal,
    ] = values;

    const newHealthMax = staminaVal + 3;
    const newWillpowerMax = composureVal + resolveVal;

    onChange({
      ...sheet,
      attributes: {
        ...attributes,
        physical: {
          ...attributes.physical,
          strength: {
            ...attributes.physical.strength,
            value: strengthVal,
          },
          dexterity: {
            ...attributes.physical.dexterity,
            value: dexterityVal,
          },
          stamina: {
            ...attributes.physical.stamina,
            value: staminaVal,
          },
        },
        social: {
          ...attributes.social,
          charisma: {
            ...attributes.social.charisma,
            value: charismaVal,
          },
          manipulation: {
            ...attributes.social.manipulation,
            value: manipulationVal,
          },
          composure: {
            ...(attributes.social.composure || { id: 'com', name: 'Самообладание' }),
            value: composureVal,
          },
        },
        mental: {
          ...attributes.mental,
          intelligence: {
            ...attributes.mental.intelligence,
            value: intelligenceVal,
          },
          wits: {
            ...attributes.mental.wits,
            value: witsVal,
          },
          resolve: {
            ...(attributes.mental.resolve || { id: 'res', name: 'Решительность' }),
            value: resolveVal,
          },
        },
      },
      v5Tracks: {
        ...tracks,
        health: {
          ...tracks.health,
          max: newHealthMax,
        },
        willpower: {
          ...tracks.willpower,
          max: newWillpowerMax,
        },
      },
      updatedAt: new Date().toISOString(),
    });

    showFloatingDiceToast('Характеристики успешно распределены по правилам V5!', 'success');
  };

  // Random distribution of skills according to chosen template
  const handleRandomizeSkills = (
    template: SkillDistributionTemplate,
    clearSpecialties: boolean
  ) => {
    let pool: number[] = [];
    if (template === 'jack') {
      // 1x3, 8x2, 10x1, 8x0 = 27 skills
      pool = [
        3,
        2, 2, 2, 2, 2, 2, 2, 2,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0,
      ];
    } else if (template === 'balanced') {
      // 3x3, 5x2, 7x1, 12x0 = 27 skills
      pool = [
        3, 3, 3,
        2, 2, 2, 2, 2,
        1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
    } else {
      // specialist: 1x4, 3x3, 3x2, 3x1, 17x0 = 27 skills
      pool = [
        4,
        3, 3, 3,
        2, 2, 2,
        1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const updatedSkills = skills.map((s, idx) => ({
      ...s,
      value: pool[idx] ?? 0,
      specialty: clearSpecialties ? '' : s.specialty,
    }));

    onChange({
      ...sheet,
      v5Skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    });

    const templateNames = {
      jack: 'Мастер на все руки',
      balanced: 'Гармоничное развитие',
      specialist: 'Узкий специалист',
    };
    showFloatingDiceToast(`Навыки распределены по шаблону «${templateNames[template]}»!`, 'success');
  };

  // Helper to update tracks
  const handleTrackChange = (
    type: 'health' | 'willpower',
    superficial: number,
    aggravated: number,
    boxes?: ('empty' | 'superficial' | 'aggravated')[]
  ) => {
    onChange({
      ...sheet,
      v5Tracks: {
        ...tracks,
        [type]: {
          ...tracks[type],
          superficial,
          aggravated,
          boxes,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTrackMaxChange = (type: 'health' | 'willpower', max: number) => {
    onChange({
      ...sheet,
      v5Tracks: {
        ...tracks,
        [type]: {
          ...tracks[type],
          max: Math.max(1, Math.min(10, max)),
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleHumanityChange = (value: number, stains: number) => {
    onChange({
      ...sheet,
      v5Tracks: {
        ...tracks,
        humanity: { value, stains },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleHungerChange = (hunger: number) => {
    onChange({
      ...sheet,
      v5Tracks: {
        ...tracks,
        hunger,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to update discipline slot
  const handleDisciplineChange = (
    index: number,
    field: 'name' | 'dots' | 'powers',
    val: any,
    powerIndex?: number
  ) => {
    const newDisciplines = [...disciplines];
    const target = { ...newDisciplines[index] };

    if (field === 'name') {
      if (target.name !== val) {
        target.name = val;
        // Reset powers when selecting a new discipline or clearing it
        target.powers = ['', '', '', '', ''];
      }
    }
    if (field === 'dots') target.dots = val;
    if (field === 'powers' && typeof powerIndex === 'number') {
      const powers = [...target.powers];
      powers[powerIndex] = val;
      target.powers = powers;
    }

    newDisciplines[index] = target;
    onChange({
      ...sheet,
      v5Disciplines: newDisciplines,
      updatedAt: new Date().toISOString(),
    });
  };

  // Splitting skills into the 3 columns
  const physicalSkills = skills.filter((s) => s.category === 'physical');
  const socialSkills = skills.filter((s) => s.category === 'social');
  const mentalSkills = skills.filter((s) => s.category === 'mental');

  // Input styles
  const inputBg = isDark
    ? 'bg-zinc-900/60 border-zinc-700 text-zinc-100 focus:border-red-500 focus:bg-zinc-900'
    : 'bg-white border-zinc-400 text-zinc-900 focus:border-red-700 focus:bg-white header-info-field print:bg-white';

  const renderHeaderField = (fieldKey: HeaderFieldKey, slotIndex: number) => {
    const def = HEADER_FIELDS_MAP[fieldKey] || HEADER_FIELDS_MAP['name'];

    if (fieldKey === 'clan') {
      const clanDef = CLAN_THEMES[info.clan] || CLAN_THEMES['brujah'];
      const isCustom = info.clan === 'custom';
      const clanDisplayName = isCustom
        ? (info.customClanName?.trim() || 'Своя линия крови')
        : `${clanDef.name} (${clanDef.nameEn})`;

      return (
        <div key={slotIndex} className="flex flex-col gap-0.5 min-w-0">
          <label className={`font-benguiat uppercase font-bold text-[10px] tracking-wider print:text-[9.5px] print:leading-tight ${isDark ? 'text-red-500' : 'text-red-800'}`}>
            {def.label}
          </label>
          {/* Print version: plain text box with no buttons or icons */}
          <div className={`hidden print:block w-full min-w-0 px-2 py-0.5 h-[22px] leading-[18px] border font-serif text-[11px] header-info-field rounded-xs truncate ${
            isDark ? 'border-zinc-700 text-zinc-100 bg-zinc-900/80' : 'border-zinc-400 text-zinc-900 bg-white'
          }`}>
            {clanDisplayName}
          </div>
          {/* Screen version: button styled EXACTLY like an input text field */}
          <button
            type="button"
            id="sheet-clan-modal-trigger-btn"
            onClick={() => setIsClanModalOpen(true)}
            className={`w-full min-w-0 px-2 py-1 border rounded-xs font-serif text-sm transition-colors text-left truncate flex items-center justify-between group cursor-pointer print:hidden ${inputBg}`}
            title="Нажмите для открытия модального окна выбора клана"
          >
            <span className="truncate flex items-center gap-1.5">
              <ClanSymbol
                clan={info.clan}
                generation={info.generation}
                className="w-3.5 h-3.5 shrink-0"
                color={clanDef.accentColor}
              />
              <span className={`truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{clanDisplayName}</span>
            </span>
            <span className={`text-[10px] font-sans transition-colors shrink-0 ml-1 ${isDark ? 'text-zinc-400 group-hover:text-red-400' : 'text-zinc-500 group-hover:text-red-700'}`}>
              выбрать
            </span>
          </button>
        </div>
      );
    }

    if (fieldKey === 'predatorType') {
      const currentVal = info.predatorType?.trim() || '';
      const displayVal = currentVal || 'Выберите стиль охоты';

      return (
        <div key={slotIndex} className="flex flex-col gap-0.5 min-w-0">
          <label className={`font-benguiat uppercase font-bold text-[10px] tracking-wider print:text-[9.5px] print:leading-tight ${isDark ? 'text-red-500' : 'text-red-800'}`}>
            {def.label}
          </label>
          {/* Print version: plain text box with no buttons or icons */}
          <div className={`hidden print:block w-full min-w-0 px-2 py-0.5 h-[22px] leading-[18px] border font-serif text-[11px] header-info-field rounded-xs truncate ${
            isDark ? 'border-zinc-700 text-zinc-100 bg-zinc-900/80' : 'border-zinc-400 text-zinc-900 bg-white'
          }`}>
            {currentVal}
          </div>
          {/* Screen version: button styled EXACTLY like an input text field */}
          <button
            type="button"
            id="sheet-predator-type-modal-trigger-btn"
            onClick={() => setIsPredatorModalOpen(true)}
            className={`w-full min-w-0 px-2 py-1 border rounded-xs font-serif text-sm transition-colors text-left truncate flex items-center justify-between group cursor-pointer print:hidden ${inputBg}`}
            title="Нажмите для открытия модального окна выбора стиля охоты"
          >
            <span className={`truncate ${!currentVal ? (isDark ? 'text-zinc-400 italic text-xs' : 'text-zinc-500 italic text-xs') : (isDark ? 'text-zinc-100' : 'text-zinc-900')}`}>
              {displayVal}
            </span>
            <span className={`text-[10px] font-sans transition-colors shrink-0 ml-1 ${isDark ? 'text-zinc-400 group-hover:text-red-400' : 'text-zinc-500 group-hover:text-red-700'}`}>
              выбрать
            </span>
          </button>
        </div>
      );
    }

    if (fieldKey === 'generation') {
      const currentGen = info.generation || 13;
      const displayLabel = getGenerationDisplayLabel(currentGen);

      return (
        <div key={slotIndex} className="flex flex-col gap-0.5 min-w-0">
          <label className={`font-benguiat uppercase font-bold text-[10px] tracking-wider print:text-[9.5px] print:leading-tight ${isDark ? 'text-red-500' : 'text-red-800'}`}>
            {def.label}
          </label>
          {/* Print version: plain text box with no dropdown icons whatsoever */}
          <div className={`hidden print:block w-full min-w-0 px-2 py-0.5 h-[22px] leading-[18px] border font-serif text-[11px] header-info-field rounded-xs truncate ${
            isDark ? 'border-zinc-700 text-zinc-100 bg-zinc-900/80' : 'border-zinc-400 text-zinc-900 bg-white'
          }`}>
            {displayLabel}
          </div>
          {/* Screen version: stylized select with custom chevron */}
          <div className="relative w-full print:hidden">
            <select
              value={currentGen}
              onChange={(e) => handleInfoChange('generation', parseInt(e.target.value) || 13)}
              className={`w-full min-w-0 pl-2 pr-6 py-1 border rounded-xs font-serif text-sm transition-colors cursor-pointer appearance-none ${inputBg}`}
            >
              {GENERATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-zinc-400" />
          </div>
        </div>
      );
    }

    const isName = fieldKey === 'name';
    let val = (info as any)[fieldKey] || '';
    if (fieldKey === 'conceptDetail' && !val) {
      val = info.concept || '';
    } else if (fieldKey === 'concept' && !val) {
      val = (info as any).conceptDetail || '';
    } else if (fieldKey === 'purpose' && !val) {
      val = info.ambition || '';
    } else if (fieldKey === 'ambition' && !val) {
      val = (info as any).purpose || '';
    }

    return (
      <div key={slotIndex} className="flex flex-col gap-0.5 min-w-0">
        <label className={`font-benguiat uppercase font-bold text-[10px] tracking-wider print:text-[9.5px] print:leading-tight ${isDark ? 'text-red-500' : 'text-red-800'}`}>
          {def.label}
        </label>
        <input
          type="text"
          value={val}
          onChange={(e) => handleInfoChange(fieldKey as any, e.target.value)}
          className={`w-full min-w-0 px-2 py-1 print:py-0.5 print:px-2 print:h-[22px] print:leading-[18px] border rounded-xs font-serif ${
            isName ? 'font-medium' : ''
          } text-sm print:text-[11px] transition-colors header-info-field ${inputBg}`}
          placeholder={ph(def.placeholder)}
        />
      </div>
    );
  };

  return (
    <div
      className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-1 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
        isDark ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800' : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
      }`}
      style={{
        boxShadow: isDark
          ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Toggle Sheet Theme button (positioned to the left of the toggle logo button) */}
      {onToggleTheme && (
        <div className="absolute -left-12 sm:-left-22 lg:-left-24 top-[20px] sm:top-[24px] print:hidden z-20">
          <button
            type="button"
            id="vtm-toggle-sheet-theme-trigger"
            onClick={onToggleTheme}
            className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border-zinc-700/80 hover:border-amber-500/80 shadow-black/80'
                : 'bg-white/95 hover:bg-zinc-100 text-zinc-700 hover:text-indigo-600 border-zinc-300 hover:border-indigo-500 shadow-zinc-400/50'
            }`}
            title={
              isDark
                ? 'Переключить тему листа на светлую'
                : 'Переключить тему листа на тёмную'
            }
            aria-label="Переключение темы листа персонажа"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:-rotate-12" />
            )}
          </button>
        </div>
      )}

      {/* Toggle Logo button (positioned to the left of the sheet opposite the "Вампиры Маскарад" title, aligned with header settings button) */}
      <div className="absolute -left-3.5 sm:-left-12 lg:-left-13 top-[20px] sm:top-[24px] print:hidden z-20">
        <button
          type="button"
          id="vtm-toggle-logo-trigger"
          onClick={() => {
            onChange({
              ...sheet,
              v5UseGraphicLogo: !sheet.v5UseGraphicLogo,
              updatedAt: new Date().toISOString(),
            });
          }}
          className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
            sheet.v5UseGraphicLogo
              ? 'bg-red-900/90 hover:bg-red-800 text-white border-red-500 shadow-red-950/80 ring-2 ring-red-500/40'
              : isDark
              ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
              : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
          }`}
          title={
            sheet.v5UseGraphicLogo
              ? 'Вернуть текстовое название «Вампиры: Маскарад»'
              : 'Заменить название на графический логотип (logo.svg)'
          }
          aria-label="Переключение графического логотипа"
        >
          <Image className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:scale-110" />
        </button>
      </div>

      {/* Settings gear button to customize header slots (positioned to the left of the sheet at the level of the name input block) */}
      <div className="absolute -left-3.5 sm:-left-12 lg:-left-13 top-[80px] sm:top-[88px] print:hidden z-20">
        <button
          type="button"
          id="vtm-header-settings-trigger"
          onClick={() => setIsHeaderSettingsOpen(true)}
          className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
            isDark
              ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
              : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
          }`}
          title="Настройка шапки листа (выбор полей и порядка)"
          aria-label="Настройка шапки листа"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </div>

      <SheetHeader themeMode={isDark ? 'dark' : 'light'} useGraphicLogo={sheet.v5UseGraphicLogo} />

      {/* TOP 3x3 INFO TABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-2 sm:gap-3 print:gap-x-3 print:gap-y-1.5 my-2.5 print:my-1.5 print-calib-grid-gap text-xs print:text-[11px]">
        {activeSlots.map((fieldKey, slotIndex) => renderHeaderField(fieldKey, slotIndex))}
      </div>

      {/* TRACKS BAR (2 COLUMNS: Left: Health & Humanity | Right: Willpower & Hunger) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-5 lg:gap-x-6 print:gap-x-6 gap-y-3 print:gap-y-1.5 my-3 print:my-1.5 print-calib-track-block px-1 print:px-0">
        {/* First / Left Column: Здоровье and Человечность */}
        <div className="flex flex-col gap-2.5 sm:gap-3 print:gap-1.5 print-calib-track-col min-w-0">
          <V5SquareTrack
            label="Здоровье"
            totalBoxes={10}
            maxPoints={tracks.health.max || 10}
            superficial={tracks.health.superficial}
            aggravated={tracks.health.aggravated}
            boxes={tracks.health.boxes}
            onChange={(sup, agg, boxes) => handleTrackChange('health', sup, agg, boxes)}
            onMaxChange={(newMax) => handleTrackMaxChange('health', newMax)}
            isDark={isDark}
            labelWidth="w-[126px] sm:w-[138px] print:w-[124px]"
          />

          <V5HumanityTrack
            humanity={tracks.humanity.value}
            stains={tracks.humanity.stains}
            onChange={handleHumanityChange}
            isDark={isDark}
            labelWidth="w-[126px] sm:w-[138px] print:w-[124px]"
          />
        </div>

        {/* Second / Right Column: Воля and Голод */}
        <div className="flex flex-col gap-2.5 sm:gap-3 print:gap-1.5 print-calib-track-col min-w-0 print:pl-6">
          <V5SquareTrack
            label="Воля"
            totalBoxes={10}
            maxPoints={tracks.willpower.max || 10}
            superficial={tracks.willpower.superficial}
            aggravated={tracks.willpower.aggravated}
            boxes={tracks.willpower.boxes}
            onChange={(sup, agg, boxes) => handleTrackChange('willpower', sup, agg, boxes)}
            onMaxChange={(newMax) => handleTrackMaxChange('willpower', newMax)}
            isDark={isDark}
            labelWidth="w-[114px] sm:w-[124px] print:w-[84px]"
            labelClassName="pl-5 sm:pl-7 print:pl-0"
          />

          <V5HungerTrack
            hunger={tracks.hunger}
            onChange={handleHungerChange}
            isDark={isDark}
            labelWidth="w-[114px] sm:w-[124px] print:w-[84px]"
            labelClassName="pl-5 sm:pl-7 print:pl-0"
          />
        </div>
      </div>

      {/* ATTRIBUTES SECTION (3 COLUMNS) */}
      <div className="relative">
        {/* Left side action buttons for Attributes */}
        <div className="absolute -left-[30px] sm:-left-[72px] lg:-left-[76px] top-0 print:hidden z-20 flex flex-col gap-1.5 sm:gap-2">
          {/* Upper button: Rules (?) */}
          <button
            type="button"
            id="vtm-attr-rules-btn"
            onClick={() => setShowAttrHelp((prev) => !prev)}
            className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
              showAttrHelp
                ? 'bg-red-900 text-white border-red-500 shadow-red-950/80 ring-2 ring-red-500/50'
                : isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
                : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
            }`}
            title="Правила распределения характеристик"
            aria-label="Правила распределения характеристик"
          >
            <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* Lower button: Dice (Randomize) */}
          <button
            type="button"
            id="vtm-attr-randomize-btn"
            onClick={() => setIsRandomAttrModalOpen(true)}
            className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
                : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
            }`}
            title="Случайно раскидать характеристики по правилам"
            aria-label="Случайно раскидать характеристики по правилам"
          >
            <Dices className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:rotate-12" />
          </button>

          {/* Persistent popup message for Attributes rules */}
          {showAttrHelp && (
            <div
              id="vtm-attr-rules-popup"
              className={`absolute right-full mr-2.5 sm:mr-3 top-0 z-30 w-72 sm:w-80 p-3.5 rounded-lg border shadow-2xl backdrop-blur-sm text-xs font-serif leading-relaxed animate-in fade-in duration-200 ${
                isDark
                  ? 'bg-zinc-950/95 text-zinc-200 border-red-900/80 shadow-black/90'
                  : 'bg-white text-black border-zinc-400 shadow-xl shadow-zinc-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-1.5 mb-1.5 border-b border-red-900/40">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-red-700 dark:text-red-500 font-sans">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Правила: Характеристики</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttrHelp(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-red-400 transition-colors p-0.5"
                  title="Закрыть"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className={`whitespace-pre-line font-serif ${isDark ? 'text-zinc-200' : 'text-black font-medium'}`}>
                Стартовое распределение очков: одна Характеристика - 4 точки; Три характеристики - по 3 точки; Четыре характеристики - по 2 точки; Одна характеристика - 1 точка.
              </p>
              <div className={`mt-2 pt-1.5 border-t text-[10px] font-sans italic ${
                isDark ? 'border-zinc-800/60 text-zinc-400' : 'border-zinc-200 text-zinc-700'
              }`}>
                Нажмите кнопку «?» повторно, чтобы скрыть подсказку.
              </div>
            </div>
          )}
        </div>

        <SectionDivider title="Характеристики" isDark={isDark} />
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3 print:gap-3 my-2 print:my-1.5 print-calib-grid-gap text-xs">
          {/* Physical Attributes */}
          <div className="space-y-1.5 sm:space-y-2 print:space-y-1 border-r border-red-900/20 pr-3 print:pr-3 last:border-none min-w-0">
            <div className={`font-benguiat font-bold text-center uppercase tracking-widest text-[11px] print:text-[11px] pb-1 print:pb-0.5 border-b ${isDark ? 'text-red-500 border-red-900/40' : 'text-red-800 border-red-900/30'}`}>
              Физические
            </div>
            {[
              { key: 'strength', name: 'Сила', item: attributes.physical.strength },
              { key: 'dexterity', name: 'Ловкость', item: attributes.physical.dexterity },
              { key: 'stamina', name: 'Выносливость', item: attributes.physical.stamina },
            ].map(({ key, name, item }) => (
              <div key={key} className="flex items-center justify-between gap-2 py-0.5 print:py-0.5 min-w-0 print:h-[21px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(item.value, name)}
                  className={`font-serif font-medium text-left transition-colors cursor-pointer truncate min-w-0 print:text-[11.5px] print:leading-normal ${
                    isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'
                  }`}
                  title={`Добавить ${name} (${item.value}) в проверку костей`}
                >
                  {name}
                </button>
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={item.value}
                    onChange={(val) => handleAttrChange('physical', key, val)}
                    isDark={isDark}
                    min={1}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Social Attributes */}
          <div className="space-y-1.5 sm:space-y-2 print:space-y-1 border-r border-red-900/20 pr-3 print:pr-3 last:border-none min-w-0">
            <div className={`font-benguiat font-bold text-center uppercase tracking-widest text-[11px] print:text-[11px] pb-1 print:pb-0.5 border-b ${isDark ? 'text-red-500 border-red-900/40' : 'text-red-800 border-red-900/30'}`}>
              Социальные
            </div>
            {[
              { key: 'charisma', name: 'Харизма', item: attributes.social.charisma },
              { key: 'manipulation', name: 'Манипуляция', item: attributes.social.manipulation },
              {
                key: 'composure',
                name: 'Самообладание',
                item: attributes.social.composure || { id: 'com', name: 'Самообладание', value: 2 },
              },
            ].map(({ key, name, item }) => (
              <div key={key} className="flex items-center justify-between gap-2 py-0.5 print:py-0.5 min-w-0 print:h-[21px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(item.value, name)}
                  className={`font-serif font-medium text-left transition-colors cursor-pointer truncate min-w-0 print:text-[11.5px] print:leading-normal ${
                    isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'
                  }`}
                  title={`Добавить ${name} (${item.value}) в проверку костей`}
                >
                  {name}
                </button>
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={item.value}
                    onChange={(val) => handleAttrChange('social', key, val)}
                    isDark={isDark}
                    min={1}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mental Attributes */}
          <div className="space-y-1.5 sm:space-y-2 print:space-y-1 min-w-0">
            <div className={`font-benguiat font-bold text-center uppercase tracking-widest text-[11px] print:text-[11px] pb-1 print:pb-0.5 border-b ${isDark ? 'text-red-500 border-red-900/40' : 'text-red-800 border-red-900/30'}`}>
              Ментальные
            </div>
            {[
              { key: 'intelligence', name: 'Интеллект', item: attributes.mental.intelligence },
              { key: 'wits', name: 'Смекалка', item: attributes.mental.wits },
              {
                key: 'resolve',
                name: 'Решительность',
                item: attributes.mental.resolve || { id: 'res', name: 'Решительность', value: 2 },
              },
            ].map(({ key, name, item }) => (
              <div key={key} className="flex items-center justify-between gap-2 py-0.5 print:py-0.5 min-w-0 print:h-[21px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(item.value, name)}
                  className={`font-serif font-medium text-left transition-colors cursor-pointer truncate min-w-0 print:text-[11.5px] print:leading-normal ${
                    isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'
                  }`}
                  title={`Добавить ${name} (${item.value}) в проверку костей`}
                >
                  {name}
                </button>
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={item.value}
                    onChange={(val) => handleAttrChange('mental', key, val)}
                    isDark={isDark}
                    min={1}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SKILLS SECTION (3 COLUMNS OF 9 SKILLS EACH) */}
      <div className="relative">
        {/* Left side action buttons for Skills */}
        <div className="absolute -left-[30px] sm:-left-[72px] lg:-left-[76px] top-0 print:hidden z-20 flex flex-col gap-1.5 sm:gap-2">
          {/* Upper button: Rules (?) */}
          <button
            type="button"
            id="vtm-skills-rules-btn"
            onClick={() => setShowSkillsHelp((prev) => !prev)}
            className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
              showSkillsHelp
                ? 'bg-red-900 text-white border-red-500 shadow-red-950/80 ring-2 ring-red-500/50'
                : isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
                : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
            }`}
            title="Правила распределения навыков"
            aria-label="Правила распределения навыков"
          >
            <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* Lower button: Dice (Randomize) */}
          <button
            type="button"
            id="vtm-skills-randomize-btn"
            onClick={() => setIsRandomSkillsModalOpen(true)}
            className={`vtm-aux-tool-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer group ${
              isDark
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700/80 hover:border-red-600/80 shadow-black/80'
                : 'bg-white/95 hover:bg-zinc-100 text-zinc-600 hover:text-red-700 border-zinc-300 hover:border-red-700 shadow-zinc-400/50'
            }`}
            title="Случайно раскидать навыки по шаблону"
            aria-label="Случайно раскидать навыки по шаблону"
          >
            <Dices className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:rotate-12" />
          </button>

          {/* Persistent popup message for Skills rules */}
          {showSkillsHelp && (
            <div
              id="vtm-skills-rules-popup"
              className={`absolute right-full mr-2.5 sm:mr-3 top-0 z-30 w-72 sm:w-84 p-3.5 rounded-lg border shadow-2xl backdrop-blur-sm text-xs font-serif leading-relaxed animate-in fade-in duration-200 ${
                isDark
                  ? 'bg-zinc-950/95 text-zinc-200 border-red-900/80 shadow-black/90'
                  : 'bg-white text-black border-zinc-400 shadow-xl shadow-zinc-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-1.5 mb-1.5 border-b border-red-900/40">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-red-700 dark:text-red-500 font-sans">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Правила: Навыки</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSkillsHelp(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-red-400 transition-colors p-0.5"
                  title="Закрыть"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className={`font-semibold mb-1.5 ${isDark ? 'text-zinc-100' : 'text-black'}`}>
                Выберите один из шаблонов распределения точек:
              </p>
              <div className={`space-y-1 ${isDark ? 'text-zinc-300' : 'text-black font-medium'}`}>
                <div>1. Мастер на все руки: 1x3, 8x2, 10x1;</div>
                <div>2. Гармоничное развитие: 3x3, 5x2, 7x1;</div>
                <div>3. Узкий специалист: 1x4, 3x3, 3x2, 3x1.</div>
              </div>
              <div className={`mt-2 pt-1.5 border-t text-[10px] font-sans italic ${
                isDark ? 'border-zinc-800/60 text-zinc-400' : 'border-zinc-200 text-zinc-700'
              }`}>
                Нажмите кнопку «?» повторно, чтобы скрыть подсказку.
              </div>
            </div>
          )}
        </div>

        <SectionDivider title="Навыки" isDark={isDark} />
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3 print:gap-3 my-2 print:my-1.5 print-calib-grid-gap text-xs print:text-[11px]">
          {/* Column 1: Physical Skills */}
          <div className="space-y-1 sm:space-y-1.5 print:space-y-1 border-r border-red-900/20 pr-3 print:pr-3 last:border-none min-w-0">
            {physicalSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between gap-1 py-0.5 print:py-0.5 min-w-0 print:h-[20px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(skill.value, skill.name)}
                  className={`font-serif ${isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'} text-left transition-colors cursor-pointer shrink-0 select-none truncate max-w-[90px] sm:max-w-[95px] print:max-w-none print:text-[11px] print:leading-normal`}
                  title={`Добавить ${skill.name} (${skill.value}) в проверку костей`}
                >
                  {skill.name}
                </button>
                <input
                  type="text"
                  value={skill.specialty || ''}
                  onChange={(e) => handleSkillSpecialtyChange(skill.id, e.target.value)}
                  placeholder={ph('')}
                  title="Специализация"
                  className={`flex-1 min-w-[16px] mx-1 px-1 py-0 h-[18px] print:h-[18px] text-[11px] sm:text-[11.5px] print:text-[10px] font-serif italic bg-transparent border-t-0 border-l-0 border-r-0 border-b border-dotted outline-none rounded-none leading-normal print:leading-normal focus:outline-none focus:border-red-600 transition-colors ${
                    isDark
                      ? 'border-zinc-700/70 text-zinc-100 focus:border-red-500 placeholder:text-zinc-500'
                      : 'border-zinc-400/80 text-zinc-800 focus:border-red-700 placeholder:text-zinc-400'
                  }`}
                />
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={skill.value}
                    onChange={(val) => handleSkillChange(skill.id, val)}
                    isDark={isDark}
                    min={0}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Social Skills */}
          <div className="space-y-1 sm:space-y-1.5 print:space-y-1 border-r border-red-900/20 pr-3 print:pr-3 last:border-none min-w-0">
            {socialSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between gap-1 py-0.5 print:py-0.5 min-w-0 print:h-[20px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(skill.value, skill.name)}
                  className={`font-serif ${isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'} text-left transition-colors cursor-pointer shrink-0 select-none truncate max-w-[90px] sm:max-w-[95px] print:max-w-none print:text-[11px] print:leading-normal`}
                  title={`Добавить ${skill.name} (${skill.value}) в проверку костей`}
                >
                  {skill.name}
                </button>
                <input
                  type="text"
                  value={skill.specialty || ''}
                  onChange={(e) => handleSkillSpecialtyChange(skill.id, e.target.value)}
                  placeholder={ph('')}
                  title="Специализация"
                  className={`flex-1 min-w-[16px] mx-1 px-1 py-0 h-[18px] print:h-[18px] text-[11px] sm:text-[11.5px] print:text-[10px] font-serif italic bg-transparent border-t-0 border-l-0 border-r-0 border-b border-dotted outline-none rounded-none leading-normal print:leading-normal focus:outline-none focus:border-red-600 transition-colors ${
                    isDark
                      ? 'border-zinc-700/70 text-zinc-100 focus:border-red-500 placeholder:text-zinc-500'
                      : 'border-zinc-400/80 text-zinc-800 focus:border-red-700 placeholder:text-zinc-400'
                  }`}
                />
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={skill.value}
                    onChange={(val) => handleSkillChange(skill.id, val)}
                    isDark={isDark}
                    min={0}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Mental Skills */}
          <div className="space-y-1 sm:space-y-1.5 print:space-y-1 min-w-0">
            {mentalSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between gap-1 py-0.5 print:py-0.5 min-w-0 print:h-[20px]">
                <button
                  type="button"
                  onClick={() => onOpenDiceRoller(skill.value, skill.name)}
                  className={`font-serif ${isDark ? 'text-zinc-100 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'} text-left transition-colors cursor-pointer shrink-0 select-none truncate max-w-[90px] sm:max-w-[95px] print:max-w-none print:text-[11px] print:leading-normal`}
                  title={`Добавить ${skill.name} (${skill.value}) в проверку костей`}
                >
                  {skill.name}
                </button>
                <input
                  type="text"
                  value={skill.specialty || ''}
                  onChange={(e) => handleSkillSpecialtyChange(skill.id, e.target.value)}
                  placeholder={ph('')}
                  title="Специализация"
                  className={`flex-1 min-w-[16px] mx-1 px-1 py-0 h-[18px] print:h-[18px] text-[11px] sm:text-[11.5px] print:text-[10px] font-serif italic bg-transparent border-t-0 border-l-0 border-r-0 border-b border-dotted outline-none rounded-none leading-normal print:leading-normal focus:outline-none focus:border-red-600 transition-colors ${
                    isDark
                      ? 'border-zinc-700/70 text-zinc-100 focus:border-red-500 placeholder:text-zinc-500'
                      : 'border-zinc-400/80 text-zinc-800 focus:border-red-700 placeholder:text-zinc-400'
                  }`}
                />
                <div className="shrink-0 flex items-center">
                  <V5Dots
                    value={skill.value}
                    onChange={(val) => handleSkillChange(skill.id, val)}
                    isDark={isDark}
                    min={0}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DISCIPLINES SECTION (6 BLOCKS: 3 COLUMNS X 2 ROWS) */}
      <div className="section-avoid-break mt-2.5 print:mt-1.5 print-calib-disciplines-section">
        <SectionDivider title="Дисциплины" isDark={isDark} />
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-2.5 sm:gap-3 print:gap-2.5 my-2 print:my-1.5 print-calib-disciplines-grid text-xs">
          {disciplines.map((disc, dIndex) => (
            <div
              key={disc.id || dIndex}
              className={`p-2 sm:p-2.5 print:p-2 rounded-xs border min-w-0 flex flex-col justify-between h-[160px] min-h-[160px] max-h-[160px] print:h-[150px] print:min-h-[150px] print:max-h-[150px] print-calib-disc-card overflow-hidden ${
                isDark ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-300 bg-white/60'
              }`}
            >
              {/* Discipline Header: Clickable Name Modal Trigger + 5 Dots */}
              <div className="flex items-center justify-between gap-1.5 pb-1 mb-1 print:pb-1 print:mb-1 print:h-6 border-b border-red-900/20 shrink-0">
                {/* Print mode text */}
                <div className={`hidden print:block min-w-0 flex-1 font-serif font-bold text-[11.5px] print:text-[11px] print:leading-normal truncate print-disc-name ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}>
                  {disc.name || '—'}
                </div>

                {/* Interactive button on screen */}
                <button
                  type="button"
                  onClick={() => setSelectedDisciplineSlot(dIndex)}
                  className={`min-w-0 flex-1 text-left font-serif font-bold text-xs sm:text-[12.5px] py-0.5 leading-tight truncate block cursor-pointer print:hidden transition-colors ${
                    disc.name
                      ? isDark
                        ? 'text-zinc-100 hover:text-red-400'
                        : 'text-zinc-900 hover:text-red-600'
                      : isDark
                        ? 'text-zinc-500 italic hover:text-red-400'
                        : 'text-zinc-400 italic hover:text-red-600'
                  }`}
                  title={
                    disc.name
                      ? `Дисциплина: ${disc.name} (нажмите, чтобы изменить)`
                      : 'Нажмите для выбора дисциплины из справочника'
                  }
                >
                  <span className="truncate block">
                    {disc.name || ph('Дисциплина...')}
                  </span>
                </button>

                <div className="shrink-0 flex items-center v5-accent-dot">
                  <V5Dots
                    value={disc.dots}
                    onChange={(val) => handleDisciplineChange(dIndex, 'dots', val)}
                    isDark={isDark}
                    size="sm"
                    activeColor="bg-red-800 ring-1 ring-red-600"
                  />
                </div>
              </div>

              {/* 5 Power Lines */}
              <div className="flex-1 min-h-0 flex flex-col justify-between py-0.5 print:py-0.5">
                {Array.from({ length: 5 }, (_, pIndex) => {
                  const powerVal = disc.powers[pIndex] || '';

                  return (
                    <div
                      key={pIndex}
                      className="flex items-center gap-1.5 print:gap-1.5 min-w-0 h-5 print:h-[18px] print-calib-disc-power-row shrink-0 group"
                    >
                      <span className="font-mono text-[10px] sm:text-[10.5px] print:text-[10px] print:leading-normal opacity-50 w-3.5 print:w-3.5 text-right shrink-0 select-none">
                        {pIndex + 1}.
                      </span>

                      {/* Print view */}
                      <div className={`hidden print:block min-w-0 flex-1 px-1.5 print:px-1.5 py-0 text-[10.5px] print:text-[10.5px] print:leading-normal font-serif border-b border-dotted print-disc-power print-calib-disc-power-text truncate ${
                        isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-400 text-zinc-900'
                      }`}>
                        {powerVal}
                      </div>

                      {/* Interactive button on screen */}
                      <button
                        type="button"
                        onClick={() => handlePowerLineClick(dIndex, pIndex)}
                        className={`min-w-0 flex-1 px-1.5 py-0 h-full text-[11px] sm:text-[11px] font-serif border-b border-dotted text-left truncate flex items-center justify-between cursor-pointer transition-colors print:hidden rounded-xs ${
                          isDark
                            ? 'border-zinc-700 text-zinc-100 hover:border-red-500 hover:text-white hover:bg-zinc-900/60'
                            : 'border-zinc-400 text-zinc-800 hover:border-red-700 hover:text-black hover:bg-red-50/50'
                        }`}
                        title={
                          disc.name
                            ? `Выбрать способность для дисциплины ${disc.name}`
                            : 'Для начала выберите дисциплину'
                        }
                      >
                        <span
                          className={`truncate ${
                            !powerVal ? (isDark ? 'text-zinc-400 italic text-[10.5px]' : 'text-zinc-500 italic text-[10.5px]') : (isDark ? 'text-zinc-100' : 'text-zinc-900')
                          }`}
                        >
                          {powerVal || ph(`Сила ${pIndex + 1}`)}
                        </span>
                        <span className={`text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 ${isDark ? 'text-zinc-400 group-hover:text-red-400' : 'text-zinc-400 group-hover:text-red-700'}`}>
                          выбрать
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header Settings Modal */}
      <HeaderSettingsModal
        isOpen={isHeaderSettingsOpen}
        onClose={() => setIsHeaderSettingsOpen(false)}
        currentSlots={sheet.v5HeaderSlots}
        onSave={handleUpdateHeaderSlots}
        isDark={isDark}
      />

      {/* Clan Selection Modal */}
      <ClanSelectModal
        isOpen={isClanModalOpen}
        onClose={() => setIsClanModalOpen(false)}
        currentClan={info.clan}
        customClanName={info.customClanName}
        currentClanBane={sheet.v5Blood?.clanBane}
        currentClanCompulsion={sheet.v5Blood?.clanCompulsion}
        onSelectClan={(clanId, customName, clanBane, clanCompulsion) => {
          const currentBlood = sheet.v5Blood || {
            potency: 1,
            bloodSurge: '+1 кубик',
            mendAmount: '1 поверхностный',
            powerBonus: 'Нет',
            rouseReroll: '1-й уровень',
            baneSeverity: 2,
            feedingPenalty: 'Нет ограничений',
            clanBane: '',
            clanCompulsion: '',
          };

          const updates: Partial<CharacterSheet['info']> = {
            clan: clanId,
          };
          if (clanId === 'custom') {
            updates.customClanName = customName;
          }

          onChange({
            ...sheet,
            info: {
              ...sheet.info,
              ...updates,
            },
            v5Blood: {
              ...currentBlood,
              clanBane: clanBane !== undefined ? clanBane : currentBlood.clanBane,
              clanCompulsion:
                clanCompulsion !== undefined
                  ? clanCompulsion
                  : currentBlood.clanCompulsion,
            },
            updatedAt: new Date().toISOString(),
          });
        }}
      />

      {/* Predator Type Selection Modal */}
      <PredatorTypeSelectModal
        isOpen={isPredatorModalOpen}
        onClose={() => setIsPredatorModalOpen(false)}
        currentPredatorType={info.predatorType}
        onSelectPredatorType={(selectedPredatorType) => {
          handleInfoChange('predatorType', selectedPredatorType);
        }}
      />

      {/* Discipline Selection Modal */}
      {selectedDisciplineSlot !== null && (
        <DisciplineSelectModal
          isOpen={selectedDisciplineSlot !== null}
          onClose={() => setSelectedDisciplineSlot(null)}
          currentDisciplineName={disciplines[selectedDisciplineSlot]?.name}
          slotIndex={selectedDisciplineSlot}
          characterClan={sheet.info.clan}
          onSelectDiscipline={(discName) => {
            handleDisciplineChange(selectedDisciplineSlot, 'name', discName);
          }}
          onClearDiscipline={() => {
            handleDisciplineChange(selectedDisciplineSlot, 'name', '');
          }}
        />
      )}

      {/* Discipline Power Selection Modal */}
      {selectedPowerSlot !== null && (
        <DisciplinePowerSelectModal
          isOpen={selectedPowerSlot !== null}
          onClose={() => setSelectedPowerSlot(null)}
          disciplineName={selectedPowerSlot.disciplineName}
          powerIndex={selectedPowerSlot.powerIndex}
          currentPowerValue={selectedPowerSlot.currentValue}
          onSelectPower={(powerName) => {
            handleDisciplineChange(
              selectedPowerSlot.disciplineIndex,
              'powers',
              powerName,
              selectedPowerSlot.powerIndex
            );
          }}
        />
      )}

      {/* Randomize Attributes Modal */}
      <RandomizeAttributesModal
        isOpen={isRandomAttrModalOpen}
        onClose={() => setIsRandomAttrModalOpen(false)}
        onConfirm={handleRandomizeAttributes}
        isDark={isDark}
      />

      {/* Randomize Skills Modal */}
      <RandomizeSkillsModal
        isOpen={isRandomSkillsModalOpen}
        onClose={() => setIsRandomSkillsModalOpen(false)}
        onConfirm={handleRandomizeSkills}
        isDark={isDark}
      />
    </div>
  );
};
