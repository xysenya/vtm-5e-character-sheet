import { AdvantageItem, ALL_ADVANTAGES, renderPointsDots, AdvantagePoints } from './advantages';

const STORAGE_KEY = 'vtm5_custom_advantages';
export const CUSTOM_ADVANTAGES_CHANGED_EVENT = 'vtm5_custom_advantages_changed';

/**
 * Retrieve user-created advantages and flaws from localStorage
 */
export function getCustomAdvantages(): AdvantageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading custom advantages from localStorage', e);
  }
  return [];
}

/**
 * Save or update a custom advantage in localStorage
 */
export function saveCustomAdvantage(data: {
  id?: string;
  name: string;
  kind: 'advantage' | 'disadvantage';
  points: AdvantagePoints;
  description: string;
  requirements?: string | null;
  section?: string;
}): AdvantageItem {
  const current = getCustomAdvantages();
  const id = data.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanName = data.name.trim() || 'Без названия';
  const cleanSection = data.section?.trim() || 'Пользовательские';

  const newItem: AdvantageItem = {
    id,
    category: 'Пользовательские достоинства',
    category_id: 'custom',
    kind: data.kind,
    kind_label: data.kind === 'advantage' ? 'Достоинство' : 'Недостаток',
    name: cleanName,
    points: data.points,
    points_source: 'custom',
    points_display: renderPointsDots(data.points),
    sources: [{ ru: 'Пользовательское', en: 'Custom' }],
    description: data.description.trim(),
    requirements: data.requirements?.trim() || null,
    notes: null,
    section: cleanSection,
    section_description: 'Пользовательский раздел преимуществ и недостатков',
    section_requirement: null,
  };

  const existingIdx = current.findIndex((i) => i.id === id);
  let updatedList: AdvantageItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = newItem;
  } else {
    updatedList = [newItem, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(CUSTOM_ADVANTAGES_CHANGED_EVENT, { detail: newItem }));
  } catch (e) {
    console.error('Error saving custom advantage', e);
  }

  return newItem;
}

/**
 * Delete a custom advantage from localStorage
 */
export function deleteCustomAdvantage(id: string): void {
  const current = getCustomAdvantages();
  const updated = current.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(CUSTOM_ADVANTAGES_CHANGED_EVENT, { detail: { id, deleted: true } })
    );
  } catch (e) {
    console.error('Error deleting custom advantage', e);
  }
}

/**
 * Searches in both official catalog and custom user advantages.
 * Case-insensitive search.
 */
export function findAdvantageByName(
  name: string,
  kind?: 'advantage' | 'disadvantage'
): AdvantageItem | undefined {
  if (!name || !name.trim()) return undefined;
  const clean = name.trim().toLowerCase();

  // Check custom first
  const custom = getCustomAdvantages();
  const foundCustom = custom.find(
    (i) => (!kind || i.kind === kind) && i.name.trim().toLowerCase() === clean
  );
  if (foundCustom) return foundCustom;

  // Check official catalog
  return ALL_ADVANTAGES.find(
    (i) => (!kind || i.kind === kind) && i.name.trim().toLowerCase() === clean
  );
}

/**
 * Combine official and custom advantages
 */
export function getAllAdvantagesWithCustom(): AdvantageItem[] {
  const custom = getCustomAdvantages();
  return [...ALL_ADVANTAGES, ...custom];
}
