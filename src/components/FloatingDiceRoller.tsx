import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterSheet } from '../types';
import { DICE_IMAGES } from '../utils/diceImages';
import { Dices, Trash2, X, Plus, Minus, History, RotateCcw, Droplet, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export const showFloatingDiceToast = (
  message: string,
  type: 'warning' | 'info' | 'success' | 'fail' = 'warning'
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vtm-show-dice-toast', {
        detail: { message, type, id: Date.now() },
      })
    );
  }
};

export interface TraitSelectionEvent {
  name: string;
  value: number;
  id: number;
}

interface FloatingDiceRollerProps {
  sheet: CharacterSheet;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  presetPool?: number | null;
  presetLabel?: string | null;
  traitSelectionEvent?: TraitSelectionEvent | null;
  onIncreaseHunger?: () => void;
  onSpendWillpower?: () => boolean;
}

interface DieItem {
  id: string;
  type: 'regular' | 'hunger';
  value?: number;
  image: string;
}

interface RollHistoryEntry {
  id: string;
  timestamp: string;
  totalDice: number;
  hungerDice: number;
  label?: string;
  dice: { type: 'regular' | 'hunger'; value: number; image: string }[];
  resultMessage: string;
  messageType: 'clean_crit' | 'messy_crit' | 'crit_fail' | 'fail' | 'success' | 'botch';
}

function formatSuccessesCount(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) {
    return `${n} успех`;
  } else if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
    return `${n} успеха`;
  } else {
    return `${n} успехов`;
  }
}

function formatDiceWord(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) {
    return 'кость';
  } else if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
    return 'кости';
  } else {
    return 'костей';
  }
}

function formatDotsWord(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) {
    return 'точка';
  } else if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
    return 'точки';
  } else {
    return 'точек';
  }
}

