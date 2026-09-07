import { CharacterSheet, DamageType, DiceRollResult, HealthLevel } from '../types';

export interface GenerationInfo {
  generation: number;
  maxTrait: number;
  maxBlood: number;
  bloodPerTurn: number;
}

export interface BloodPotencyInfo {
  potency: number;
  bloodSurge: string;
  mendAmount: string;
  powerBonus: string;
  rouseReroll: string;
  baneSeverity: number;
  feedingPenalty: string;
}

export const V5_BLOOD_POTENCY_TABLE: Record<number, BloodPotencyInfo> = {
  0: {
    potency: 0,
    bloodSurge: 'Нет',
    mendAmount: '1 поверхностный',
    powerBonus: 'Нет',
    rouseReroll: 'Нет',
    baneSeverity: 0,
    feedingPenalty: 'Нет ограничений',
  },
  1: {
    potency: 1,
    bloodSurge: '+1 кубик',
    mendAmount: '1 поверхностный',
    powerBonus: 'Нет',
    rouseReroll: '1-й уровень',
    baneSeverity: 2,
    feedingPenalty: 'Нет ограничений',
  },
  2: {
    potency: 2,
    bloodSurge: '+2 кубика',
    mendAmount: '2 поверхностных',
    powerBonus: '+1 кубик',
    rouseReroll: '1-й уровень',
    baneSeverity: 2,
    feedingPenalty: 'Животные и пакетированная кровь утоляют половину Голода',
  },
  3: {
    potency: 3,
    bloodSurge: '+2 кубика',
    mendAmount: '2 поверхностных',
    powerBonus: '+1 кубик',
    rouseReroll: '1 и 2 уровни',
    baneSeverity: 3,
    feedingPenalty: 'Животные и консервы не утоляют Голод',
  },
  4: {
    potency: 4,
    bloodSurge: '+3 кубика',
    mendAmount: '3 поверхностных',
    powerBonus: '+2 кубика',
    rouseReroll: '1 и 2 уровни',
    baneSeverity: 3,
    feedingPenalty: 'Не утоляет от животных/консервов; -1 к утолению от людей',
  },
  5: {
    potency: 5,
    bloodSurge: '+3 кубика',
    mendAmount: '3 поверхностных',
    powerBonus: '+2 кубика',
    rouseReroll: '1, 2 и 3 уровни',
    baneSeverity: 4,
    feedingPenalty: 'Питание только от людей; утоляет только до Голода 2',
  },
  6: {
    potency: 6,
    bloodSurge: '+3 кубика',
    mendAmount: '3 поверхностных',
    powerBonus: '+3 кубика',
    rouseReroll: '1, 2 и 3 уровни',
    baneSeverity: 4,
    feedingPenalty: 'Утоляет только до Голода 2; требует убийства жертвы',
  },
  7: {
    potency: 7,
    bloodSurge: '+4 кубика',
    mendAmount: '3 поверхностных',
    powerBonus: '+3 кубика',
    rouseReroll: '1, 2, 3 и 4 уровни',
    baneSeverity: 5,
    feedingPenalty: 'Утоляет только до Голода 2; требует убийства смертного',
  },
  8: {
    potency: 8,
    bloodSurge: '+4 кубика',
    mendAmount: '4 поверхностных',
    powerBonus: '+4 кубика',
    rouseReroll: '1, 2, 3 и 4 уровни',
    baneSeverity: 5,
    feedingPenalty: 'Утоляет только до Голода 3; только убийство или сверхъестественные существа',
  },
  9: {
    potency: 9,
    bloodSurge: '+5 кубиков',
    mendAmount: '4 поверхностных',
    powerBonus: '+4 кубика',
    rouseReroll: '1, 2, 3, 4 и 5 уровни',
    baneSeverity: 6,
    feedingPenalty: 'Утоляет только до Голода 3; только сородичи или сверхъестественные существа',
  },
  10: {
    potency: 10,
    bloodSurge: '+5 кубиков',
    mendAmount: '5 поверхностных',
    powerBonus: '+5 кубиков',
    rouseReroll: 'Все уровни',
    baneSeverity: 6,
    feedingPenalty: 'Только кровь других вампиров (диаблери/витэ сородичей)',
  },
};

