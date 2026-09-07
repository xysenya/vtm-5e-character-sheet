import advantagesRaw from '@/assets/lib/advantages.json';

export interface AdvantageSource {
  ru: string;
  en: string;
}

export type AdvantagePoints = number | { min: number; max: number } | number[] | null;

export interface AdvantageItem {
  id: string;
  category: string;
  kind: 'advantage' | 'disadvantage';
  name: string;
  points: AdvantagePoints;
  points_source: string;
  sources: AdvantageSource[];
  description: string;
  requirements: string | null;
  notes: string[] | null;
  category_id: 'character' | 'biography' | 'coterie' | 'history' | 'custom';
  kind_label: string;
  points_display: string | null;
  section?: string;
  section_description?: string | null;
  section_requirement?: string | null;
}

export interface AdvantageCategoryNav {
  id: 'character' | 'biography' | 'coterie' | 'history' | 'custom';
  label: string;
  description: string;
}

export interface AdvantageGroup {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  requirement?: string;
  items: AdvantageItem[];
}

// Full list of 876 items from the official dataset
export const ALL_ADVANTAGES: AdvantageItem[] = (advantagesRaw.items || []) as AdvantageItem[];

// Top categories navigation from ui_model + custom
export const ADVANTAGE_CATEGORIES: AdvantageCategoryNav[] = [
  {
    id: 'character',
    label: 'Достоинства и недостатки',
    description: 'Личные качества, особенности и ограничения самого персонажа.',
  },
  {
    id: 'biography',
    label: 'Факты биографии',
    description: 'Преимущества и недостатки, связанные с прошлым, связями, ресурсами и положением персонажа.',
  },
  {
    id: 'coterie',
    label: 'Преимущества котерии',
    description: 'Преимущества и особенности, относящиеся к котерии и её общим ресурсам/связям.',
  },
  {
    id: 'history',
    label: 'Страницы истории',
    description: 'Дополнительные преимущества и недостатки из исторических и тематических источников.',
  },
  {
    id: 'custom',
    label: 'Пользовательские достоинства',
    description: 'Преимущества и недостатки, созданные игроком самостоятельно.',
  },
];

/**
 * Visual dots renderer strictly according to Section 5:
 * 1 -> •
 * 2 -> ••
 * 3 -> •••
 * 4 -> ••••
 * 5 -> •••••
 * {min: 1, max: 5} -> •–•••••
 * [1, 2] -> • / ••
 */
export function renderPointsDots(points: AdvantagePoints): string {
  if (points === null || points === undefined) return '';
  if (typeof points === 'number') {
    if (points <= 0) return '';
    return '•'.repeat(points);
  }
  if (Array.isArray(points)) {
    return points.map((p) => (p > 0 ? '•'.repeat(p) : '0')).join(' или ');
  }
  if (typeof points === 'object' && 'min' in points && 'max' in points) {
    return `${'•'.repeat(Math.max(1, points.min))}–${'•'.repeat(Math.max(1, points.max))}`;
  }
  return '';
}

/**
 * Human readable textual representation of points/dots
 */
export function formatPointsLabel(points: AdvantagePoints): string {
  if (points === null || points === undefined) return 'Особая стоимость';
  if (typeof points === 'number') {
    if (points === 0) return '0 точек';
    const word = points === 1 ? 'точка' : points < 5 ? 'точки' : 'точек';
    return `${points} ${word}`;
  }
  if (Array.isArray(points)) {
    return `${points.join(' или ')} точки`;
  }
  if (typeof points === 'object' && 'min' in points && 'max' in points) {
    const maxWord = points.max === 1 ? 'точка' : points.max < 5 ? 'точки' : 'точек';
    return `от ${points.min} до ${points.max} ${maxWord}`;
  }
  return 'Особая стоимость';
}

/**
 * Extracts default numeric dot rating when added to a character sheet slot
 */
export function getDefaultDots(points: AdvantagePoints): number {
  if (typeof points === 'number') return points === 0 ? 0 : Math.max(1, Math.min(points, 5));
  if (Array.isArray(points) && points.length > 0) return Math.max(1, Math.min(points[0], 5));
  if (typeof points === 'object' && points && 'min' in points) return Math.max(1, Math.min(points.min, 5));
  return 1;
}

/**
 * Dynamically collects all unique sources for the given list of advantage items
 */
export function getAvailableSources(items: AdvantageItem[]): AdvantageSource[] {
  const map = new Map<string, AdvantageSource>();
  for (const item of items) {
    for (const src of item.sources) {
      if (!map.has(src.ru)) {
        map.set(src.ru, src);
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.ru.localeCompare(b.ru, 'ru'));
}
