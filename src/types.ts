export type ClanId =
  | 'brujah'
  | 'ventrue'
  | 'toreador'
  | 'tremere'
  | 'malkavian'
  | 'nosferatu'
  | 'gangrel'
  | 'lasombra'
  | 'tzimisce'
  | 'giovanni'
  | 'ravnos'
  | 'setite'
  | 'assamite'
  | 'salubri'
  | 'caitiff'
  | 'custom';

export interface ClanTheme {
  id: ClanId;
  name: string;
  nameEn: string;
  quote: string;
  weakness: string;
  disciplines: string[];
  accentColor: string; // Tailwind color class or hex
  accentBorder: string;
  accentBg: string;
  badgeBg: string;
  symbolUrl?: string;
  flavor: string;
  bane?: string; // Клановый изъян
  compulsion?: string; // Клановая мания
  description?: string; // Краткое описание из книги правил V5
}

export interface CustomClanEntry {
  id: string;
  name: string;
  nameEn?: string;
  quote?: string;
  description?: string;
  bane: string;
  compulsion: string;
  disciplines?: string[];
  accentColor?: string;
  createdAt?: string;
}

export interface PredatorTypeTheme {
  id: string;
  name: string;
  nameEn: string;
  quote?: string;
  description: string;
  specialization: string; // Специализация (навык и специфика)
  disciplines: string[]; // Доступные дисциплины на выбор (+1 точка)
  advantages: string; // Преимущества (достоинства)
  flaws: string; // Недостатки
  specialRules?: string; // Изменения и особые правила (человечность, сила крови, питание)
  accentColor?: string;
}

export interface CustomPredatorTypeEntry {
  id: string;
  name: string;
  nameEn?: string;
  quote?: string;
  description: string;
  specialization: string;
  disciplines: string[];
  advantages: string;
  flaws: string;
  specialRules?: string;
  accentColor?: string;
  createdAt?: string;
}

export type DamageType = 'none' | 'bashing' | 'lethal' | 'aggravated';

export interface HealthLevel {
  id: string;
  name: string;
  nameEn: string;
  penalty: number; // 0, -1, -2, -5, or 99 (Incapacitated)
  damage: DamageType;
}

export interface TraitItem {
  id: string;
  name: string;
  nameEn?: string;
  value: number;
  specialty?: string;
  isCustom?: boolean;
}

export interface DisciplineItem {
  id: string;
  name: string;
  nameEn?: string;
  dots: number;
  custom?: boolean;
  selectedPowers?: string[];
  notes?: string;
}

export interface BackgroundItem {
  id: string;
  name: string;
  nameEn?: string;
  dots: number;
  description?: string;
}

export interface MeritFlawItem {
  id: string;
  name: string;
  type: 'merit' | 'flaw';
  points: number; // 1 to 7 points
  cost?: number; // alias for points
  category: 'Физические' | 'Ментальные' | 'Социальные' | 'Сверхъестественные' | string;
  description?: string;
}

export interface ExperienceLogEntry {
  id: string;
  date: string;
  description?: string;
  reason?: string;
  amount: number; // positive for gained, negative for spent
  type?: 'gained' | 'spent';
}

export type ExperienceLogItem = ExperienceLogEntry;

export interface CharacterNotes {
  apparentAge?: string;
  dateOfBirth?: string;
  dateOfEmbrace?: string;
  appearanceDescription?: string;
  havenDescription?: string;
  equipment?: string;
  otherNotes?: string;
}

export interface V5TrackState {
  max: number;
  superficial: number;
  aggravated: number;
  boxes?: ('empty' | 'superficial' | 'aggravated')[];
}

export interface V5HumanityState {
  value: number; // 0 - 10
  stains: number; // 0 - 10
}

export interface V5SkillItem {
  id: string;
  name: string;
  nameEn: string;
  value: number;
  specialty?: string;
  category: 'physical' | 'social' | 'mental';
}

export interface V5DisciplineSlot {
  id: string;
  name: string;
  dots: number;
  powers: string[];
}

export interface V5AdvantageItem {
  id: string;
  name: string;
  dots: number;
  type?: 'advantage' | 'flaw';
  description?: string;
  custom?: boolean;
}

export interface V5BloodTraits {
  potency: number; // 0 - 10
  bloodSurge: string;
  mendAmount: string;
  powerBonus: string;
  rouseReroll: string;
  baneSeverity: number;
  feedingPenalty: string;
  clanBane: string;
  clanCompulsion: string;
}

export interface V5BioData {
  portraitUrl?: string;
  rank: string;
  totalXp: number;
  spentXp: number;
  birthDate: string;
  deathDate: string;
  trueAge: string;
  apparentAge: string;
  distinguishingFeatures: string;
  bloodBonds: string;
  appearance: string;
  history: string;
  inventory: string;
}