export function getBloodPotencyInfo(potency: number): BloodPotencyInfo {
  const p = Math.max(0, Math.min(10, potency));
  return (
    V5_BLOOD_POTENCY_TABLE[p] || {
      potency: p,
      bloodSurge: 'Нет',
      mendAmount: '1 поверхностный',
      powerBonus: 'Нет',
      rouseReroll: 'Нет',
      baneSeverity: 1,
      feedingPenalty: 'Нет ограничений',
    }
  );
}

/**
 * V5 specific dice roller with Hunger dice, Messy Critical and Bestial Failure
 */
export function rollV5Dice(
  pool: number,
  hunger = 0,
  difficulty = 1,
  actionName = 'Проверка V5',
  willpowerSpent = false,
  bloodBuffed = false,
): DiceRollResult {
  const totalDice = Math.max(1, pool);
  const actualHungerDice = Math.max(0, Math.min(hunger, totalDice));
  const regularDiceCount = totalDice - actualHungerDice;

  const regularRolls: number[] = [];
  const hungerRolls: number[] = [];

  for (let i = 0; i < regularDiceCount; i++) {
    regularRolls.push(Math.floor(Math.random() * 10) + 1);
  }
  for (let i = 0; i < actualHungerDice; i++) {
    hungerRolls.push(Math.floor(Math.random() * 10) + 1);
  }

  regularRolls.sort((a, b) => b - a);
  hungerRolls.sort((a, b) => b - a);

  const allRolls = [...regularRolls, ...hungerRolls];

  // Count tens and successes (6-10 is success in V5)
  let regSuccesses = 0;
  let regTens = 0;
  for (const r of regularRolls) {
    if (r >= 6) regSuccesses++;
    if (r === 10) regTens++;
  }

  let hungerSuccesses = 0;
  let hungerTens = 0;
  let hungerOnes = 0;
  for (const h of hungerRolls) {
    if (h >= 6) hungerSuccesses++;
    if (h === 10) hungerTens++;
    if (h === 1) hungerOnes++;
  }

  const totalTens = regTens + hungerTens;
  const criticalPairs = Math.floor(totalTens / 2);
  const bonusFromCrits = criticalPairs * 2; // Each pair gives +2 bonus successes (total 4)

  const totalSuccesses = regSuccesses + hungerSuccesses + bonusFromCrits;
  const isSuccess = totalSuccesses >= difficulty;

  // In V5:
  // - Critical Success: At least one pair of 10s.
  // - Messy Critical: At least one pair of 10s AND at least one 10 is on a Hunger die.
  // - Bestial Failure: isSuccess is false AND at least one 1 is rolled on a Hunger die.
  const hasCrit = criticalPairs > 0;
  const isMessyCritical = isSuccess && hasCrit && hungerTens > 0;
  const isBestialFailure = !isSuccess && hungerOnes > 0;
  const regularCritical = isSuccess && hasCrit && !isMessyCritical;

  return {
    dicePool: totalDice,
    difficulty,
    rolls: allRolls,
    regularRolls,
    hungerRolls,
    hungerDiceCount: actualHungerDice,
    successes: totalSuccesses,
    botch: isBestialFailure,
    isSuccess,
    critSuccess: hasCrit,
    isMessyCritical,
    isBestialFailure,
    rolledAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    actionName,
    willpowerSpent,
    bloodBuffed,
  };
}

