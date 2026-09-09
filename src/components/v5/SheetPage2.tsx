import React from 'react';
import { CharacterSheet, V5AdvantageItem, V5BloodTraits } from '../../types';
import { SheetHeader, SectionDivider } from './SheetHeader';
import { V5Dots } from './V5Controls';
import { getBloodPotencyInfo } from '../../utils/calculations';
import { CLAN_THEMES } from '../../data/clans';
import { useIsPrinting } from '../../utils/useIsPrinting';
import { AutoFitTextarea } from './AutoFitTextarea';
import { MeritFlawSelectModal } from './MeritFlawSelectModal';
import { AdvantageDetailModal } from './AdvantageDetailModal';
import { AdvantageItem } from '../../data/advantages';
import { BookOpen, Eye } from 'lucide-react';

interface SheetPage2Props {
  sheet: CharacterSheet;
  onChange: (updated: CharacterSheet) => void;
  isDark?: boolean;
  meritsRows?: number;
  primaryTextColor?: string;
  accentTextColor?: string;
}

export const SheetPage2: React.FC<SheetPage2Props> = ({
  sheet,
  onChange,
  isDark = false,
  meritsRows = 17,
  primaryTextColor,
  accentTextColor,
}) => {
  const isPrinting = useIsPrinting();
  const ph = (text: string) => (isPrinting ? '' : text);

  const currentClanTheme = CLAN_THEMES[sheet.info.clan] || CLAN_THEMES.brujah;

  // Merits (left column) and Flaws (right column), normalized to meritsRows each
  const merits: V5AdvantageItem[] = React.useMemo(() => {
    const targetCount = meritsRows || 17;
    if (sheet.v5Merits && sheet.v5Merits.length > 0) {
      const list = [...sheet.v5Merits];
      while (list.length < targetCount) {
        list.push({ id: `merit_${list.length}`, name: '', dots: 0, type: 'advantage' });
      }
      return list.slice(0, targetCount);
    }
    const legacy = (sheet.v5Advantages || []).filter((item) => item.type !== 'flaw');
    while (legacy.length < targetCount) {
      legacy.push({ id: `merit_${legacy.length}`, name: '', dots: 0, type: 'advantage' });
    }
    return legacy.slice(0, targetCount);
  }, [sheet.v5Merits, sheet.v5Advantages, meritsRows]);

  const flaws: V5AdvantageItem[] = React.useMemo(() => {
    const targetCount = meritsRows || 17;
    if (sheet.v5Flaws && sheet.v5Flaws.length > 0) {
      const list = [...sheet.v5Flaws];
      while (list.length < targetCount) {
        list.push({ id: `flaw_${list.length}`, name: '', dots: 0, type: 'flaw' });
      }
      return list.slice(0, targetCount);
    }
    const legacy = (sheet.v5Advantages || []).filter((item) => item.type === 'flaw');
    while (legacy.length < targetCount) {
      legacy.push({ id: `flaw_${legacy.length}`, name: '', dots: 0, type: 'flaw' });
    }
    return legacy.slice(0, targetCount);
  }, [sheet.v5Flaws, sheet.v5Advantages, meritsRows]);

  const handleMeritChange = (index: number, field: 'name' | 'dots', val: any) => {
    const updated = [...merits];
    updated[index] = {
      ...updated[index],
      [field]: val,
      type: 'advantage',
    };
    onChange({
      ...sheet,
      v5Merits: updated,
      v5Advantages: [...updated, ...flaws],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFlawChange = (index: number, field: 'name' | 'dots', val: any) => {
    const updated = [...flaws];
    updated[index] = {
      ...updated[index],
      [field]: val,
      type: 'flaw',
    };
    onChange({
      ...sheet,
      v5Flaws: updated,
      v5Advantages: [...merits, ...updated],
      updatedAt: new Date().toISOString(),
    });
  };

  // State and handlers for Merit & Flaw Catalog Modal
  const [modalConfig, setModalConfig] = React.useState<{
    isOpen: boolean;
    kind: 'advantage' | 'disadvantage';
    slotIndex: number | null;
    currentValue: string;
  }>({
    isOpen: false,
    kind: 'advantage',
    slotIndex: null,
    currentValue: '',
  });

  // State and handlers for Advantage Detail / Create / View Modal
  const [detailModalConfig, setDetailModalConfig] = React.useState<{
    isOpen: boolean;
    kind: 'advantage' | 'disadvantage';
    slotIndex: number | null;
    name: string;
    dots: number;
    description: string;
  }>({
    isOpen: false,
    kind: 'advantage',
    slotIndex: null,
    name: '',
    dots: 1,
    description: '',
  });

  const handleOpenDetailModal = (
    kind: 'advantage' | 'disadvantage',
    slotIndex: number | null = null,
    item?: V5AdvantageItem
  ) => {
    setDetailModalConfig({
      isOpen: true,
      kind,
      slotIndex,
      name: item ? item.name : '',
      dots: item && item.dots > 0 ? item.dots : 1,
      description: item?.description || '',
    });
  };

  const handleSaveDetailToSheet = (data: {
    slotIndex: number | null;
    name: string;
    dots: number;
    kind: 'advantage' | 'disadvantage';
    description: string;
  }) => {
    if (data.kind === 'advantage') {
      let targetIdx = data.slotIndex;
      if (targetIdx === null || targetIdx === undefined || targetIdx < 0) {
        const emptyIdx = merits.findIndex((m) => !m.name || !m.name.trim());
        targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
      }
      const updated = [...merits];
      updated[targetIdx] = {
        ...updated[targetIdx],
        name: data.name,
        dots: data.dots,
        type: 'advantage',
        description: data.description,
      };
      onChange({
        ...sheet,
        v5Merits: updated,
        v5Advantages: [...updated, ...flaws],
        updatedAt: new Date().toISOString(),
      });
    } else {
      let targetIdx = data.slotIndex;
      if (targetIdx === null || targetIdx === undefined || targetIdx < 0) {
        const emptyIdx = flaws.findIndex((f) => !f.name || !f.name.trim());
        targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
      }
      const updated = [...flaws];
      updated[targetIdx] = {
        ...updated[targetIdx],
        name: data.name,
        dots: data.dots,
        type: 'flaw',
        description: data.description,
      };
      onChange({
        ...sheet,
        v5Flaws: updated,
        v5Advantages: [...merits, ...updated],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleOpenAdvantageModal = (
    kind: 'advantage' | 'disadvantage',
    slotIndex: number | null = null,
    currentValue: string = ''
  ) => {
    setModalConfig({
      isOpen: true,
      kind,
      slotIndex,
      currentValue,
    });
  };

  const handleCloseAdvantageModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSelectAdvantageFromModal = (
    item: AdvantageItem,
    defaultDots: number,
    targetSlotIdx?: number | null
  ) => {
    if (item.kind === 'advantage') {
      let targetIdx = targetSlotIdx;
      if (targetIdx === null || targetIdx === undefined || targetIdx < 0) {
        const emptyIdx = merits.findIndex((m) => !m.name || !m.name.trim());
        targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
      }
      const updated = [...merits];
      updated[targetIdx] = {
        ...updated[targetIdx],
        name: item.name,
        dots: defaultDots,
        type: 'advantage',
      };
      onChange({
        ...sheet,
        v5Merits: updated,
        v5Advantages: [...updated, ...flaws],
        updatedAt: new Date().toISOString(),
      });
    } else {
      let targetIdx = targetSlotIdx;
      if (targetIdx === null || targetIdx === undefined || targetIdx < 0) {
        const emptyIdx = flaws.findIndex((f) => !f.name || !f.name.trim());
        targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
      }
      const updated = [...flaws];
      updated[targetIdx] = {
        ...updated[targetIdx],
        name: item.name,
        dots: defaultDots,
        type: 'flaw',
      };
      onChange({
        ...sheet,
        v5Flaws: updated,
        v5Advantages: [...merits, ...updated],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleRemoveAdvantageFromModal = (item: AdvantageItem, slotIndex?: number | null) => {
    if (item.kind === 'advantage') {
      const updated = [...merits];
      if (slotIndex !== null && slotIndex !== undefined && slotIndex >= 0) {
        updated[slotIndex] = { ...updated[slotIndex], name: '', dots: 0 };
      } else {
        const norm = item.name.trim().toLowerCase();
        const foundIdx = updated.findIndex((m) => m.name.trim().toLowerCase() === norm);
        if (foundIdx !== -1) {
          updated[foundIdx] = { ...updated[foundIdx], name: '', dots: 0 };
        }
      }
      onChange({
        ...sheet,
        v5Merits: updated,
        v5Advantages: [...updated, ...flaws],
        updatedAt: new Date().toISOString(),
      });
    } else {
      const updated = [...flaws];
      if (slotIndex !== null && slotIndex !== undefined && slotIndex >= 0) {
        updated[slotIndex] = { ...updated[slotIndex], name: '', dots: 0 };
      } else {
        const norm = item.name.trim().toLowerCase();
        const foundIdx = updated.findIndex((f) => f.name.trim().toLowerCase() === norm);
        if (foundIdx !== -1) {
          updated[foundIdx] = { ...updated[foundIdx], name: '', dots: 0 };
        }
      }
      onChange({
        ...sheet,
        v5Flaws: updated,
        v5Advantages: [...merits, ...updated],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const blood: V5BloodTraits = sheet.v5Blood || {
    potency: 1,
    bloodSurge: '+1 кубик',
    mendAmount: '1 поверхностный',
    powerBonus: 'Нет',
    rouseReroll: '1-й уровень',
    baneSeverity: 2,
    feedingPenalty: 'Нет ограничений',
    clanBane: currentClanTheme.bane || currentClanTheme.weakness,
    clanCompulsion: currentClanTheme.compulsion || '',
  };

  const handleBloodPotencyChange = (potency: number) => {
    const tableInfo = getBloodPotencyInfo(potency);
    onChange({
      ...sheet,
      v5Blood: {
        ...blood,
        potency,
        bloodSurge: tableInfo.bloodSurge,
        mendAmount: tableInfo.mendAmount,
        powerBonus: tableInfo.powerBonus,
        rouseReroll: tableInfo.rouseReroll,
        baneSeverity: tableInfo.baneSeverity,
        feedingPenalty: tableInfo.feedingPenalty,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBloodTraitChange = (key: keyof V5BloodTraits, value: any) => {
    onChange({
      ...sheet,
      v5Blood: {
        ...blood,
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const inputBg = isDark
    ? 'bg-zinc-900/60 border-zinc-700 text-zinc-100 focus:border-red-500 focus:bg-zinc-900'
    : 'bg-white/80 border-zinc-400 text-zinc-900 focus:border-red-700 focus:bg-white';

  return (
    <>
      <div
        className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-2 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
          isDark ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800' : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
        }`}
        style={{
          boxShadow: isDark
            ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
        }}
      >
        <SheetHeader
          pageTitle="Преимущества и Кровь"
          themeMode={isDark ? 'dark' : 'light'}
          useGraphicLogo={sheet.v5UseGraphicLogo}
          primaryTextColor={primaryTextColor}
          accentTextColor={accentTextColor}
        />

      {/* 1. TOP SECTION: КРОВЬ */}
      <div className="space-y-2 mb-3 print:mb-2 shrink-0 print-calib-p2-blood-section">
        <SectionDivider title="Кровь" isDark={isDark} />

        {/* Centered Blood Potency Tracker */}
        <div className="flex flex-col items-center justify-center my-1 print:my-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-700 text-sm">🩸</span>
            <span className={`font-benguiat font-bold uppercase tracking-wider text-xs sm:text-sm ${isDark ? 'text-red-600' : 'text-red-800'}`}>
              Сила крови
            </span>
            <span className={`font-mono text-xs sm:text-sm font-bold ml-1 ${isDark ? 'text-red-600' : 'text-red-700'}`}>
              {blood.potency} / 10
            </span>
          </div>

          <div className="flex justify-center py-1 px-3 sm:px-4 rounded-sm border bg-red-950/10 border-red-900/30 v5-accent-dot">
            <V5Dots
              value={blood.potency}
              max={10}
              onChange={handleBloodPotencyChange}
              isDark={isDark}
              min={0}
              size="md"
              activeColor="bg-red-800 ring-2 ring-red-600 shadow-sm"
            />
          </div>
        </div>

        {/* 2 Columns Under Blood Potency: Left = Table, Right = Bane/Compulsion/Feeding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 print:gap-4 pt-1 text-xs print-calib-p2-blood-grid">
          {/* LEFT: Blood Attributes Table */}
          <div className="flex flex-col h-full">
            {/* Header spacer to align top of table with top of Clan Bane textarea */}
            <div
              className="hidden sm:flex print:flex items-center h-5 mb-1 select-none pointer-events-none opacity-0 shrink-0"
              aria-hidden="true"
            >
              <span className="font-benguiat font-bold uppercase tracking-wider text-[11px]">
                Выравнивание
              </span>
            </div>
            <div
              className={`flex-1 min-h-[260px] sm:min-h-0 border rounded-sm overflow-hidden text-xs flex flex-col justify-between ${
                isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-300 bg-white/40'
              }`}
            >
              <table className="w-full h-full text-left border-collapse table-fixed">
                <tbody>
                  <tr className={`h-[52px] sm:h-1/5 print:h-1/5 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <td className={`py-1 px-2.5 sm:px-3 font-benguiat font-semibold w-3/5 align-middle text-xs sm:text-[12.5px] print:text-xs ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                      Модификатор прилива крови
                    </td>
                    <td className="py-1 px-2.5 sm:px-3 font-mono text-right align-middle">
                      <input
                        type="text"
                        value={blood.bloodSurge}
                        onChange={(e) => handleBloodTraitChange('bloodSurge', e.target.value)}
                        className={`w-full text-right bg-transparent focus:outline-none font-medium text-xs sm:text-[13px] print:text-xs leading-normal ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      />
                    </td>
                  </tr>

                  <tr className={`h-[52px] sm:h-1/5 print:h-1/5 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <td className={`py-1 px-2.5 sm:px-3 font-benguiat font-semibold align-middle text-xs sm:text-[12.5px] print:text-xs ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                      Заживление
                    </td>
                    <td className="py-1 px-2.5 sm:px-3 font-mono text-right align-middle">
                      <input
                        type="text"
                        value={blood.mendAmount}
                        onChange={(e) => handleBloodTraitChange('mendAmount', e.target.value)}
                        className={`w-full text-right bg-transparent focus:outline-none font-medium text-xs sm:text-[13px] print:text-xs leading-normal ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      />
                    </td>
                  </tr>

                  <tr className={`h-[52px] sm:h-1/5 print:h-1/5 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <td className={`py-1 px-2.5 sm:px-3 font-benguiat font-semibold align-middle text-xs sm:text-[12.5px] print:text-xs ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                      Модификатор пула Дисциплин
                    </td>
                    <td className="py-1 px-2.5 sm:px-3 font-mono text-right align-middle">
                      <input
                        type="text"
                        value={blood.powerBonus}
                        onChange={(e) => handleBloodTraitChange('powerBonus', e.target.value)}
                        className={`w-full text-right bg-transparent focus:outline-none font-medium text-xs sm:text-[13px] print:text-xs leading-normal ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      />
                    </td>
                  </tr>

                  <tr className={`h-[52px] sm:h-1/5 print:h-1/5 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <td className={`py-1 px-2.5 sm:px-3 font-benguiat font-semibold align-middle text-xs sm:text-[12.5px] print:text-xs ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                      Повторное испытание крови
                    </td>
                    <td className="py-1 px-2.5 sm:px-3 font-mono text-right align-middle">
                      <input
                        type="text"
                        value={blood.rouseReroll}
                        onChange={(e) => handleBloodTraitChange('rouseReroll', e.target.value)}
                        className={`w-full text-right bg-transparent focus:outline-none font-medium text-xs sm:text-[13px] print:text-xs leading-normal ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      />
                    </td>
                  </tr>

                  <tr className="h-[52px] sm:h-1/5 print:h-1/5">
                    <td className={`py-1 px-2.5 sm:px-3 font-benguiat font-semibold align-middle text-xs sm:text-[12.5px] print:text-xs ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                      Тяжесть изъяна
                    </td>
                    <td className="py-1 px-2.5 sm:px-3 font-mono text-right align-middle">
                      <input
                        type="number"
                        value={blood.baneSeverity}
                        onChange={(e) => handleBloodTraitChange('baneSeverity', parseInt(e.target.value) || 0)}
                        className={`w-full text-right bg-transparent focus:outline-none font-medium text-xs sm:text-[13px] print:text-xs leading-normal ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Text fields (Clan Bane, Clan Compulsion, Feeding Restrictions) */}
          <div className="flex flex-col justify-between gap-2.5 sm:gap-3 print:gap-2">
            {/* CLAN BANE */}
            <div className="flex flex-col">
              <div className="flex items-center h-5 mb-1 shrink-0">
                <label className={`font-benguiat font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Клановый изъян
                </label>
              </div>
              <AutoFitTextarea
                value={blood.clanBane}
                onChange={(val) => handleBloodTraitChange('clanBane', typeof val === 'string' ? val : val?.target?.value ?? '')}
                maxFontSize={12}
                minFontSize={7}
                isDark={isDark}
                className={`py-1.5 px-2.5 border rounded-xs font-serif leading-snug transition-colors h-[68px] sm:h-[76px] print:h-[66px] ${inputBg}`}
                placeholder={ph('Опишите клановый изъян...')}
              />
            </div>

            {/* CLAN COMPULSION */}
            <div className="flex flex-col">
              <div className="flex items-center h-5 mb-1 shrink-0">
                <label className={`font-benguiat font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Клановая мания
                </label>
              </div>
              <AutoFitTextarea
                value={blood.clanCompulsion}
                onChange={(val) => handleBloodTraitChange('clanCompulsion', typeof val === 'string' ? val : val?.target?.value ?? '')}
                maxFontSize={12}
                minFontSize={7}
                isDark={isDark}
                className={`py-1.5 px-2.5 border rounded-xs font-serif leading-snug transition-colors h-[68px] sm:h-[76px] print:h-[66px] ${inputBg}`}
                placeholder={ph('Опишите клановую манию (Compulsion)...')}
              />
            </div>

            {/* FEEDING RESTRICTIONS / PROBLEMS */}
            <div className="flex flex-col">
              <div className="flex items-center h-5 mb-1 shrink-0">
                <label className={`font-benguiat font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Проблемы с питанием
                </label>
              </div>
              <AutoFitTextarea
                value={blood.feedingPenalty}
                onChange={(val) => handleBloodTraitChange('feedingPenalty', typeof val === 'string' ? val : val?.target?.value ?? '')}
                maxFontSize={12}
                minFontSize={7}
                isDark={isDark}
                className={`py-1.5 px-2.5 border rounded-xs font-serif leading-snug transition-colors h-[68px] sm:h-[76px] print:h-[66px] ${inputBg}`}
                placeholder={ph('Ограничения и проблемы с питанием...')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: ПРЕИМУЩЕСТВА И НЕДОСТАТКИ (2 Columns to bottom of page) */}
      <div className="space-y-2 mt-2 print:mt-1.5 print-calib-p2-merits-section">
        <SectionDivider title="Преимущества и Недостатки" isDark={isDark} />

        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-5 sm:gap-6 print:gap-4 my-1 text-xs">
          {/* LEFT COLUMN: ADVANTAGES / MERITS */}
          <div className="space-y-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-red-900/30 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-benguiat font-bold uppercase tracking-wider text-xs ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                  Преимущества
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAdvantageModal('advantage', null)}
                  className="print:hidden p-1 rounded hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-sans"
                  title="Выбрать преимущество из каталога"
                >
                  <BookOpen className="w-3.5 h-3.5 text-red-500/80" />
                  <span className="hidden sm:inline opacity-75 hover:opacity-100">Каталог</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal('advantage', null)}
                  className="print:hidden p-1 rounded hover:bg-red-950/40 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-sans"
                  title="Просмотреть или создать описание преимущества"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500/80" />
                </button>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Точки (1-5)</span>
            </div>

            <div className="space-y-1 sm:space-y-1.5 print:space-y-1 flex flex-col print-calib-p2-rows-container">
              {merits.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between gap-1.5 py-0.5 min-w-0 h-6 sm:h-[26px] print:h-6 shrink-0 group/row">
                  <span className={`font-mono text-[10px] sm:text-[11px] print:text-[10px] w-4 text-right shrink-0 select-none ${isDark ? 'text-zinc-400 opacity-60' : 'text-zinc-600 opacity-50'}`}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleMeritChange(idx, 'name', e.target.value)}
                    placeholder={ph(`Преимущество...`)}
                    className={`vtm-merit-input match-sheet-bg flex-1 px-1.5 py-0.5 h-full text-xs print:text-[11px] font-serif border-b border-dotted bg-transparent focus:outline-none leading-none ${
                      isDark
                        ? 'border-zinc-700 text-zinc-100 focus:border-red-500 placeholder:text-zinc-500'
                        : 'border-zinc-400 text-zinc-900 focus:border-red-700 placeholder:text-zinc-400'
                    }`}
                  />
                  <div className="print:hidden flex items-center gap-0.5 opacity-30 group-hover/row:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAdvantageModal('advantage', idx, item.name)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Выбрать преимущество из каталога"
                    >
                      <BookOpen className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal('advantage', idx, item)}
                      className="text-zinc-500 hover:text-amber-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Просмотреть или настроить описание"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <V5Dots
                      value={item.dots}
                      onChange={(val) => handleMeritChange(idx, 'dots', val)}
                      isDark={isDark}
                      min={0}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: FLAWS */}
          <div className="space-y-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-red-900/30 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-benguiat font-bold uppercase tracking-wider text-xs ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                  Недостатки
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAdvantageModal('disadvantage', null)}
                  className="print:hidden p-1 rounded hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-sans"
                  title="Выбрать недостаток из каталога"
                >
                  <BookOpen className="w-3.5 h-3.5 text-red-500/80" />
                  <span className="hidden sm:inline opacity-75 hover:opacity-100">Каталог</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal('disadvantage', null)}
                  className="print:hidden p-1 rounded hover:bg-red-950/40 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-sans"
                  title="Просмотреть или создать описание недостатка"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500/80" />
                </button>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Точки (1-5)</span>
            </div>

            <div className="space-y-1 sm:space-y-1.5 print:space-y-1 flex flex-col print-calib-p2-rows-container">
              {flaws.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between gap-1.5 py-0.5 min-w-0 h-6 sm:h-[26px] print:h-6 shrink-0 group/row">
                  <span className={`font-mono text-[10px] sm:text-[11px] print:text-[10px] w-4 text-right shrink-0 select-none ${isDark ? 'text-zinc-400 opacity-60' : 'text-zinc-600 opacity-50'}`}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleFlawChange(idx, 'name', e.target.value)}
                    placeholder={ph(`Недостаток...`)}
                    className={`vtm-flaw-input match-sheet-bg flex-1 px-1.5 py-0.5 h-full text-xs print:text-[11px] font-serif border-b border-dotted bg-transparent focus:outline-none leading-none ${
                      isDark
                        ? 'border-zinc-700 text-zinc-100 focus:border-red-500 placeholder:text-zinc-500'
                        : 'border-zinc-400 text-zinc-900 focus:border-red-700 placeholder:text-zinc-400'
                    }`}
                  />
                  <div className="print:hidden flex items-center gap-0.5 opacity-30 group-hover/row:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAdvantageModal('disadvantage', idx, item.name)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Выбрать недостаток из каталога"
                    >
                      <BookOpen className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal('disadvantage', idx, item)}
                      className="text-zinc-500 hover:text-amber-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Просмотреть или настроить описание"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <V5Dots
                      value={item.dots}
                      onChange={(val) => handleFlawChange(idx, 'dots', val)}
                      isDark={isDark}
                      min={0}
                      size="sm"
                      activeColor="bg-red-800 ring-1 ring-red-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Merits & Flaws Selection Modal */}
      <MeritFlawSelectModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseAdvantageModal}
        initialKind={modalConfig.kind}
        slotIndex={modalConfig.slotIndex}
        currentValue={modalConfig.currentValue}
        currentMerits={merits}
        currentFlaws={flaws}
        onSelectAdvantage={handleSelectAdvantageFromModal}
        onRemoveAdvantage={handleRemoveAdvantageFromModal}
      />

      {/* Advantage Detail & Custom Creation Modal */}
      <AdvantageDetailModal
        isOpen={detailModalConfig.isOpen}
        onClose={() => setDetailModalConfig((prev) => ({ ...prev, isOpen: false }))}
        initialName={detailModalConfig.name}
        initialKind={detailModalConfig.kind}
        initialDots={detailModalConfig.dots}
        initialDescription={detailModalConfig.description}
        slotIndex={detailModalConfig.slotIndex}
        onSaveToSheet={handleSaveDetailToSheet}
        onOpenCatalog={() => {
          setDetailModalConfig((prev) => ({ ...prev, isOpen: false }));
          handleOpenAdvantageModal(
            detailModalConfig.kind,
            detailModalConfig.slotIndex,
            detailModalConfig.name
          );
        }}
      />
    </>
  );
};
