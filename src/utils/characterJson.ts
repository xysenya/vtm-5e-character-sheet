import { CharacterSheet, ClanId, V5SkillItem, V5DisciplineSlot, V5AdvantageItem } from '../types';
import { createBlankCharacterSheet, INITIAL_V5_SKILLS } from './defaultCharacter';
import { CLAN_THEMES } from '../data/clans';

/**
 * Clean, structured AI Prompt template for LLM assistants (ChatGPT, Claude, Gemini, etc.)
 */
export const AI_CHARACTER_PROMPT_TEMPLATE = `Привет! Я создаю лист персонажа для Vampire: The Masquerade 5-й редакции с помощью онлайн-инструмента с поддержкой импорта JSON-массива.

Сгенерируй мне интересного, глубокого и сбалансированного персонажа для Vampire: The Masquerade 5-й редакции и отправь мне готовый JSON-массив строго согласно данному шаблону.

ВАЖНЫЕ ПРАВИЛА:
1. Ответь ТОЛЬКО валидным JSON-массивом (начинающимся с [ и заканчивающимся ]).
2. Не добавляй никаких вступительных приветствий, пояснений, комментариев или текста до и после JSON.
3. Сохраняй точную структуру полей шаблона.

[
  {
    "info": {
      "name": "Виктор Корвус",
      "player": "Игрок",
      "chronicle": "Ночи Праги",
      "concept": "Бывший частный детектив / Следователь",
      "clan": "brujah",
      "generation": 12,
      "sire": "Маркус Блэквуд",
      "predatorType": "Аллея (Alleycat)",
      "ambition": "Разоблачить заговор внутри Камарильи",
      "desire": "Найти пропавшего информатора",
      "haven": "Заброшенный склад в доках",
      "sect": "Анархи"
    },
    "attributes": {
      "physical": {
        "strength": { "value": 3 },
        "dexterity": { "value": 2 },
        "stamina": { "value": 3 }
      },
      "social": {
        "charisma": { "value": 2 },
        "manipulation": { "value": 3 },
        "composure": { "value": 2 }
      },
      "mental": {
        "intelligence": { "value": 2 },
        "wits": { "value": 4 },
        "resolve": { "value": 2 }
      }
    },
    "v5Skills": [
      { "id": "ath", "name": "Атлетика", "value": 1 },
      { "id": "brawl", "name": "Драка", "value": 3, "specialty": "Захваты" },
      { "id": "craft", "name": "Ремесло", "value": 0 },
      { "id": "drive", "name": "Вождение", "value": 1 },
      { "id": "firearms", "name": "Стрельба", "value": 2, "specialty": "Пистолеты" },
      { "id": "larceny", "name": "Воровство", "value": 2 },
      { "id": "melee", "name": "Фехтование", "value": 1 },
      { "id": "stealth", "name": "Скрытность", "value": 2 },
      { "id": "survival", "name": "Выживание", "value": 1 },
      { "id": "animalKen", "name": "Обр. с животными", "value": 0 },
      { "id": "etiquette", "name": "Этикет", "value": 1 },
      { "id": "insight", "name": "Проницательность", "value": 3, "specialty": "Ложь" },
      { "id": "intimidation", "name": "Запугивание", "value": 2 },
      { "id": "leadership", "name": "Лидерство", "value": 1 },
      { "id": "performance", "name": "Исполнение", "value": 0 },
      { "id": "persuasion", "name": "Убеждение", "value": 2 },
      { "id": "streetwise", "name": "Уличное чутьё", "value": 3, "specialty": "Информаторы" },
      { "id": "subterfuge", "name": "Хитрость", "value": 2 },
      { "id": "academics", "name": "Гуманитарные науки", "value": 1 },
      { "id": "awareness", "name": "Наблюдательность", "value": 3, "specialty": "Слежка" },
      { "id": "finance", "name": "Финансы", "value": 1 },
      { "id": "investigation", "name": "Расследование", "value": 4, "specialty": "Места преступления" },
      { "id": "medicine", "name": "Медицина", "value": 1 },
      { "id": "occult", "name": "Оккультизм", "value": 1 },
      { "id": "politics", "name": "Политика", "value": 1 },
      { "id": "science", "name": "Естественные науки", "value": 0 },
      { "id": "technology", "name": "Техника", "value": 2 }
    ],
    "v5Disciplines": [
      {
        "name": "Мощь (Potence)",
        "dots": 2,
        "powers": ["Сокрушительный удар", "Хватка титана", "", "", ""]
      },
      {
        "name": "Стремительность (Celerity)",
        "dots": 1,
        "powers": ["Кошачья грация", "", "", "", ""]
      }
    ],
    "v5Merits": [
      { "name": "Связи: Детективы полиции", "dots": 2 },
      { "name": "Убежище: Укрепленный подвал", "dots": 2 },
      { "name": "Ресурсы: Наличные заначки", "dots": 1 }
    ],
    "v5Flaws": [
      { "name": "Враг: Коррумпированный инспектор", "dots": 2 },
      { "name": "Вспыльчивость", "dots": 1 }
    ],
    "v5Bio": {
      "apparentAge": "32",
      "trueAge": "45",
      "birthDate": "1979",
      "deathDate": "2011",
      "distinguishingFeatures": "Глубокий шрам на левой щеке, потертый твидовый пиджак",
      "appearance": "Высокий мужчина с проницательным взглядом и усталым выражением лица...",
      "history": "В смертной жизни расследовал дела об убийствах, пока не наткнулся на тайну Сородичей...",
      "inventory": "Револьвер Smith & Wesson .38, старый блокнот, латунная зажигалка, отмычки"
    },
    "pageNotes": "Ключевые контакты в городе, текущие зацепки и слухи..."
  }
]`;

