export interface SheetColorSettings {
  sheetBg: string;           // Цвет фона листа персонажа
  textPrimary: string;       // Основной цвет текста (характеристики, навыки, описания)
  textAccent: string;        // Акцентный цвет текста (заголовки, бегущие строки, акценты)
  graphicsAccent: string;    // Акцентный цвет графики (разделители, ромбы ◆, анхи ☥, рамки)
  dotsRegular: string;       // Цвет основных точек (характеристики, навыки)
  dotsAccent: string;        // Цвет акцентных точек (дисциплины, сила крови, голод)
  inputBg: string;           // Цвет фона полей ввода и карточек
  borderColor: string;       // Цвет границ и тонких линий
}

export const DEFAULT_LIGHT_COLORS: SheetColorSettings = {
  sheetBg: '#faf8f5',
  textPrimary: '#18181b',
  textAccent: '#881337',
  graphicsAccent: '#991b1b',
  dotsRegular: '#18181b',
  dotsAccent: '#dc2626',
  inputBg: '#ffffff',
  borderColor: '#d4d4d8',
};

export const DEFAULT_DARK_COLORS: SheetColorSettings = {
  sheetBg: '#0f0f11',
  textPrimary: '#f4f4f5',
  textAccent: '#dc2626',
  graphicsAccent: '#b91c1c',
  dotsRegular: '#f4f4f5',
  dotsAccent: '#ef4444',
  inputBg: '#18181b',
  borderColor: '#27272a',
};

export interface ColorPreset {
  id: string;
  name: string;
  isDark: boolean;
  colors: SheetColorSettings;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'camarilla-light',
    name: 'Камарилья (Светлый)',
    isDark: false,
    colors: { ...DEFAULT_LIGHT_COLORS },
  },
  {
    id: 'sabbat-dark',
    name: 'Шабаш (Тёмный)',
    isDark: true,
    colors: { ...DEFAULT_DARK_COLORS },
  },
  {
    id: 'crimson-blood',
    name: 'Кровавый Багрянец',
    isDark: true,
    colors: {
      sheetBg: '#180709',
      textPrimary: '#fce7f3',
      textAccent: '#fb7185',
      graphicsAccent: '#e11d48',
      dotsRegular: '#fda4af',
      dotsAccent: '#f43f5e',
      inputBg: '#280a0e',
      borderColor: '#5c0f1c',
    },
  },
  {
    id: 'tremere-magic',
    name: 'Тауматургия Тремер',
    isDark: true,
    colors: {
      sheetBg: '#0c0a1a',
      textPrimary: '#e0e7ff',
      textAccent: '#c084fc',
      graphicsAccent: '#9333ea',
      dotsRegular: '#ddd6fe',
      dotsAccent: '#a855f7',
      inputBg: '#171330',
      borderColor: '#4c1d95',
    },
  },
  {
    id: 'setite-emerald',
    name: 'Изумрудный Яд',
    isDark: true,
    colors: {
      sheetBg: '#06130d',
      textPrimary: '#d1fae5',
      textAccent: '#34d399',
      graphicsAccent: '#10b981',
      dotsRegular: '#a7f3d0',
      dotsAccent: '#059669',
      inputBg: '#0c2217',
      borderColor: '#065f46',
    },
  },
  {
    id: 'ancient-parchment',
    name: 'Античный Пергамент',
    isDark: false,
    colors: {
      sheetBg: '#f4ece1',
      textPrimary: '#292524',
      textAccent: '#78350f',
      graphicsAccent: '#92400e',
      dotsRegular: '#44403c',
      dotsAccent: '#b45309',
      inputBg: '#fdfbf7',
      borderColor: '#d6c7b2',
    },
  },
  {
    id: 'monochrome-noir',
    name: 'Монохром Нуар (Светлый)',
    isDark: false,
    colors: {
      sheetBg: '#ffffff',
      textPrimary: '#09090b',
      textAccent: '#18181b',
      graphicsAccent: '#52525b',
      dotsRegular: '#09090b',
      dotsAccent: '#71717a',
      inputBg: '#f4f4f5',
      borderColor: '#a1a1aa',
    },
  },
  {
    id: 'noir-dark',
    name: 'Монохром Нуар (Тёмный)',
    isDark: true,
    colors: {
      sheetBg: '#09090b',
      textPrimary: '#fafafa',
      textAccent: '#e4e4e7',
      graphicsAccent: '#a1a1aa',
      dotsRegular: '#fafafa',
      dotsAccent: '#d4d4d8',
      inputBg: '#18181b',
      borderColor: '#3f3f46',
    },
  },
];

export const loadSavedAppearanceColors = (isDark: boolean): SheetColorSettings => {
  try {
    const key = isDark ? 'vtm_custom_colors_dark' : 'vtm_custom_colors_light';
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...(isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS),
        ...parsed,
      };
    }
  } catch {}
  return isDark ? { ...DEFAULT_DARK_COLORS } : { ...DEFAULT_LIGHT_COLORS };
};

export const saveAppearanceColors = (isDark: boolean, colors: SheetColorSettings): void => {
  try {
    const key = isDark ? 'vtm_custom_colors_dark' : 'vtm_custom_colors_light';
    localStorage.setItem(key, JSON.stringify(colors));
  } catch {}
};
