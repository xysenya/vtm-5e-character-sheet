import bloodPowersRaw from '@/assets/lib/blood_powers.json';
import { V5_DISCIPLINES } from './v5Disciplines';

export interface BloodPowerSource {
  ru: string;
  en: string;
}

export interface BloodPower {
  discipline: string;
  sources: BloodPowerSource[];
  name: string;
  level: number;
  description: string;
  requirements: string | null;
  rules: string;
  cost: string | null;
  duration: string | null;
  pool: string | null;
  amalgam: string | null;
  comments: string | null;
}

export const ALL_BLOOD_POWERS: BloodPower[] = (bloodPowersRaw.powers || []) as BloodPower[];

/**
 * Normalizes discipline names to match between sheet and JSON
 */
export function normalizeDisciplineName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Retrieves all blood powers for a given discipline name from the official JSON dataset.
 * If not present in JSON (e.g. Thin-blood Alchemy), falls back to V5_DISCIPLINES.
 */
export function getPowersForDiscipline(disciplineName: string): BloodPower[] {
  if (!disciplineName) return [];
  const normalized = normalizeDisciplineName(disciplineName);
  
  const fromJson = ALL_BLOOD_POWERS.filter((p) => {
    const pDisc = normalizeDisciplineName(p.discipline);
    return (
      pDisc === normalized ||
      pDisc.includes(normalized) ||
      normalized.includes(pDisc)
    );
  });

  if (fromJson.length > 0) {
    return fromJson;
  }

  // Fallback to V5_DISCIPLINES if not in JSON
  const fallbackDisc = V5_DISCIPLINES.find((d) => {
    const dName = normalizeDisciplineName(d.name);
    const dEn = normalizeDisciplineName(d.nameEn);
    return (
      dName === normalized ||
      dEn === normalized ||
      dName.includes(normalized) ||
      normalized.includes(dName)
    );
  });

  if (fallbackDisc && fallbackDisc.powers) {
    return fallbackDisc.powers.map((p) => ({
      discipline: fallbackDisc.name,
      sources: [{ ru: 'Основная книга правил', en: 'Corebook' }],
      name: p.name,
      level: p.level,
      description: p.description,
      requirements: null,
      rules: p.description,
      cost: p.cost || null,
      duration: null,
      pool: p.pool || null,
      amalgam: null,
      comments: null,
    }));
  }

  return [];
}

/**
 * Returns all unique sources present in the blood powers database.
 */
export function getAllSources(): BloodPowerSource[] {
  const map = new Map<string, BloodPowerSource>();
  for (const power of ALL_BLOOD_POWERS) {
    for (const src of power.sources) {
      if (!map.has(src.ru)) {
        map.set(src.ru, src);
      }
    }
  }
  return Array.from(map.values());
}