export const GENERATION_TABLE: Record<number, GenerationInfo> = {
  15: { generation: 15, maxTrait: 4, maxBlood: 10, bloodPerTurn: 1 },
  14: { generation: 14, maxTrait: 4, maxBlood: 10, bloodPerTurn: 1 },
  13: { generation: 13, maxTrait: 5, maxBlood: 10, bloodPerTurn: 1 },
  12: { generation: 12, maxTrait: 5, maxBlood: 11, bloodPerTurn: 1 },
  11: { generation: 11, maxTrait: 5, maxBlood: 12, bloodPerTurn: 1 },
  10: { generation: 10, maxTrait: 5, maxBlood: 13, bloodPerTurn: 1 },
  9: { generation: 9, maxTrait: 5, maxBlood: 14, bloodPerTurn: 2 },
  8: { generation: 8, maxTrait: 5, maxBlood: 15, bloodPerTurn: 3 },
  7: { generation: 7, maxTrait: 6, maxBlood: 20, bloodPerTurn: 4 },
  6: { generation: 6, maxTrait: 7, maxBlood: 30, bloodPerTurn: 6 },
  5: { generation: 5, maxTrait: 8, maxBlood: 40, bloodPerTurn: 8 },
  4: { generation: 4, maxTrait: 9, maxBlood: 50, bloodPerTurn: 10 },
  3: { generation: 3, maxTrait: 10, maxBlood: 100, bloodPerTurn: 20 },
};

export function getGenerationInfo(generation: number): GenerationInfo {
  return GENERATION_TABLE[generation] || {
    generation,
    maxTrait: 5,
    maxBlood: 10,
    bloodPerTurn: 1,
  };
}

export const DEFAULT_HEALTH_LEVELS: HealthLevel[] = [
  { id: 'bruised', name: 'Ушиб', nameEn: 'Bruised', penalty: 0, damage: 'none' },
  { id: 'hurt', name: 'Рана', nameEn: 'Hurt', penalty: -1, damage: 'none' },
  { id: 'injured', name: 'Травма', nameEn: 'Injured', penalty: -1, damage: 'none' },
  { id: 'wounded', name: 'Ранение', nameEn: 'Wounded', penalty: -2, damage: 'none' },
  { id: 'mauled', name: 'Увечье', nameEn: 'Mauled', penalty: -2, damage: 'none' },
  { id: 'crippled', name: 'Обездвижен', nameEn: 'Crippled', penalty: -5, damage: 'none' },
  { id: 'incapacitated', name: 'Недееспособен', nameEn: 'Incapacitated', penalty: 99, damage: 'none' },
];

/**
 * Calculates current active health penalty from damaged levels
 */
export function getCurrentHealthPenalty(health: HealthLevel[]): { penalty: number; label: string; isIncapacitated: boolean } {
  let activePenalty = 0;
  let activeLabel = 'Здоров (Штраф 0)';
  let isIncapacitated = false;

  for (let i = health.length - 1; i >= 0; i--) {
    if (health[i].damage !== 'none') {
      const lvl = health[i];
      if (lvl.penalty === 99) {
        return { penalty: 99, label: 'Недееспособен (Действия невозможны)', isIncapacitated: true };
      }
      activePenalty = lvl.penalty;
      activeLabel = `${lvl.name} (Штраф к броскам: ${lvl.penalty})`;
      break;
    }
  }

  return { penalty: activePenalty, label: activeLabel, isIncapacitated };
}

/**
 * Cycle damage on a health box: none -> bashing -> lethal -> aggravated -> none
 */
export function cycleDamage(current: DamageType): DamageType {
  switch (current) {
    case 'none':
      return 'bashing';
    case 'bashing':
      return 'lethal';
    case 'lethal':
      return 'aggravated';
    case 'aggravated':
      return 'none';
  }
}

/**
 * Core dice roller for VTM rules
 */
