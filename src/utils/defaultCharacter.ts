import { CharacterSheet, V5SkillItem, V5DisciplineSlot, V5AdvantageItem } from '../types';
import { getGenerationInfo } from './calculations';
import { DEFAULT_HEADER_SLOTS } from '../components/HeaderSettingsModal';
import { CLAN_THEMES } from '../data/clans';
import { generateV5Character, V5GeneratorOptions } from './v5CharacterGenerator';

export const INITIAL_V5_SKILLS: V5SkillItem[] = [
  // Physical (9)
  { id: 'ath', name: 'Атлетика', nameEn: 'Athletics', value: 2, category: 'physical' },
  { id: 'drive', name: 'Вождение', nameEn: 'Drive', value: 2, category: 'physical' },
  { id: 'larceny', name: 'Воровство', nameEn: 'Larceny', value: 1, category: 'physical' },
  { id: 'survival', name: 'Выживание', nameEn: 'Survival', value: 1, category: 'physical' },
  { id: 'brawl', name: 'Драка', nameEn: 'Brawl', value: 3, specialty: 'Захваты', category: 'physical' },
  { id: 'craft', name: 'Ремесло', nameEn: 'Craft', value: 1, category: 'physical' },
  { id: 'stealth', name: 'Скрытность', nameEn: 'Stealth', value: 1, category: 'physical' },
  { id: 'firearms', name: 'Стрельба', nameEn: 'Firearms', value: 2, specialty: 'Пистолеты', category: 'physical' },
  { id: 'melee', name: 'Фехтование', nameEn: 'Melee', value: 1, category: 'physical' },

  // Social (9)
  { id: 'intimidation', name: 'Запугивание', nameEn: 'Intimidation', value: 2, category: 'social' },
  { id: 'performance', name: 'Исполнение', nameEn: 'Performance', value: 0, category: 'social' },
  { id: 'leadership', name: 'Лидерство', nameEn: 'Leadership', value: 1, category: 'social' },
  { id: 'animalKen', name: 'Обр. с животными', nameEn: 'Animal Ken', value: 0, category: 'social' },
  { id: 'insight', name: 'Проницательность', nameEn: 'Insight', value: 2, category: 'social' },
  { id: 'persuasion', name: 'Убеждение', nameEn: 'Persuasion', value: 1, category: 'social' },
  { id: 'streetwise', name: 'Уличное чутьё', nameEn: 'Streetwise', value: 2, category: 'social' },
  { id: 'subterfuge', name: 'Хитрость', nameEn: 'Subterfuge', value: 1, category: 'social' },
  { id: 'etiquette', name: 'Этикет', nameEn: 'Etiquette', value: 0, category: 'social' },

  // Mental (9)
  { id: 'academics', name: 'Гуманитарные науки', nameEn: 'Academics', value: 0, category: 'mental' },
  { id: 'science', name: 'Естественные науки', nameEn: 'Science', value: 0, category: 'mental' },
  { id: 'medicine', name: 'Медицина', nameEn: 'Medicine', value: 1, category: 'mental' },
  { id: 'awareness', name: 'Наблюдательность', nameEn: 'Awareness', value: 2, category: 'mental' },
  { id: 'occult', name: 'Оккультизм', nameEn: 'Occult', value: 1, category: 'mental' },
  { id: 'politics', name: 'Политика', nameEn: 'Politics', value: 1, category: 'mental' },
  { id: 'investigation', name: 'Расследование', nameEn: 'Investigation', value: 3, specialty: 'Место преступления', category: 'mental' },
  { id: 'technology', name: 'Техника', nameEn: 'Technology', value: 1, category: 'mental' },
  { id: 'finance', name: 'Финансы', nameEn: 'Finance', value: 0, category: 'mental' },
];

export const INITIAL_V5_DISCIPLINES: V5DisciplineSlot[] = [
  { id: 'd1', name: 'Мощь (Potence)', dots: 2, powers: ['Сокрушительный удар', 'Хватка титана', '', '', ''] },
  { id: 'd2', name: 'Стремительность (Celerity)', dots: 1, powers: ['Кошачья грация', '', '', '', ''] },
  { id: 'd3', name: 'Присутствие (Presence)', dots: 0, powers: ['', '', '', '', ''] },
  { id: 'd4', name: 'Стойкость (Fortitude)', dots: 0, powers: ['', '', '', '', ''] },
  { id: 'd5', name: '', dots: 0, powers: ['', '', '', '', ''] },
  { id: 'd6', name: '', dots: 0, powers: ['', '', '', '', ''] },
];