/**
 * Downloads a character sheet as a formatted JSON backup file
 */
export function exportCharacterToJson(sheet: CharacterSheet): void {
  const safeName = (sheet.info.name || 'vtm5_character')
    .trim()
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_');
  const filename = `${safeName || 'character'}_vtm5.json`;

  const jsonStr = JSON.stringify(sheet, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Strips markdown fences, parses JSON, and normalizes it into a fully valid CharacterSheet
 */
export function parseCharacterJson(rawInput: string): {
  success: boolean;
  character?: CharacterSheet;
  error?: string;
} {
  if (!rawInput || !rawInput.trim()) {
    return { success: false, error: 'Поле ввода JSON пустое. Вставьте JSON-массив или объект персонажа.' };
  }

  let cleaned = rawInput.trim();

  // Strip Markdown code fences ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    return {
      success: false,
      error: `Ошибка парсинга JSON: ${err?.message || 'Некорректный синтаксис JSON'}. Убедитесь, что скобки и запятые расставлены верно.`,
    };
  }

  // Support array format [ { ... } ] or single object { ... }
  let targetObj: any = null;
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { success: false, error: 'Переданный JSON-массив пуст.' };
    }
    targetObj = parsed[0];
  } else if (typeof parsed === 'object' && parsed !== null) {
    targetObj = parsed.character || parsed.sheet || parsed;
  } else {
    return { success: false, error: 'JSON должен быть объектом персонажа или массивом объектов.' };
  }

  if (!targetObj || typeof targetObj !== 'object') {
    return { success: false, error: 'Не удалось обнаружить объект с данными персонажа в переданном JSON.' };
  }

  try {
    const normalized = normalizeCharacterSheet(targetObj);
    return { success: true, character: normalized };
  } catch (err: any) {
    return {
      success: false,
      error: `Ошибка нормализации данных персонажа: ${err?.message || 'Неизвестная ошибка структуры данных'}.`,
    };
  }
}

/**
 * Merges and sanitizes raw parsed data onto a solid base CharacterSheet structure
 */