export function rollVtMDice(
  dicePool: number,
  difficulty = 6,
  actionName = 'Бросок кубиков',
  willpowerSpent = false,
  bloodBuffed = false,
): DiceRollResult {
  const finalPool = Math.max(1, dicePool);
  const rolls: number[] = [];

  for (let i = 0; i < finalPool; i++) {
    rolls.push(Math.floor(Math.random() * 10) + 1);
  }

  rolls.sort((a, b) => b - a);

  let rawSuccesses = 0;
  let onesCount = 0;

  for (const r of rolls) {
    if (r >= difficulty) {
      rawSuccesses++;
    } else if (r === 1) {
      onesCount++;
    }
  }

  let finalSuccesses = rawSuccesses - onesCount;
  if (willpowerSpent) {
    finalSuccesses = Math.max(0, finalSuccesses) + 1;
  }

  const botch = rawSuccesses === 0 && onesCount > 0 && !willpowerSpent;
  const isSuccess = finalSuccesses > 0;
  const critSuccess = finalSuccesses >= 5;

  return {
    dicePool: finalPool,
    difficulty,
    rolls,
    successes: botch ? -1 : Math.max(0, finalSuccesses),
    botch,
    isSuccess,
    critSuccess,
    rolledAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    actionName,
    willpowerSpent,
    bloodBuffed,
  };
}

/**
 * Creates a complete fresh character sheet
 */