export const INITIAL_V5_ADVANTAGES: V5AdvantageItem[] = [
  { id: 'a1', name: 'Связи: Детективы полиции', dots: 2 },
  { id: 'a2', name: 'Убежище: Укрепленный склад', dots: 2 },
  { id: 'a3', name: 'Ресурсы: Наличные и сбережения', dots: 1 },
  { id: 'a4', name: 'Железная воля', dots: 2 },
  { id: 'a5', name: 'Враг: Коррумпированный инспектор', dots: 2, type: 'flaw' },
  { id: 'a6', name: 'Вспыльчивость', dots: 1, type: 'flaw' },
  { id: 'a7', name: '', dots: 0 },
  { id: 'a8', name: '', dots: 0 },
  { id: 'a9', name: '', dots: 0 },
  { id: 'a10', name: '', dots: 0 },
  { id: 'a11', name: '', dots: 0 },
  { id: 'a12', name: '', dots: 0 },
  { id: 'a13', name: '', dots: 0 },
  { id: 'a14', name: '', dots: 0 },
  { id: 'a15', name: '', dots: 0 },
  { id: 'a16', name: '', dots: 0 },
  { id: 'a17', name: '', dots: 0 },
  { id: 'a18', name: '', dots: 0 },
];

export const INITIAL_V5_MERITS: V5AdvantageItem[] = [
  { id: 'm1', name: 'Связи: Детективы полиции', dots: 2, type: 'advantage' },
  { id: 'm2', name: 'Убежище: Укрепленный склад', dots: 2, type: 'advantage' },
  { id: 'm3', name: 'Ресурсы: Наличные и сбережения', dots: 1, type: 'advantage' },
  { id: 'm4', name: 'Железная воля', dots: 2, type: 'advantage' },
  { id: 'm5', name: '', dots: 0, type: 'advantage' },
  { id: 'm6', name: '', dots: 0, type: 'advantage' },
  { id: 'm7', name: '', dots: 0, type: 'advantage' },
  { id: 'm8', name: '', dots: 0, type: 'advantage' },
  { id: 'm9', name: '', dots: 0, type: 'advantage' },
  { id: 'm10', name: '', dots: 0, type: 'advantage' },
  { id: 'm11', name: '', dots: 0, type: 'advantage' },
  { id: 'm12', name: '', dots: 0, type: 'advantage' },
  { id: 'm13', name: '', dots: 0, type: 'advantage' },
  { id: 'm14', name: '', dots: 0, type: 'advantage' },
];

export const INITIAL_V5_FLAWS: V5AdvantageItem[] = [
  { id: 'f1', name: 'Враг: Коррумпированный инспектор', dots: 2, type: 'flaw' },
  { id: 'f2', name: 'Вспыльчивость', dots: 1, type: 'flaw' },
  { id: 'f3', name: '', dots: 0, type: 'flaw' },
  { id: 'f4', name: '', dots: 0, type: 'flaw' },
  { id: 'f5', name: '', dots: 0, type: 'flaw' },
  { id: 'f6', name: '', dots: 0, type: 'flaw' },
  { id: 'f7', name: '', dots: 0, type: 'flaw' },
  { id: 'f8', name: '', dots: 0, type: 'flaw' },
  { id: 'f9', name: '', dots: 0, type: 'flaw' },
  { id: 'f10', name: '', dots: 0, type: 'flaw' },
  { id: 'f11', name: '', dots: 0, type: 'flaw' },
  { id: 'f12', name: '', dots: 0, type: 'flaw' },
  { id: 'f13', name: '', dots: 0, type: 'flaw' },
  { id: 'f14', name: '', dots: 0, type: 'flaw' },
];

export const createInitialCharacter = (syncCode: string = 'LOCAL', options?: V5GeneratorOptions): CharacterSheet => {
  const character = generateV5Character(options);
  character.syncCode = syncCode;
  return character;
};