export interface CharacterSheet {
  id: string;
  syncCode?: string;
  lastUpdated?: string;
  updatedAt?: string;
  info: {
    name: string;
    player: string;
    chronicle: string;
    nature?: string;
    demeanor?: string;
    concept: string; // Амплуа
    clan: ClanId;
    customClanName?: string;
    generation: number; // 3 to 16, default 13
    sire: string; // Сир
    haven?: string;
    sect?: string;
    title?: string;
    appearanceDescription?: string;
    characterNotes?: string;
    // V5 specifics:
    ambition?: string; // Амбиция
    predatorType?: string; // Стиль охоты
    touchstones?: string; // Опора
    chronicleTenet?: string; // Принцип
    // Additional customizable header fields:
    occupation?: string; // Род занятий
    mask?: string; // Маска
    desire?: string; // Прихоть
    purpose?: string; // Цель
    conceptDetail?: string; // Концепция
    princeOrBaron?: string; // Принц/Барон
  };
  attributes: {
    physical: {
      strength: TraitItem;
      dexterity: TraitItem;
      stamina: TraitItem;
    };
    social: {
      charisma: TraitItem;
      manipulation: TraitItem;
      appearance?: TraitItem; // V20 legacy
      composure?: TraitItem; // V5: Самообладание
    };
    mental: {
      perception?: TraitItem; // V20 legacy
      intelligence: TraitItem;
      wits: TraitItem;
      resolve?: TraitItem; // V5: Решительность
    };
  };
  abilities: {
    talents: TraitItem[];
    skills: TraitItem[];
    knowledges: TraitItem[];
  };
  // V5 27 flat skills:
  v5Skills?: V5SkillItem[];
  // V5 tracks:
  v5Tracks?: {
    health: V5TrackState;
    willpower: V5TrackState;
    humanity: V5HumanityState;
    hunger: number; // 0 - 5
  };
  // V5 Disciplines:
  v5Disciplines?: V5DisciplineSlot[];
  // V5 Advantages & Flaws:
  v5Advantages?: V5AdvantageItem[];
  v5Merits?: V5AdvantageItem[];
  v5Flaws?: V5AdvantageItem[];
  // V5 Blood Potency & Clan info:
  v5Blood?: V5BloodTraits;
  // V5 Bio & Inventory:
  v5Bio?: V5BioData;
  // Page 4 notes:
  pageNotes?: string;
  notesPages?: string[];

  disciplines: DisciplineItem[];
  backgrounds: BackgroundItem[];
  virtues: {
    conscience: number; // 1-5 (Совесть или Убежденность)
    conscienceType: 'Совесть' | 'Убежденность';
    selfControl: number; // 1-5 (Самоконтроль или Инстинкт)
    selfControlType: 'Самоконтроль' | 'Инстинкт';
    courage: number; // 1-5 (Мужество)
  };
  humanity: {
    pathName: string; // "Человечность" or specific Path
    rating: number; // 1-10
    bearing: string; // Аура/Влияние
  };
  willpower: {
    permanent: number; // 1-10
    current: number; // 0 to permanent
  };
  bloodPool: {
    current: number;
    max: number; // calculated from generation
    perTurn: number; // calculated from generation
  };
  health: HealthLevel[];
  meritsAndFlaws: MeritFlawItem[];
  experience: {
    total: number;
    spent: number;
    unspent: number;
    logs?: ExperienceLogEntry[];
    log?: ExperienceLogEntry[];
  };
  notes: CharacterNotes;
  customTheme?: {
    customClanName?: string;
    accentColor?: string;
    quote?: string;
  };
  v5HeaderSlots?: string[];
  v5UseGraphicLogo?: boolean;
  // Relationship Map Canvas (Схема отношений):
  relationshipMap?: RelationshipMapData;
}

export type RelationshipCardType =
  | 'pc' // Персонаж игрока
  | 'npc' // Неигровой персонаж
  | 'player' // Игрок
  | 'faction' // Фракция
  | 'location'; // Место

export interface RelationshipCard {
  id: string;
  name: string;
  type: RelationshipCardType;
  clan?: ClanId | string;
  customClanName?: string;
  imageUrl?: string;
  notes?: string;
  x: number; // Положение на холсте по горизонтали (px)
  y: number; // Положение на холсте по вертикали (px)
  width?: number;
  height?: number;
}

export type RelationshipConnectionType =
  | 'sire_childe' // Сир-дитя
  | 'blood_bond' // Узы крови
  | 'liege_vassal' // Сюзерен-вассал
  | 'ally' // Союзник
  | 'enemy' // Враг
  | 'rival' // Соперник
  | 'love' // Любовь
  | 'enmity' // Вражда
  | 'debt' // Долг
  | 'touchstone' // Опора
  | 'relative' // Родственник
  | 'other'; // Прочее

export type ConnectionSide = 'top' | 'right' | 'bottom' | 'left';

export interface RelationshipConnection {
  id: string;
  fromId: string;
  toId: string;
  type: RelationshipConnectionType;
  fromSide?: ConnectionSide;
  toSide?: ConnectionSide;
  customLabel?: string;
  isBidirectional?: boolean;
}

export interface RelationshipMapData {
  cards: RelationshipCard[];
  connections: RelationshipConnection[];
}

export interface DiceRollResult {
  dicePool: number;
  difficulty: number;
  rolls: number[];
  regularRolls?: number[];
  hungerRolls?: number[];
  hungerDiceCount?: number;
  successes: number;
  botch: boolean; // Bestial failure in V5 or Botch in V20
  isSuccess: boolean;
  critSuccess: boolean;
  isMessyCritical?: boolean;
  isBestialFailure?: boolean;
  rolledAt: string;
  actionName: string;
  willpowerSpent: boolean;
  bloodBuffed: boolean;
}