export function createInitialCharacter(): CharacterSheet {
  const genInfo = getGenerationInfo(13);

  return {
    id: `char_${Date.now()}`,
    syncCode: '',
    lastUpdated: new Date().toISOString(),
    info: {
      name: 'Маркус Вейн',
      player: 'Игрок',
      chronicle: 'Ночной Петербург: Осколки Маскарада',
      nature: 'Бунтарь',
      demeanor: 'Одиночка',
      concept: 'Ночной детектив / Бунтарь улиц',
      clan: 'brujah',
      generation: 13,
      sire: 'Элиас Кроу',
      haven: 'Заброшенный чердак у Невы',
      sect: 'Анархи',
      title: 'Неонат',
      appearanceDescription: 'Высокий, в потертой кожаной куртке, с тяжелым взглядом и следами уличных схваток.',
      characterNotes: 'Ищет правду о пропаже своего сира. Не доверяет старейшинам Камарильи.',
    },
    attributes: {
      physical: {
        strength: { id: 'str', name: 'Сила', nameEn: 'Strength', value: 3, specialty: 'Сокрушительный удар' },
        dexterity: { id: 'dex', name: 'Ловкость', nameEn: 'Dexterity', value: 3, specialty: 'Быстрая реакция' },
        stamina: { id: 'sta', name: 'Выносливость', nameEn: 'Stamina', value: 2 },
      },
      social: {
        charisma: { id: 'cha', name: 'Обаяние', nameEn: 'Charisma', value: 2 },
        manipulation: { id: 'man', name: 'Манипулирование', nameEn: 'Manipulation', value: 2 },
        appearance: { id: 'app', name: 'Внешность', nameEn: 'Appearance', value: 2 },
      },
      mental: {
        perception: { id: 'per', name: 'Восприятие', nameEn: 'Perception', value: 3, specialty: 'Поиск засад' },
        intelligence: { id: 'int', name: 'Интеллект', nameEn: 'Intelligence', value: 2 },
        wits: { id: 'wit', name: 'Смекалка', nameEn: 'Wits', value: 3, specialty: 'Тактическое мышление' },
      },
    },
    abilities: {
      talents: [
        { id: 'alertness', name: 'Бдительность', nameEn: 'Alertness', value: 3, specialty: 'Слух' },
        { id: 'athletics', name: 'Атлетика', nameEn: 'Athletics', value: 2 },
        { id: 'brawl', name: 'Драка', nameEn: 'Brawl', value: 3, specialty: 'Грязный бокс' },
        { id: 'dodge', name: 'Уклонение', nameEn: 'Dodge', value: 2 },
        { id: 'empathy', name: 'Эмпатия', nameEn: 'Empathy', value: 1 },
        { id: 'expression', name: 'Экспрессия', nameEn: 'Expression', value: 0 },
        { id: 'intimidation', name: 'Запугивание', nameEn: 'Intimidation', value: 3 },
        { id: 'leadership', name: 'Лидерство', nameEn: 'Leadership', value: 1 },
        { id: 'streetwise', name: 'Знание улиц', nameEn: 'Streetwise', value: 3, specialty: 'Банды' },
        { id: 'subterfuge', name: 'Хитрость', nameEn: 'Subterfuge', value: 2 },
      ],
      skills: [
        { id: 'animal_ken', name: 'Знание животных', nameEn: 'Animal Ken', value: 0 },
        { id: 'crafts', name: 'Ремесло', nameEn: 'Crafts', value: 1 },
        { id: 'drive', name: 'Вождение', nameEn: 'Drive', value: 2 },
        { id: 'etiquette', name: 'Этикет', nameEn: 'Etiquette', value: 1 },
        { id: 'firearms', name: 'Огнестрельное оружие', nameEn: 'Firearms', value: 2 },
        { id: 'melee', name: 'Холодное оружие', nameEn: 'Melee', value: 2 },
        { id: 'performance', name: 'Исполнение', nameEn: 'Performance', value: 0 },
        { id: 'security', name: 'Безопасность', nameEn: 'Security', value: 2 },
        { id: 'stealth', name: 'Скрытность', nameEn: 'Stealth', value: 2 },
        { id: 'survival', name: 'Выживание', nameEn: 'Survival', value: 1 },
      ],
      knowledges: [
        { id: 'academics', name: 'Академические знания', nameEn: 'Academics', value: 1 },
        { id: 'computer', name: 'Компьютеры', nameEn: 'Computer', value: 1 },
        { id: 'finance', name: 'Финансы', nameEn: 'Finance', value: 1 },
        { id: 'investigation', name: 'Расследование', nameEn: 'Investigation', value: 3, specialty: 'Осмотр улик' },
        { id: 'law', name: 'Юриспруденция', nameEn: 'Law', value: 1 },
        { id: 'medicine', name: 'Медицина', nameEn: 'Medicine', value: 1 },
        { id: 'occult', name: 'Оккультизм', nameEn: 'Occult', value: 2 },
        { id: 'politics', name: 'Политика', nameEn: 'Politics', value: 1 },
        { id: 'science', name: 'Естественные науки', nameEn: 'Science', value: 0 },
        { id: 'technology', name: 'Технологии', nameEn: 'Technology', value: 1 },
      ],
    },
    disciplines: [
      { id: 'disc_potence', name: 'Могущество (Potence)', dots: 2, notes: 'Сокрушительная хватка, Стальные мускулы' },
      { id: 'disc_celerity', name: 'Стремительность (Celerity)', dots: 2, notes: 'Кошачья грация, Молниеносный рывок' },
      { id: 'disc_presence', name: 'Присутствие (Presence)', dots: 1, notes: 'Благоговение' },
    ],
    backgrounds: [
      { id: 'bg_contacts', name: 'Контакты (Contacts)', dots: 3, description: 'Связи среди криминальных авторитетов и портовых рабочих' },
      { id: 'bg_resources', name: 'Ресурсы (Resources)', dots: 2, description: 'Накопления с частных детективных расследований' },
      { id: 'bg_generation', name: 'Поколение (Generation)', dots: 0, description: '13-е поколение' },
      { id: 'bg_allies', name: 'Союзники (Allies)', dots: 2, description: 'Детектив из убойного отдела смертных' },
    ],
    virtues: {
      conscience: 3,
      conscienceType: 'Совесть',
      selfControl: 3,
      selfControlType: 'Самоконтроль',
      courage: 4,
    },
    humanity: {
      pathName: 'Человечность',
      rating: 6,
      bearing: 'Нормальность (Штраф 0)',
    },
    willpower: {
      permanent: 7,
      current: 7,
    },
    bloodPool: {
      current: 9,
      max: genInfo.maxBlood,
      perTurn: genInfo.bloodPerTurn,
    },
    health: [...DEFAULT_HEALTH_LEVELS],
    meritsAndFlaws: [
      {
        id: 'mf_acute_hearing',
        name: 'Острый слух (Acute Senses)',
        type: 'merit',
        points: 1,
        category: 'Физические',
        description: '+2 кубика на восприятие на слух в темноте и тишине.',
      },
      {
        id: 'mf_iron_will',
        name: 'Железная воля (Iron Will)',
        type: 'merit',
        points: 3,
        category: 'Ментальные',
        description: '+3 кубика против Доминирования и телепатических внушений.',
      },
      {
        id: 'mf_short_fuse',
        name: 'Вспыльчивый (Short Fuse)',
        type: 'flaw',
        points: 2,
        category: 'Ментальные',
        description: 'Сложность сопротивления ярости увеличена на 2 (суммируется с клановой слабостью Бруха!).',
      },
    ],
    experience: {
      total: 25,
      spent: 17,
      unspent: 8,
      logs: [
        { id: 'xp_1', date: '2026-08-20', description: 'Стартовый опыт неоната', amount: 15 },
        { id: 'xp_2', date: '2026-08-27', description: 'Завершение расследования в порту', amount: 10 },
        { id: 'xp_3', date: '2026-08-28', description: 'Повышение Стремительности до 2', amount: -10 },
        { id: 'xp_4', date: '2026-09-01', description: 'Повышение Бдительности до 3', amount: -7 },
      ],
    },
    notes: {
      apparentAge: '28 лет',
      dateOfBirth: '1965 г.',
      dateOfEmbrace: '1993 г.',
      appearanceDescription: 'Высокий, в потертой кожаной куртке, с тяжелым взглядом и следами уличных схваток.',
      havenDescription: 'Заброшенный чердак у Невы с бронированной дверью.',
      equipment: 'Пистолет, складной нож, портативная рация, отмычки.',
      otherNotes: 'Ищет правду о пропаже своего сира. Не доверяет старейшинам Камарильи.',
    },
  };
}