export const createBlankCharacterSheet = (syncCode: string = 'LOCAL'): CharacterSheet => {
  return {
    id: `vtm-${Date.now()}`,
    syncCode,
    updatedAt: new Date().toISOString(),
    info: {
      name: '',
      player: '',
      chronicle: '',
      concept: '',
      conceptDetail: '',
      clan: 'caitiff',
      generation: 13,
      sire: '',
      ambition: '',
      purpose: '',
      desire: '',
      predatorType: '',
      touchstones: '',
      chronicleTenet: '',
      haven: '',
      sect: '',
      title: '',
    },
    attributes: {
      physical: {
        strength: { id: 'str', name: 'Сила', nameEn: 'Strength', value: 1 },
        dexterity: { id: 'dex', name: 'Ловкость', nameEn: 'Dexterity', value: 1 },
        stamina: { id: 'sta', name: 'Выносливость', nameEn: 'Stamina', value: 1 },
      },
      social: {
        charisma: { id: 'cha', name: 'Харизма', nameEn: 'Charisma', value: 1 },
        manipulation: { id: 'man', name: 'Манипуляция', nameEn: 'Manipulation', value: 1 },
        appearance: { id: 'app', name: 'Внешность', nameEn: 'Appearance', value: 1 },
        composure: { id: 'com', name: 'Самообладание', nameEn: 'Composure', value: 1 },
      },
      mental: {
        perception: { id: 'per', name: 'Восприятие', nameEn: 'Perception', value: 1 },
        intelligence: { id: 'int', name: 'Интеллект', nameEn: 'Intelligence', value: 1 },
        wits: { id: 'wit', name: 'Смекалка', nameEn: 'Wits', value: 1 },
        resolve: { id: 'res', name: 'Решительность', nameEn: 'Resolve', value: 1 },
      },
    },
    v5Skills: INITIAL_V5_SKILLS.map((s) => ({
      ...s,
      value: 0,
      specialty: undefined,
    })),
    v5Tracks: {
      health: { max: 4, superficial: 0, aggravated: 0 },
      willpower: { max: 2, superficial: 0, aggravated: 0 },
      humanity: { value: 7, stains: 0 },
      hunger: 1,
    },
    v5Disciplines: Array.from({ length: 6 }, (_, i) => ({
      id: `d${i + 1}`,
      name: '',
      dots: 0,
      powers: ['', '', '', '', ''],
    })),
    v5Advantages: Array.from({ length: 18 }, (_, i) => ({
      id: `a${i + 1}`,
      name: '',
      dots: 0,
    })),
    v5Merits: Array.from({ length: 14 }, (_, i) => ({
      id: `m${i + 1}`,
      name: '',
      dots: 0,
      type: 'advantage',
    })),
    v5Flaws: Array.from({ length: 14 }, (_, i) => ({
      id: `f${i + 1}`,
      name: '',
      dots: 0,
      type: 'flaw',
    })),
    v5Blood: {
      potency: 1,
      bloodSurge: '+1 кубик',
      mendAmount: '1 поверхностный',
      powerBonus: 'Нет',
      rouseReroll: '1-й уровень',
      baneSeverity: 2,
      feedingPenalty: 'Нет ограничений',
      clanBane: '',
      clanCompulsion: '',
    },
    v5Bio: {
      portraitUrl: '',
      rank: '',
      totalXp: 0,
      spentXp: 0,
      birthDate: '',
      deathDate: '',
      trueAge: '',
      apparentAge: '',
      distinguishingFeatures: '',
      bloodBonds: '',
      appearance: '',
      history: '',
      inventory: '',
    },
    pageNotes: '',
    abilities: {
      talents: [],
      skills: [],
      knowledges: [],
    },
    disciplines: [],
    backgrounds: [],
    virtues: {
      conscience: 1,
      conscienceType: 'Совесть',
      selfControl: 1,
      selfControlType: 'Самоконтроль',
      courage: 1,
    },
    humanity: {
      rating: 7,
      pathName: 'Человечность (Humanity)',
      bearing: 'Нормальность (Штраф 0)',
    },
    willpower: {
      permanent: 2,
      current: 2,
    },
    bloodPool: {
      current: 10,
      max: 10,
      perTurn: 1,
    },
    health: [
      { id: 'bruised', name: 'Синяки', nameEn: 'Bruised', penalty: 0, damage: 'none' },
      { id: 'hurt', name: 'Ушибы', nameEn: 'Hurt', penalty: -1, damage: 'none' },
      { id: 'injured', name: 'Травмы', nameEn: 'Injured', penalty: -1, damage: 'none' },
      { id: 'wounded', name: 'Ранения', nameEn: 'Wounded', penalty: -2, damage: 'none' },
      { id: 'mauled', name: 'Тяжкие раны', nameEn: 'Mauled', penalty: -2, damage: 'none' },
      { id: 'crippled', name: 'Увечья', nameEn: 'Crippled', penalty: -5, damage: 'none' },
      { id: 'incapacitated', name: 'Обездвижен', nameEn: 'Incapacitated', penalty: 99, damage: 'none' },
    ],
    meritsAndFlaws: [],
    experience: {
      total: 0,
      spent: 0,
      unspent: 0,
      log: [],
    },
    notes: {
      apparentAge: '',
      dateOfBirth: '',
      dateOfEmbrace: '',
      appearanceDescription: '',
      havenDescription: '',
      equipment: '',
      otherNotes: '',
    },
    v5HeaderSlots: [...DEFAULT_HEADER_SLOTS],
  };
};