export function normalizeCharacterSheet(raw: any): CharacterSheet {
  const base = createBlankCharacterSheet(raw.syncCode || 'LOCAL');

  // Info
  const rawInfo = raw.info || {};
  let clanId: ClanId = 'caitiff';
  const rawClan = String(rawInfo.clan || '').toLowerCase().trim();
  if (rawClan in CLAN_THEMES || rawClan === 'custom') {
    clanId = rawClan as ClanId;
  } else if (rawClan) {
    // Check by russian name or en name
    const foundEntry = Object.entries(CLAN_THEMES).find(
      ([id, theme]) =>
        id === rawClan ||
        theme.name.toLowerCase() === rawClan ||
        theme.nameEn.toLowerCase() === rawClan
    );
    if (foundEntry) {
      clanId = foundEntry[0] as ClanId;
    } else {
      clanId = 'custom';
      rawInfo.customClanName = rawClan;
    }
  }

  const info = {
    ...base.info,
    name: String(rawInfo.name || '').trim(),
    player: String(rawInfo.player || '').trim(),
    chronicle: String(rawInfo.chronicle || '').trim(),
    concept: String(rawInfo.concept || '').trim(),
    conceptDetail: String(rawInfo.conceptDetail || '').trim(),
    clan: clanId,
    customClanName: String(rawInfo.customClanName || '').trim(),
    generation: Math.min(16, Math.max(3, Number(rawInfo.generation) || 13)),
    sire: String(rawInfo.sire || '').trim(),
    predatorType: String(rawInfo.predatorType || '').trim(),
    ambition: String(rawInfo.ambition || '').trim(),
    desire: String(rawInfo.desire || '').trim(),
    purpose: String(rawInfo.purpose || '').trim(),
    touchstones: String(rawInfo.touchstones || '').trim(),
    chronicleTenet: String(rawInfo.chronicleTenet || '').trim(),
    haven: String(rawInfo.haven || '').trim(),
    sect: String(rawInfo.sect || '').trim(),
    title: String(rawInfo.title || '').trim(),
  };

  // Attributes
  const rawAttr = raw.attributes || {};
  const clampVal = (val: any, def: number = 1, min: number = 1, max: number = 5) => {
    const num = Number(typeof val === 'object' && val !== null ? val.value : val);
    if (isNaN(num)) return def;
    return Math.max(min, Math.min(max, Math.round(num)));
  };

  const attributes = {
    physical: {
      strength: { id: 'str', name: 'Сила', nameEn: 'Strength', value: clampVal(rawAttr.physical?.strength, 1) },
      dexterity: { id: 'dex', name: 'Ловкость', nameEn: 'Dexterity', value: clampVal(rawAttr.physical?.dexterity, 1) },
      stamina: { id: 'sta', name: 'Выносливость', nameEn: 'Stamina', value: clampVal(rawAttr.physical?.stamina, 1) },
    },
    social: {
      charisma: { id: 'cha', name: 'Харизма', nameEn: 'Charisma', value: clampVal(rawAttr.social?.charisma, 1) },
      manipulation: { id: 'man', name: 'Манипуляция', nameEn: 'Manipulation', value: clampVal(rawAttr.social?.manipulation, 1) },
      appearance: { id: 'app', name: 'Внешность', nameEn: 'Appearance', value: clampVal(rawAttr.social?.appearance, 1) },
      composure: { id: 'com', name: 'Самообладание', nameEn: 'Composure', value: clampVal(rawAttr.social?.composure, 1) },
    },
    mental: {
      perception: { id: 'per', name: 'Восприятие', nameEn: 'Perception', value: clampVal(rawAttr.mental?.perception, 1) },
      intelligence: { id: 'int', name: 'Интеллект', nameEn: 'Intelligence', value: clampVal(rawAttr.mental?.intelligence, 1) },
      wits: { id: 'wit', name: 'Смекалка', nameEn: 'Wits', value: clampVal(rawAttr.mental?.wits, 1) },
      resolve: { id: 'res', name: 'Решительность', nameEn: 'Resolve', value: clampVal(rawAttr.mental?.resolve, 1) },
    },
  };

  // V5 Skills (map from array or raw map)
  let v5Skills: V5SkillItem[] = INITIAL_V5_SKILLS.map((initSkill) => {
    let matchedSkill: any = null;
    if (Array.isArray(raw.v5Skills)) {
      matchedSkill = raw.v5Skills.find(
        (s: any) =>
          s.id === initSkill.id ||
          (s.name && s.name.toLowerCase().trim() === initSkill.name.toLowerCase()) ||
          (s.nameEn && s.nameEn.toLowerCase().trim() === initSkill.nameEn.toLowerCase())
      );
    } else if (raw.skills && typeof raw.skills === 'object') {
      matchedSkill = raw.skills[initSkill.id] || raw.skills[initSkill.name] || raw.skills[initSkill.nameEn];
    }

    const val = clampVal(matchedSkill?.value ?? matchedSkill, 0, 0, 5);
    const spec = matchedSkill?.specialty || matchedSkill?.specialization;

    return {
      ...initSkill,
      value: val,
      specialty: typeof spec === 'string' && spec.trim() ? spec.trim() : undefined,
    };
  });

  // V5 Tracks
  const sta = attributes.physical.stamina.value;
  const com = attributes.social.composure.value;
  const res = attributes.mental.resolve.value;

  const defaultHealthMax = sta + 3;
  const defaultWillpowerMax = com + res;

  const rawTracks = raw.v5Tracks || {};
  const v5Tracks = {
    health: {
      max: Number(rawTracks.health?.max) || defaultHealthMax,
      superficial: Number(rawTracks.health?.superficial) || 0,
      aggravated: Number(rawTracks.health?.aggravated) || 0,
      boxes: Array.isArray(rawTracks.health?.boxes) ? rawTracks.health.boxes : undefined,
    },
    willpower: {
      max: Number(rawTracks.willpower?.max) || defaultWillpowerMax,
      superficial: Number(rawTracks.willpower?.superficial) || 0,
      aggravated: Number(rawTracks.willpower?.aggravated) || 0,
      boxes: Array.isArray(rawTracks.willpower?.boxes) ? rawTracks.willpower.boxes : undefined,
    },
    humanity: {
      value: typeof rawTracks.humanity?.value === 'number' ? rawTracks.humanity.value : 7,
      stains: typeof rawTracks.humanity?.stains === 'number' ? rawTracks.humanity.stains : 0,
    },
    hunger: typeof rawTracks.hunger === 'number' ? Math.max(0, Math.min(5, rawTracks.hunger)) : 1,
  };

  // V5 Disciplines (6 slots)
  const rawDiscList = Array.isArray(raw.v5Disciplines) ? raw.v5Disciplines : [];
  const v5Disciplines: V5DisciplineSlot[] = Array.from({ length: 6 }, (_, idx) => {
    const item = rawDiscList[idx] || {};
    const powers = Array.isArray(item.powers)
      ? [
          String(item.powers[0] || ''),
          String(item.powers[1] || ''),
          String(item.powers[2] || ''),
          String(item.powers[3] || ''),
          String(item.powers[4] || ''),
        ]
      : ['', '', '', '', ''];

    return {
      id: item.id || `d${idx + 1}`,
      name: String(item.name || '').trim(),
      dots: clampVal(item.dots, 0, 0, 5),
      powers,
    };
  });

  // V5 Merits and Flaws
  const normalizeAdvList = (
    rawList: any,
    count: number,
    prefix: string,
    type: 'advantage' | 'flaw'
  ): V5AdvantageItem[] => {
    const list = Array.isArray(rawList) ? rawList : [];
    return Array.from({ length: Math.max(count, list.length) }, (_, i) => {
      const item = list[i] || {};
      return {
        id: item.id || `${prefix}${i + 1}`,
        name: String(item.name || '').trim(),
        dots: clampVal(item.dots, 0, 0, 5),
        type,
        description: item.description ? String(item.description).trim() : undefined,
      };
    });
  };

  const v5Merits = normalizeAdvList(raw.v5Merits || raw.v5Advantages?.filter((a: any) => a.type !== 'flaw'), 14, 'm', 'advantage');
  const v5Flaws = normalizeAdvList(raw.v5Flaws || raw.v5Advantages?.filter((a: any) => a.type === 'flaw'), 14, 'f', 'flaw');

  // V5 Blood
  const rawBlood = raw.v5Blood || {};
  const v5Blood = {
    potency: clampVal(rawBlood.potency, 1, 0, 10),
    bloodSurge: String(rawBlood.bloodSurge || '+1 кубик'),
    mendAmount: String(rawBlood.mendAmount || '1 поверхностный'),
    powerBonus: String(rawBlood.powerBonus || 'Нет'),
    rouseReroll: String(rawBlood.rouseReroll || '1-й уровень'),
    baneSeverity: clampVal(rawBlood.baneSeverity, 2, 0, 6),
    feedingPenalty: String(rawBlood.feedingPenalty || 'Нет ограничений'),
    clanBane: String(rawBlood.clanBane || ''),
    clanCompulsion: String(rawBlood.clanCompulsion || ''),
  };

  // V5 Bio
  const rawBio = raw.v5Bio || {};
  const v5Bio = {
    portraitUrl: String(rawBio.portraitUrl || ''),
    rank: String(rawBio.rank || ''),
    totalXp: Number(rawBio.totalXp) || 0,
    spentXp: Number(rawBio.spentXp) || 0,
    birthDate: String(rawBio.birthDate || ''),
    deathDate: String(rawBio.deathDate || ''),
    trueAge: String(rawBio.trueAge || ''),
    apparentAge: String(rawBio.apparentAge || ''),
    distinguishingFeatures: String(rawBio.distinguishingFeatures || ''),
    bloodBonds: String(rawBio.bloodBonds || ''),
    appearance: String(rawBio.appearance || ''),
    history: String(rawBio.history || ''),
    inventory: String(rawBio.inventory || ''),
  };

  return {
    ...base,
    id: raw.id || `vtm-${Date.now()}`,
    syncCode: raw.syncCode || 'LOCAL',
    updatedAt: new Date().toISOString(),
    info,
    attributes,
    v5Skills,
    v5Tracks,
    v5Disciplines,
    v5Merits,
    v5Flaws,
    v5Blood,
    v5Bio,
    pageNotes: String(raw.pageNotes || ''),
    notesPages: Array.isArray(raw.notesPages) ? raw.notesPages : undefined,
  };
}