export const FloatingDiceRoller: React.FC<FloatingDiceRollerProps> = ({
  sheet,
  isOpen,
  onToggle,
  onClose,
  presetPool,
  presetLabel,
  traitSelectionEvent,
  onIncreaseHunger,
  onSpendWillpower,
}) => {
  // Roller mode: 'trait' (sheet check Attribute + Skill) or 'manual' (arbitrary pool)
  const [rollerMode, setRollerMode] = useState<'trait' | 'manual'>('trait');

  // Trait check slots
  const [trait1, setTrait1] = useState<{ name: string; value: number } | null>(null);
  const [trait2, setTrait2] = useState<{ name: string; value: number } | null>(null);
  const [hasRolledPair, setHasRolledPair] = useState<boolean>(false);

  // Manual total dice count
  const [manualTotalDice, setManualTotalDice] = useState<number>(5);
  // Manual hunger dice count (used when useCurrentHunger is false)
  const [manualHunger, setManualHunger] = useState<number>(1);
  // Use current hunger checkbox (default true)
  const [useCurrentHunger, setUseCurrentHunger] = useState<boolean>(true);

  // Checkbox: "Заполнять счетчик воли" при перебросе костей (default true)
  const [fillWillpowerOnReroll, setFillWillpowerOnReroll] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_fill_willpower_on_reroll');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vtm_fill_willpower_on_reroll', JSON.stringify(fillWillpowerOnReroll));
    } catch {}
  }, [fillWillpowerOnReroll]);

  // Selected dice indices for reroll (up to 3 regular dice)
  const [selectedForReroll, setSelectedForReroll] = useState<number[]>([]);

  // Rolled dice state
  const [rolledDice, setRolledDice] = useState<DieItem[] | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultDetails, setResultDetails] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'clean_crit' | 'messy_crit' | 'crit_fail' | 'fail' | 'success' | 'botch'>('success');
  const [manualActionLabel, setManualActionLabel] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<RollHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('vtm_dice_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Roll history collapsible state (default collapsed: false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Checkbox: Automatic hunger increase on Rouse Check failure
  const [autoHungerOnRouse, setAutoHungerOnRouse] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_auto_hunger_on_rouse');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vtm_auto_hunger_on_rouse', JSON.stringify(autoHungerOnRouse));
    } catch {}
  }, [autoHungerOnRouse]);

  // Collapsible settings box state: default collapsed on mobile (<640px) to save vertical space
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_dice_settings_open');
      if (saved !== null) return JSON.parse(saved);
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vtm_dice_settings_open', JSON.stringify(isSettingsOpen));
    } catch {}
  }, [isSettingsOpen]);

  // Rouse check & dice warning popup notification state
  const [rouseNotification, setRouseNotification] = useState<{
    id: number;
    isSuccess: boolean;
    rollValue?: number;
    message: string;
    customType?: 'warning' | 'info' | 'success' | 'fail';
  } | null>(null);
  const rouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail || !detail.message) return;

      if (rouseTimeoutRef.current) {
        clearTimeout(rouseTimeoutRef.current);
      }

      setRouseNotification({
        id: detail.id || Date.now(),
        isSuccess: detail.type === 'success',
        rollValue: detail.rollValue,
        message: detail.message,
        customType: detail.type || 'warning',
      });

      rouseTimeoutRef.current = setTimeout(() => {
        setRouseNotification(null);
      }, 4000);
    };

    window.addEventListener('vtm-show-dice-toast', handleToastEvent);

    return () => {
      window.removeEventListener('vtm-show-dice-toast', handleToastEvent);
      if (rouseTimeoutRef.current) {
        clearTimeout(rouseTimeoutRef.current);
      }
    };
  }, []);

  const handleRouseCheck = () => {
    const roll = Math.floor(Math.random() * 10) + 1;
    const isSuccess = roll >= 6;

    const msg = isSuccess
      ? 'Воззвание к Крови — успех. Голод не меняется'
      : 'Воззвание к Крови — провал. Голод растет на 1';

    let dieImg = DICE_IMAGES.hblank;
    if (roll === 10) dieImg = DICE_IMAGES.hcrit;
    else if (roll >= 6) dieImg = DICE_IMAGES.hsuc;
    else if (roll === 1) dieImg = DICE_IMAGES.hfail;
    else dieImg = DICE_IMAGES.hblank;

    if (!isSuccess && autoHungerOnRouse && onIncreaseHunger) {
      onIncreaseHunger();
    }

    const historyEntry: RollHistoryEntry = {
      id: `rouse-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalDice: 1,
      hungerDice: 1,
      label: `Воззвание к Крови (кость: ${roll})`,
      dice: [
        {
          type: 'hunger',
          value: roll,
          image: dieImg,
        },
      ],
      resultMessage: msg,
      messageType: isSuccess ? 'success' : 'fail',
    };
    setHistory((prev) => [historyEntry, ...prev.slice(0, 29)]);

    const notifId = Date.now();
    setRouseNotification({
      id: notifId,
      isSuccess,
      rollValue: roll,
      message: msg,
    });

    if (rouseTimeoutRef.current) {
      clearTimeout(rouseTimeoutRef.current);
    }
    rouseTimeoutRef.current = setTimeout(() => {
      setRouseNotification(null);
    }, 5000);
  };

  // Track last handled event ID to avoid double-firing
  const lastEventIdRef = useRef<number | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vtm_dice_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // Ignore quota errors
    }
  }, [history]);

  // Handle trait selection event from clicking sheet attributes or skills
  useEffect(() => {
    if (!traitSelectionEvent || traitSelectionEvent.id === lastEventIdRef.current) {
      return;
    }
    lastEventIdRef.current = traitSelectionEvent.id;

    // Switch to trait check mode
    setRollerMode('trait');
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);

    const incoming = { name: traitSelectionEvent.name, value: traitSelectionEvent.value };

    // Logic for two-step selection:
    // 1. If both are already filled: reset both and make incoming the first trait!
    // 2. If slot 1 is empty: set slot 1, slot 2 stays empty
    // 3. If slot 1 is filled and slot 2 is empty: set slot 2! Both are now selected.
    if (trait1 && trait2) {
      setTrait1(incoming);
      setTrait2(null);
      setHasRolledPair(false);
    } else if (!trait1) {
      setTrait1(incoming);
      setHasRolledPair(false);
    } else {
      setTrait2(incoming);
      setHasRolledPair(false);
    }
  }, [traitSelectionEvent, trait1, trait2]);

  // Handle preset pool if passed manually
  useEffect(() => {
    if (presetPool !== undefined && presetPool !== null && presetPool > 0) {
      setManualTotalDice(presetPool);
      if (presetLabel) {
        setManualActionLabel(presetLabel);
      }
    }
  }, [presetPool, presetLabel]);

  // Current hunger from sheet
  const sheetHunger = sheet.v5Tracks?.hunger ?? sheet.bloodPool?.current ?? 1;

  // Calculate effective total dice based on active mode
  const traitPool = (trait1?.value ?? 0) + (trait2?.value ?? 0);
  const totalDice = rollerMode === 'trait' ? Math.max(1, traitPool) : manualTotalDice;

  // Effective hunger count
  const effectiveHunger = useCurrentHunger
    ? Math.min(sheetHunger, totalDice)
    : Math.min(manualHunger, totalDice);

  const regularDiceCount = Math.max(0, totalDice - effectiveHunger);
  const hungerDiceCount = effectiveHunger;

  // Trait mode roll disabled condition: BOTH traits must be chosen!
  const isRollDisabled = rollerMode === 'trait' ? (!trait1 || !trait2) : false;

  // Trait clearing handlers
  const handleRemoveTrait = (slot: 1 | 2) => {
    if (slot === 1) {
      setTrait1(null);
    } else {
      setTrait2(null);
    }
    setHasRolledPair(false);
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);
  };

  const handleClearBothTraits = () => {
    setTrait1(null);
    setTrait2(null);
    setHasRolledPair(false);
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);
  };

  // Manual total dice counter
  const handleManualTotalChange = (delta: number) => {
    setManualTotalDice((prev) => {
      const next = Math.max(1, Math.min(30, prev + delta));
      if (manualHunger > next) {
        setManualHunger(next);
      }
      return next;
    });
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);
  };

  // Hunger counter (when checkbox is unchecked)
  const handleHungerChange = (delta: number) => {
    setManualHunger((prev) => Math.max(0, Math.min(totalDice, Math.min(5, prev + delta))));
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setUseCurrentHunger(checked);
    setRolledDice(null);
    setResultMessage(null);
    setResultDetails(null);
    setSelectedForReroll([]);
  };

  // Compute displayed dice (either from current roll result or preview blank dice)
  const displayDice: DieItem[] = rolledDice
    ? rolledDice
    : [
        ...Array.from({ length: regularDiceCount }, (_, i) => ({
          id: `reg-preview-${i}`,
          type: 'regular' as const,
          image: DICE_IMAGES.blank,
        })),
        ...Array.from({ length: hungerDiceCount }, (_, i) => ({
          id: `hng-preview-${i}`,
          type: 'hunger' as const,
          image: DICE_IMAGES.hblank,
        })),
      ];

  // Perform the roll
  const handleRoll = () => {
    if (isRollDisabled) return;
    setSelectedForReroll([]);

    const regularRolls: number[] = [];
    for (let i = 0; i < regularDiceCount; i++) {
      regularRolls.push(Math.floor(Math.random() * 10) + 1);
    }

    const hungerRolls: number[] = [];
    for (let i = 0; i < hungerDiceCount; i++) {
      hungerRolls.push(Math.floor(Math.random() * 10) + 1);
    }

    const newDice: DieItem[] = [
      ...regularRolls.map((val, idx) => {
        let img = DICE_IMAGES.blank;
        if (val === 10) {
          img = DICE_IMAGES.crit;
        } else if (val >= 6) {
          img = DICE_IMAGES.suc;
        }
        return {
          id: `reg-${idx}-${Date.now()}`,
          type: 'regular' as const,
          value: val,
          image: img,
        };
      }),
      ...hungerRolls.map((val, idx) => {
        let img = DICE_IMAGES.hblank;
        if (val === 10) {
          img = DICE_IMAGES.hcrit;
        } else if (val >= 6) {
          img = DICE_IMAGES.hsuc;
        } else if (val === 1) {
          img = DICE_IMAGES.hfail;
        }
        return {
          id: `hng-${idx}-${Date.now()}`,
          type: 'hunger' as const,
          value: val,
          image: img,
        };
      }),
    ];

    setRolledDice(newDice);
    setHasRolledPair(true);

    // Calculate outcomes per VTM V5 rules:
    // 1-5 fail, 6-9 success (1), 10 crit (1 + bonus if paired)
    const regularTens = regularRolls.filter((v) => v === 10).length;
    const hungerTens = hungerRolls.filter((v) => v === 10).length;
    const totalTens = regularTens + hungerTens;
    const critPairs = Math.floor(totalTens / 2);

    const regularStandardSuccesses = regularRolls.filter((v) => v >= 6 && v <= 9).length;
    const hungerStandardSuccesses = hungerRolls.filter((v) => v >= 6 && v <= 9).length;

    // Total successes = standard successes (6-9) + tens (1 each) + (pairs * 2 bonus successes)
    const totalSuccesses = regularStandardSuccesses + hungerStandardSuccesses + totalTens + critPairs * 2;

    const hasTriumph = critPairs >= 1;
    const isBloodyTriumph = hasTriumph && hungerTens >= 1;
    const isCleanTriumph = hasTriumph && hungerTens === 0;
    const hasBloodyFailure = hungerRolls.some((v) => v === 1);

    const successWord = formatSuccessesCount(totalSuccesses);

    let msg = '';
    let type: 'clean_crit' | 'messy_crit' | 'crit_fail' | 'fail' | 'success' | 'botch' = 'success';

    if (isCleanTriumph && hasBloodyFailure) {
      msg = `${successWord} — ТРИУМФ или КРОВАВЫЙ ПРОВАЛ`;
      type = 'crit_fail';
    } else if (isBloodyTriumph && hasBloodyFailure) {
      msg = `${successWord} — КРОВАВЫЙ ТРИУМФ или КРОВАВЫЙ ПРОВАЛ`;
      type = 'crit_fail';
    } else if (isBloodyTriumph) {
      msg = `${successWord} — КРОВАВЫЙ ТРИУМФ!`;
      type = 'messy_crit';
    } else if (isCleanTriumph) {
      msg = `${successWord} — ТРИУМФ!`;
      type = 'clean_crit';
    } else if (hasBloodyFailure) {
      msg = totalSuccesses > 0 ? `${successWord} или КРОВАВЫЙ ПРОВАЛ` : `${successWord} — КРОВАВЫЙ ПРОВАЛ!`;
      type = 'fail';
    } else {
      msg = totalSuccesses > 0 ? successWord : `${successWord} (Провал)`;
      type = totalSuccesses > 0 ? 'success' : 'botch';
    }

    // Detail explanations (pairs of 10s, ones on hunger)
    const detailParts: string[] = [];
    if (critPairs > 0) {
      detailParts.push(`${critPairs === 1 ? '1 пара десяток' : `${critPairs} пары десяток`} (+${critPairs * 2} доп. успеха)`);
    }
    if (hasBloodyFailure) {
      const onesCount = hungerRolls.filter((v) => v === 1).length;
      detailParts.push(`${onesCount === 1 ? 'выпала 1' : `выпало единиц: ${onesCount}`} на Голоде`);
    }

    setResultMessage(msg);
    setResultDetails(detailParts.length > 0 ? detailParts.join(' • ') : null);
    setMessageType(type);

    // Compute roll label
    const currentLabel =
      rollerMode === 'trait' && trait1 && trait2
        ? `${trait1.name} (${trait1.value}) + ${trait2.name} (${trait2.value})`
        : manualActionLabel || 'Свободный бросок';

    // Add to history
    const historyEntry: RollHistoryEntry = {
      id: `roll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalDice,
      hungerDice: effectiveHunger,
      label: currentLabel,
      dice: newDice.map((d) => ({
        type: d.type,
        value: d.value || 0,
        image: d.image,
      })),
      resultMessage: msg,
      messageType: type,
    };

    setHistory((prev) => [historyEntry, ...prev.slice(0, 29)]);
  };

  // Perform reroll of selected regular dice (up to 3 dice per V5 rules)
  const handleRerollSelected = () => {
    if (!rolledDice || selectedForReroll.length === 0) return;

    // Check V5 rule: if "Заполнять счетчик воли" is checked, fill Willpower damage on the sheet
    if (fillWillpowerOnReroll && onSpendWillpower) {
      const canSpend = onSpendWillpower();
      if (!canSpend) {
        showFloatingDiceToast('Все ячейки Воли заполнены тяжелым уроном! Персонаж не может тратить Силу Воли.', 'fail');
        return;
      }
      showFloatingDiceToast('Переброс за Силу Воли: нанесен 1 поверхностный урон Воле', 'info');
    }

    const rerollIndices = [...selectedForReroll];
    const rerolledCount = rerollIndices.length;

    // Reroll only the selected regular dice
    const updatedDice = rolledDice.map((die, idx) => {
      if (rerollIndices.includes(idx) && die.type === 'regular') {
        const val = Math.floor(Math.random() * 10) + 1;
        let img = DICE_IMAGES.blank;
        if (val === 10) {
          img = DICE_IMAGES.crit;
        } else if (val >= 6) {
          img = DICE_IMAGES.suc;
        }
        return {
          ...die,
          value: val,
          image: img,
        };
      }
      return die;
    });

    setRolledDice(updatedDice);
    setSelectedForReroll([]);

    // Recalculate outcomes per VTM V5 rules:
    const regularRolls = updatedDice.filter((d) => d.type === 'regular').map((d) => d.value ?? 0);
    const hungerRolls = updatedDice.filter((d) => d.type === 'hunger').map((d) => d.value ?? 0);

    const regularTens = regularRolls.filter((v) => v === 10).length;
    const hungerTens = hungerRolls.filter((v) => v === 10).length;
    const totalTens = regularTens + hungerTens;
    const critPairs = Math.floor(totalTens / 2);

    const regularStandardSuccesses = regularRolls.filter((v) => v >= 6 && v <= 9).length;
    const hungerStandardSuccesses = hungerRolls.filter((v) => v >= 6 && v <= 9).length;

    const totalSuccesses = regularStandardSuccesses + hungerStandardSuccesses + totalTens + critPairs * 2;

    const hasTriumph = critPairs >= 1;
    const isBloodyTriumph = hasTriumph && hungerTens >= 1;
    const isCleanTriumph = hasTriumph && hungerTens === 0;
    const hasBloodyFailure = hungerRolls.some((v) => v === 1);

    const successWord = formatSuccessesCount(totalSuccesses);

    let msg = '';
    let type: 'clean_crit' | 'messy_crit' | 'crit_fail' | 'fail' | 'success' | 'botch' = 'success';

    if (isCleanTriumph && hasBloodyFailure) {
      msg = `${successWord} — ТРИУМФ или КРОВАВЫЙ ПРОВАЛ`;
      type = 'crit_fail';
    } else if (isBloodyTriumph && hasBloodyFailure) {
      msg = `${successWord} — КРОВАВЫЙ ТРИУМФ или КРОВАВЫЙ ПРОВАЛ`;
      type = 'crit_fail';
    } else if (isBloodyTriumph) {
      msg = `${successWord} — КРОВАВЫЙ ТРИУМФ!`;
      type = 'messy_crit';
    } else if (isCleanTriumph) {
      msg = `${successWord} — ТРИУМФ!`;
      type = 'clean_crit';
    } else if (hasBloodyFailure) {
      msg = totalSuccesses > 0 ? `${successWord} или КРОВАВЫЙ ПРОВАЛ` : `${successWord} — КРОВАВЫЙ ПРОВАЛ!`;
      type = 'fail';
    } else {
      msg = totalSuccesses > 0 ? successWord : `${successWord} (Провал)`;
      type = totalSuccesses > 0 ? 'success' : 'botch';
    }

    const detailParts: string[] = [];
    detailParts.push(`Переброшено за Волю: ${rerolledCount} ${formatDiceWord(rerolledCount)}`);
    if (critPairs > 0) {
      detailParts.push(`${critPairs === 1 ? '1 пара десяток' : `${critPairs} пары десяток`} (+${critPairs * 2} доп. успеха)`);
    }
    if (hasBloodyFailure) {
      const onesCount = hungerRolls.filter((v) => v === 1).length;
      detailParts.push(`${onesCount === 1 ? 'выпала 1' : `выпало единиц: ${onesCount}`} на Голоде`);
    }

    setResultMessage(msg);
    setResultDetails(detailParts.length > 0 ? detailParts.join(' • ') : null);
    setMessageType(type);

    const currentLabel =
      rollerMode === 'trait' && trait1 && trait2
        ? `${trait1.name} (${trait1.value}) + ${trait2.name} (${trait2.value})`
        : manualActionLabel || 'Свободный бросок';

    const historyEntry: RollHistoryEntry = {
      id: `reroll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalDice,
      hungerDice: effectiveHunger,
      label: `${currentLabel} (Переброс ${rerolledCount} ${formatDiceWord(rerolledCount)})`,
      dice: updatedDice.map((d) => ({
        type: d.type,
        value: d.value || 0,
        image: d.image,
      })),
      resultMessage: msg,
      messageType: type,
    };

    setHistory((prev) => [historyEntry, ...prev.slice(0, 29)]);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('vtm_dice_history');
    } catch {}
  };

  return (
    <>
      {/* Floating Buttons Cluster at bottom-right */}
      <div
        id="vtm-floating-buttons-cluster"
        className="fixed bottom-6 right-6 z-50 print:hidden flex items-center gap-3"
      >
        {/* Left Floating Button: Rouse Check (Капля крови) */}
        <div className="relative">
          {/* Rouse Check & Floating Toast Notification (positioned to the left of button) */}
          <AnimatePresence mode="wait">
            {rouseNotification && (
              <motion.div
                key={rouseNotification.id}
                initial={{ opacity: 0, x: 15, scale: 0.93 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 15, scale: 0.93 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-50 w-72 max-w-[calc(100vw-180px)] sm:w-80 pointer-events-auto"
              >
                <div
                  className={`relative p-3 rounded-2xl shadow-2xl backdrop-blur-md border text-zinc-100 flex items-start gap-2.5 transition-colors ${
                    rouseNotification.customType === 'warning'
                      ? 'bg-zinc-950/95 border-amber-500/90 shadow-amber-950/80 text-amber-100'
                      : rouseNotification.customType === 'info'
                      ? 'bg-zinc-950/95 border-sky-500/90 shadow-sky-950/80 text-sky-100'
                      : rouseNotification.isSuccess
                      ? 'bg-zinc-950/95 border-emerald-500/80 shadow-emerald-950/60 text-emerald-100'
                      : 'bg-zinc-950/95 border-rose-600/80 shadow-rose-950/70 text-rose-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      rouseNotification.customType === 'warning'
                        ? 'bg-amber-950/90 text-amber-400 border border-amber-600/70'
                        : rouseNotification.customType === 'info'
                        ? 'bg-sky-950/90 text-sky-400 border border-sky-600/70'
                        : rouseNotification.isSuccess
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-600/70'
                        : 'bg-rose-950/90 text-rose-400 border border-rose-600/70'
                    }`}
                  >
                    {rouseNotification.customType === 'warning' ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : rouseNotification.isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-zinc-300">
                        {rouseNotification.customType === 'warning'
                          ? 'Предупреждение'
                          : rouseNotification.customType === 'info'
                          ? 'Информация'
                          : rouseNotification.isSuccess
                          ? 'Успех'
                          : 'Провал'}
                      </span>
                      {typeof rouseNotification.rollValue === 'number' && rouseNotification.rollValue > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          d10: {rouseNotification.rollValue}
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-[12.5px] leading-snug font-medium">
                      {rouseNotification.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRouseNotification(null)}
                    className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                    title="Закрыть уведомление"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Subtle rightward arrow pointing to the Rouse Check button */}
                  <div
                    className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-950 border-t border-r rotate-45 shadow-md z-10 hidden sm:block ${
                      rouseNotification.customType === 'warning'
                        ? 'border-amber-600'
                        : rouseNotification.customType === 'info'
                        ? 'border-sky-600'
                        : rouseNotification.isSuccess
                        ? 'border-emerald-600'
                        : 'border-rose-600'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            id="vtm-floating-rouse-button"
            onClick={handleRouseCheck}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-600 via-red-700 to-rose-950 hover:from-rose-500 hover:via-red-600 hover:to-rose-900 border-2 border-red-400/80 shadow-2xl shadow-red-950/90 flex items-center justify-center p-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group relative"
            title="Воззвание к Крови (Rouse Check)"
            aria-label="Совершить Воззвание к Крови"
          >
            <Droplet className="w-6 h-6 text-red-100 fill-current filter drop-shadow-md transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Right Floating Button: Dice Roller */}
        <button
          type="button"
          id="vtm-floating-dice-button"
          onClick={onToggle}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-700 via-red-800 to-red-950 hover:from-red-600 hover:via-red-700 hover:to-red-900 border-2 border-red-500/80 shadow-2xl shadow-red-950/80 flex items-center justify-center p-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group relative"
          title="Бросок костей (V5)"
          aria-label="Открыть бросок костей"
        >
          <img
            src={DICE_IMAGES.icon}
            alt="Бросок костей"
            className="w-full h-full object-contain filter drop-shadow transition-transform group-hover:rotate-12"
          />
        </button>
      </div>

      {/* Floating Windows (History on the left when open, Roller + Checkbox on the right) */}
      {isOpen && (
        <div
          id="vtm-floating-dice-container"
          className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 print:hidden flex flex-col md:flex-row items-end md:items-end gap-2 sm:gap-3 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Roll History Window (Collapsible, default collapsed, expands to the left) */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                key="dice-history-panel"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                id="vtm-floating-dice-history"
                className="w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-md border border-red-900/60 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200 max-h-64 sm:max-h-96 md:max-h-[520px] shrink-0"
              >
                {/* Header with Clear and Collapse buttons */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-red-900/30 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-zinc-300">
                    <History className="w-3.5 h-3.5 text-red-400" />
                    <span>История бросков</span>
                    {history.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {history.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      disabled={history.length === 0}
                      className="px-2 py-1 text-[11px] font-sans text-red-400 hover:text-red-200 hover:bg-red-950/50 disabled:opacity-30 rounded border border-red-900/40 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      title="Очистить историю бросков"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Очистить</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded transition-colors cursor-pointer"
                      title="Свернуть историю"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* History List */}
                <div className="p-2.5 sm:p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs font-serif flex flex-col items-center justify-center gap-2">
                      <Dices className="w-8 h-8 text-zinc-700" />
                      <span>История бросков пуста</span>
                    </div>
                  ) : (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-800/80 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans">
                          <span className="font-semibold text-zinc-400 truncate max-w-[150px]" title={entry.label}>
                            {entry.label || `Пул: ${entry.totalDice} (🩸 ${entry.hungerDice})`}
                          </span>
                          <span>{entry.timestamp}</span>
                        </div>

                        {/* Result message badge */}
                        <div
                          className={`font-serif font-semibold text-[11.5px] leading-tight ${
                            entry.messageType === 'clean_crit'
                              ? 'text-amber-400'
                              : entry.messageType === 'messy_crit'
                              ? 'text-red-400'
                              : entry.messageType === 'crit_fail'
                              ? 'text-amber-300'
                              : entry.messageType === 'fail'
                              ? 'text-red-400/90'
                              : entry.messageType === 'success'
                              ? 'text-emerald-400'
                              : 'text-zinc-400'
                          }`}
                        >
                          {entry.resultMessage}
                        </div>

                        {/* Mini thumbnails of the dice */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {entry.dice.map((d, dIdx) => (
                            <img
                              key={dIdx}
                              src={d.image}
                              alt={`${d.type}-${d.value}`}
                              className="w-5 h-5 object-contain"
                              title={`${d.type === 'hunger' ? 'Голод' : 'Обычный'}: ${d.value}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Roller Column (Dice Roller Window + Checkbox underneath) */}
          <div className="w-[310px] xs:w-80 sm:w-96 flex flex-col gap-1.5 sm:gap-2 shrink-0 max-h-[calc(100dvh-5.5rem)]">
            {/* Main Floating Window: "Бросок костей" */}
            <div
              id="vtm-floating-dice-roller"
              className="bg-zinc-950/95 backdrop-blur-md border border-red-900/60 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200 max-h-[calc(100dvh-8.5rem)] sm:max-h-none"
            >
              {/* Header with Title, Mode Switcher, History Toggle & Close */}
              <div className="bg-gradient-to-r from-red-950/90 via-zinc-900 to-zinc-950 border-b border-red-900/40 px-2.5 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <img src={DICE_IMAGES.icon} alt="Кости" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  <span className="font-serif font-bold text-red-100 text-xs sm:text-sm tracking-wide">
                    Бросок костей
                  </span>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-[10px] sm:text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRollerMode('trait')}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-1 font-serif font-medium rounded-md transition-all cursor-pointer ${
                      rollerMode === 'trait'
                        ? 'bg-red-900 text-white shadow-sm font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Автоматический расчет пула по клику на характеристику и навык"
                  >
                    Проверка листа
                  </button>
                  <button
                    type="button"
                    onClick={() => setRollerMode('manual')}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-1 font-serif font-medium rounded-md transition-all cursor-pointer ${
                      rollerMode === 'manual'
                        ? 'bg-red-900 text-white shadow-sm font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Ручной выбор количества костей"
                  >
                    Ручной пул
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* History Toggle Button */}
                  <button
                    type="button"
                    id="vtm-toggle-history-btn"
                    onClick={() => setIsHistoryOpen((prev) => !prev)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer relative ${
                      isHistoryOpen
                        ? 'bg-red-900/90 text-red-100 border border-red-700/80 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                    }`}
                    title={isHistoryOpen ? 'Свернуть историю бросков' : 'Развернуть историю бросков'}
                    aria-label={isHistoryOpen ? 'Свернуть историю бросков' : 'Развернуть историю бросков'}
                  >
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {history.length > 0 && !isHistoryOpen && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-zinc-950" />
                    )}
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    id="vtm-close-dice-btn"
                    onClick={onClose}
                    className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    title="Закрыть окно броска"
                    aria-label="Закрыть окно броска"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

            <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3.5 overflow-y-auto scrollbar-thin flex-1">
              {/* --- POOL SELECTION SECTION --- */}
              {rollerMode === 'trait' ? (
                /* Trait Check Mode (Attribute + Skill auto-calculation) */
                <div className="space-y-1.5 sm:space-y-2 bg-zinc-900/40 p-2 sm:p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-serif">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <span>Пул проверки:</span>
                    </span>
                    {(trait1 || trait2) && (
                      <button
                        type="button"
                        onClick={handleClearBothTraits}
                        className="text-[10px] sm:text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Очистить оба ресурса"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Сбросить</span>
                      </button>
                    )}
                  </div>

                  {/* Resource 1 Slot */}
                  <div
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all flex items-center justify-between min-h-[34px] sm:min-h-[42px] ${
                      trait1
                        ? 'bg-zinc-900/90 border-red-900/70 text-zinc-100 shadow-sm'
                        : 'bg-zinc-950/40 border-dashed border-red-700/60 text-red-300/90 animate-pulse'
                    }`}
                  >
                    {trait1 ? (
                      <>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="font-serif font-bold text-xs sm:text-sm text-zinc-100 truncate">
                            {trait1.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className="font-mono text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-red-950/80 border border-red-800/80 text-red-300 font-bold">
                            {trait1.value} {formatDotsWord(trait1.value)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTrait(1)}
                            className="text-zinc-400 hover:text-red-400 p-0.5 sm:p-1 rounded hover:bg-zinc-800/60 transition-colors cursor-pointer"
                            title="Удалить ресурс 1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] sm:text-xs italic text-red-300/90 flex items-center gap-1.5 sm:gap-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        Нажмите на навык или характеристику на листе
                      </span>
                    )}
                  </div>

                  {/* Bold Plus Sign */}
                  <div className="flex items-center justify-center -my-1 relative z-10">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-red-800/80 flex items-center justify-center text-red-400 font-bold text-[10px] sm:text-xs shadow-md">
                      +
                    </div>
                  </div>

                  {/* Resource 2 Slot */}
                  <div
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all flex items-center justify-between min-h-[34px] sm:min-h-[42px] ${
                      trait2
                        ? 'bg-zinc-900/90 border-red-900/70 text-zinc-100 shadow-sm'
                        : trait1
                        ? 'bg-zinc-900/40 border-dashed border-red-700/60 text-red-300/90 animate-pulse'
                        : 'bg-zinc-950/40 border-dashed border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {trait2 ? (
                      <>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="font-serif font-bold text-xs sm:text-sm text-zinc-100 truncate">
                            {trait2.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className="font-mono text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-red-950/80 border border-red-800/80 text-red-300 font-bold">
                            {trait2.value} {formatDotsWord(trait2.value)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTrait(2)}
                            className="text-zinc-400 hover:text-red-400 p-0.5 sm:p-1 rounded hover:bg-zinc-800/60 transition-colors cursor-pointer"
                            title="Удалить ресурс 2"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className={`text-[11px] sm:text-xs italic flex items-center gap-1.5 sm:gap-2 py-0.5 ${trait1 ? 'text-red-300/90' : 'text-zinc-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${trait1 ? 'bg-red-500 animate-ping' : 'bg-zinc-600'}`} />
                        {trait1 ? 'Нажмите на второй ресурс на листе...' : 'Ожидание первого ресурса'}
                      </span>
                    )}
                  </div>

                  {/* Calculated Pool Total Badge */}
                  {trait1 && trait2 && (
                    <div className="flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-950/50 border border-red-900/60 text-[11px] sm:text-xs animate-in fade-in">
                      <span className="font-serif text-zinc-300">Расчетный пул:</span>
                      <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
                        {trait1.value} + {trait2.value} = {trait1.value + trait2.value} {formatDiceWord(trait1.value + trait2.value)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Pool Selection Mode */
                <div className="space-y-1.5 sm:space-y-2.5 bg-zinc-900/40 p-2 sm:p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-serif font-medium text-zinc-200">
                        Общее количество костей:
                      </span>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        (Обычные кости d10 + Голод)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleManualTotalChange(-1)}
                        disabled={manualTotalDice <= 1}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title="Уменьшить на 1"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-7 sm:w-8 text-center font-mono font-bold text-sm sm:text-base text-zinc-100 select-none">
                        {manualTotalDice}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleManualTotalChange(1)}
                        disabled={manualTotalDice >= 30}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title="Увеличить на 1"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- HUNGER SETTINGS SECTION --- */}
              <div className="space-y-1.5 sm:space-y-2 bg-zinc-900/40 p-2 sm:p-3 rounded-xl border border-zinc-800/80">
                {/* Checkbox: "Использовать текущий голод" (по умолчанию включен) */}
                <label className="flex items-center justify-between gap-2.5 cursor-pointer text-[11px] sm:text-xs text-zinc-300 hover:text-white select-none">
                  <span className="flex items-center gap-1.5 font-serif">
                    <span>Использовать текущий голод</span>
                    <span className="text-red-400 font-mono font-semibold">({sheetHunger} 🩸)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={useCurrentHunger}
                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4 accent-red-600 cursor-pointer"
                  />
                </label>

                {/* Counter 2: Hunger dice (hidden if checkbox is checked) */}
                {!useCurrentHunger && (
                  <div className="flex items-center justify-between gap-2 pt-1.5 sm:pt-2 border-t border-zinc-800/60 animate-in fade-in duration-150">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-serif font-medium text-red-400 flex items-center gap-1">
                        <span>Кости голода:</span>
                        <span className="text-xs">🩸</span>
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-zinc-500 font-sans">
                        (заменяют обычные кости)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleHungerChange(-1)}
                        disabled={manualHunger <= 0}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-950/70 hover:bg-red-900 disabled:opacity-30 text-red-200 flex items-center justify-center font-bold text-xs sm:text-sm border border-red-900/50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title="Уменьшить кости голода"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-7 sm:w-8 text-center font-mono font-bold text-sm sm:text-base text-red-400 select-none">
                        {effectiveHunger}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleHungerChange(1)}
                        disabled={manualHunger >= Math.min(totalDice, 5)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-950/70 hover:bg-red-900 disabled:opacity-30 text-red-200 flex items-center justify-center font-bold text-xs sm:text-sm border border-red-900/50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title="Увеличить кости голода"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- DICE DISPLAY & RESULT AREA --- */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 px-1 font-sans">
                  <span>
                    Обычные кости: <strong className="text-zinc-200">{regularDiceCount}</strong>
                  </span>
                  <span>
                    Кости голода: <strong className="text-red-400">{hungerDiceCount} 🩸</strong>
                  </span>
                </div>

                {/* Helper hint for reroll when rolled */}
                {rolledDice && rolledDice.length > 0 && (
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-sans px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                      {selectedForReroll.length === 0 ? (
                        <span>Нажмите на кости (до 3), чтобы перебросить:</span>
                      ) : (
                        <span className="text-amber-300 font-medium">
                          Выбрано для переброса: <strong>{selectedForReroll.length} из 3</strong>
                        </span>
                      )}
                    </span>
                    {selectedForReroll.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedForReroll([])}
                        className="text-amber-400 hover:text-amber-200 text-[10px] sm:text-[10.5px] font-medium underline cursor-pointer ml-2"
                      >
                        Сбросить
                      </button>
                    )}
                  </div>
                )}

                {/* Dice container */}
                <div className="p-2 sm:p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 min-h-[58px] sm:min-h-[86px] flex flex-wrap gap-1.5 sm:gap-2.5 justify-center items-center">
                  {rollerMode === 'trait' && (!trait1 || !trait2) ? (
                    <div className="py-2.5 sm:py-3 px-2 text-center text-xs font-serif text-zinc-400 flex flex-col items-center gap-1.5">
                      <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-red-500/70 animate-bounce" />
                      <span className="text-[11px] sm:text-xs">
                        {!trait1
                          ? 'Нажмите на первый навык или характеристику на листе'
                          : 'Нажмите на второй ресурс на листе, чтобы сформировать пул'}
                      </span>
                    </div>
                  ) : (
                    displayDice.map((die, idx) => {
                      const isRolled = Boolean(rolledDice && rolledDice.length > 0);
                      const isHunger = die.type === 'hunger';
                      const isSelected = selectedForReroll.includes(idx);

                      return (
                        <button
                          key={die.id || idx}
                          type="button"
                          onClick={() => {
                            if (!isRolled) return;
                            if (isHunger) {
                              showFloatingDiceToast('По правилам V5 кости Голода нельзя перебрасывать за Силу Воли!', 'warning');
                              return;
                            }
                            if (isSelected) {
                              setSelectedForReroll((prev) => prev.filter((i) => i !== idx));
                            } else {
                              if (selectedForReroll.length >= 3) {
                                showFloatingDiceToast('Можно выбрать не более 3 костей для переброса!', 'warning');
                                return;
                              }
                              setSelectedForReroll((prev) => [...prev, idx]);
                            }
                          }}
                          className={`flex flex-col items-center group relative animate-in zoom-in-90 duration-150 p-0.5 sm:p-1 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-950/60 cursor-pointer'
                              : isRolled && !isHunger
                              ? 'cursor-pointer hover:scale-105 hover:ring-1 hover:ring-amber-500/60'
                              : isRolled && isHunger
                              ? 'cursor-not-allowed opacity-90'
                              : 'cursor-default'
                          }`}
                          title={
                            !isRolled
                              ? isHunger
                                ? 'Кость Голода'
                                : 'Обычная кость'
                              : isHunger
                              ? `Кость Голода (${die.value}) — нельзя перебрасывать за Силу Воли`
                              : isSelected
                              ? `Кость выбрана для переброса (${die.value}). Нажмите для отмены.`
                              : `Обычная кость (${die.value}). Нажмите, чтобы выбрать для переброса за Силу Воли (до 3 шт.).`
                          }
                        >
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-[8px] sm:text-[9px] shadow-sm z-10">
                              ✓
                            </span>
                          )}
                          <img
                            src={die.image}
                            alt={die.type}
                            className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md select-none transition-transform group-hover:scale-105 ${
                              die.type === 'hunger' ? 'ring-1 ring-red-900/40 rounded-lg' : ''
                            }`}
                          />
                          {die.value !== undefined && (
                            <span
                              className={`text-[9.5px] sm:text-[10px] font-mono font-bold mt-0.5 leading-none ${
                                isSelected
                                  ? 'text-amber-400 font-extrabold'
                                  : die.type === 'hunger'
                                  ? die.value === 10
                                    ? 'text-red-400 font-extrabold'
                                    : die.value === 1
                                    ? 'text-red-500 font-extrabold'
                                    : die.value >= 6
                                    ? 'text-red-300'
                                    : 'text-zinc-500'
                                  : die.value === 10
                                  ? 'text-amber-400 font-extrabold'
                                  : die.value >= 6
                                  ? 'text-zinc-200'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {die.value}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Result block strictly UNDER the dice */}
                {resultMessage ? (
                  <div
                    id="vtm-dice-result-banner"
                    className={`text-center py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-serif font-bold text-xs sm:text-sm tracking-wide border shadow-md transition-all animate-in fade-in duration-200 ${
                      messageType === 'clean_crit'
                        ? 'bg-amber-950/50 border-amber-500/70 text-amber-300 shadow-amber-950/40'
                        : messageType === 'messy_crit'
                        ? 'bg-red-950/70 border-red-500 text-red-300 shadow-red-950/50'
                        : messageType === 'crit_fail'
                        ? 'bg-gradient-to-r from-amber-950/60 to-red-950/70 border-red-500 text-amber-200 shadow-red-950/40'
                        : messageType === 'fail'
                        ? 'bg-red-950/60 border-red-700 text-red-300 shadow-red-950/40'
                        : messageType === 'success'
                        ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300 shadow-emerald-950/30'
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="text-sm sm:text-base font-extrabold tracking-wide">
                      {resultMessage}
                    </div>
                    {resultDetails && (
                      <div className="text-[10px] sm:text-[11px] font-sans font-normal text-zinc-300/85 mt-0.5">
                        {resultDetails}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border border-dashed border-zinc-800/80 text-zinc-500 text-[11px] sm:text-xs font-sans">
                    Результат броска (успехи) отобразится здесь
                  </div>
                )}
              </div>

              {/* --- ROLL / REROLL BUTTON --- */}
              {selectedForReroll.length > 0 ? (
                <div className="flex gap-1.5 sm:gap-2 pt-0.5">
                  <button
                    type="button"
                    id="vtm-reroll-dice-btn"
                    onClick={handleRerollSelected}
                    className="flex-1 py-2 sm:py-2.5 font-serif font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 select-none bg-gradient-to-r from-amber-700 via-red-800 to-amber-900 hover:from-amber-600 hover:via-red-700 hover:to-amber-800 text-amber-100 shadow-lg border border-amber-500/70 active:scale-[0.98] cursor-pointer shadow-amber-950/60 text-xs sm:text-sm"
                    title="Перебросить выбранные кости за Силу Воли"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                    <span>
                      Перебросить ({selectedForReroll.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedForReroll([])}
                    className="px-2.5 sm:px-3 py-2 sm:py-2.5 font-serif text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                    title="Отменить выбор костей"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="vtm-roll-dice-btn"
                  onClick={handleRoll}
                  disabled={isRollDisabled}
                  className={`w-full py-2 sm:py-2.5 font-serif font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 select-none text-xs sm:text-sm ${
                    isRollDisabled
                      ? 'opacity-40 cursor-not-allowed bg-zinc-900 border border-zinc-800 text-zinc-500 shadow-none'
                      : 'bg-gradient-to-r from-red-900 via-red-800 to-red-950 hover:from-red-800 hover:to-red-900 text-white shadow-lg border border-red-700/60 active:scale-[0.98] cursor-pointer shadow-red-950/50'
                  }`}
                >
                  <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    {isRollDisabled
                      ? !trait1
                        ? 'Выберите 1-й ресурс на листе'
                        : 'Выберите 2-й ресурс на листе'
                      : `Бросить ${totalDice} ${formatDiceWord(totalDice)}`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Settings checkboxes strictly under the dice roller window (Collapsible) */}
          <div
            id="vtm-roller-settings-bottom-box"
            className="w-full bg-zinc-950/95 backdrop-blur-md border border-red-900/60 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-2xl text-zinc-200 hover:border-red-700/80 transition-all flex flex-col gap-1.5 shrink-0"
          >
            {/* Collapsible toggle button / header */}
            <button
              type="button"
              id="vtm-toggle-roller-settings-btn"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group py-0.5"
              title={isSettingsOpen ? 'Свернуть панель автоматизации' : 'Развернуть панель автоматизации'}
              aria-label={isSettingsOpen ? 'Свернуть панель автоматизации' : 'Развернуть панель автоматизации'}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-serif text-[11px] sm:text-xs font-semibold text-zinc-300 group-hover:text-white truncate">
                  Автоматизация бросков
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                  {Number(autoHungerOnRouse) + Number(fillWillpowerOnReroll)}/2
                </span>
              </div>
              <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-200 shrink-0">
                <span className="text-[10px] hidden xs:inline text-zinc-400">
                  {isSettingsOpen ? 'Свернуть' : 'Настроить'}
                </span>
                {isSettingsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
            </button>

            {/* Checkboxes content when expanded */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  key="roller-settings-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden flex flex-col gap-2 pt-1.5 border-t border-zinc-800/80"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoHungerOnRouse}
                      onChange={(e) => setAutoHungerOnRouse(e.target.checked)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-red-800 bg-zinc-900 text-red-600 focus:ring-red-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0 accent-red-600"
                    />
                    <span className="font-serif text-[10.5px] sm:text-[11.5px] leading-snug text-zinc-300">
                      Автоматическое увеличение Голода при неудачном Воззвании к Крови
                    </span>
                    <Droplet
                      className={`w-3.5 h-3.5 shrink-0 ml-auto transition-colors ${
                        autoHungerOnRouse ? 'text-red-500 fill-current' : 'text-zinc-600'
                      }`}
                    />
                  </label>

                  <div className="h-px bg-zinc-800/80" />

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fillWillpowerOnReroll}
                      onChange={(e) => setFillWillpowerOnReroll(e.target.checked)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-amber-800 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer shrink-0 accent-amber-600"
                    />
                    <span className="font-serif text-[10.5px] sm:text-[11.5px] leading-snug text-zinc-300">
                      Автоматическое заполнение воли при перебросе
                    </span>
                    <RotateCcw
                      className={`w-3.5 h-3.5 shrink-0 ml-auto transition-colors ${
                        fillWillpowerOnReroll ? 'text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