/**
 * Generate a 6-character memorable sync code e.g. VTM-4K9Q
 */
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'VTM-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates creation dots distribution
 */
export function calculateCreationDots(sheet: CharacterSheet) {
  // Attributes: base 1 each, so dots spent = value - 1
  const physDots = (sheet.attributes.physical.strength.value - 1) +
    (sheet.attributes.physical.dexterity.value - 1) +
    (sheet.attributes.physical.stamina.value - 1);

  const socDots = (sheet.attributes.social.charisma.value - 1) +
    (sheet.attributes.social.manipulation.value - 1) +
    (sheet.attributes.social.appearance.value - 1);

  const menDots = (sheet.attributes.mental.perception.value - 1) +
    (sheet.attributes.mental.intelligence.value - 1) +
    (sheet.attributes.mental.wits.value - 1);

  // Abilities
  const talentDots = sheet.abilities.talents.reduce((acc, curr) => acc + curr.value, 0);
  const skillDots = sheet.abilities.skills.reduce((acc, curr) => acc + curr.value, 0);
  const knowDots = sheet.abilities.knowledges.reduce((acc, curr) => acc + curr.value, 0);

  // Disciplines
  const discDots = sheet.disciplines.reduce((acc, curr) => acc + curr.dots, 0);

  // Backgrounds
  const bgDots = sheet.backgrounds.reduce((acc, curr) => acc + curr.dots, 0);

  // Virtues: base 1 each, so minus 3
  const virtueDots = (sheet.virtues.conscience - 1) + (sheet.virtues.selfControl - 1) + (sheet.virtues.courage - 1);

  // Merits & Flaws points sum
  const list = sheet.meritsAndFlaws || [];
  const meritPoints = list.filter(m => m.type === 'merit').reduce((acc, curr) => acc + (curr.points || curr.cost || 0), 0);
  const flawPoints = list.filter(m => m.type === 'flaw').reduce((acc, curr) => acc + (curr.points || curr.cost || 0), 0);

  return {
    attributes: { physical: physDots, social: socDots, mental: menDots, total: physDots + socDots + menDots },
    abilities: { talents: talentDots, skills: skillDots, knowledges: knowDots, total: talentDots + skillDots + knowDots },
    disciplines: discDots,
    backgrounds: bgDots,
    virtues: virtueDots,
    merits: meritPoints,
    flaws: flawPoints,
    flawBalance: flawPoints - meritPoints,
  };
}

