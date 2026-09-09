import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  CharacterSheet,
  RelationshipCard,
  RelationshipConnection,
  RelationshipCardType,
  RelationshipConnectionType,
  ConnectionSide,
  ClanId,
} from '../../types';
import { CLAN_THEMES } from '../../data/clans';
import { ClanSymbol } from '../ClanSymbol';
import { SheetHeader, SectionDivider } from './SheetHeader';
import { RelationshipMapSidebar } from './RelationshipMapSidebar';
import {
  Plus,
  Trash2,
  Copy,
  Link2,
  ArrowLeftRight,
  ArrowRight,
  X,
  Upload,
  User,
  Users,
  Home,
  Shield,
  MapPin,
  Heart,
  Skull,
  Droplet,
  Crown,
  Swords,
  Coins,
  Anchor,
  HelpCircle,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Network,
} from 'lucide-react';

interface SheetPageRelationshipMapProps {
  sheet: CharacterSheet;
  onChange: (sheet: CharacterSheet) => void;
  isDark?: boolean;
  accentColor?: string;
  textColor?: string;
  primaryTextColor?: string;
  accentTextColor?: string;
  relationshipMapHeight?: number;
}

// Preset visual configurations for the 12 connection types
interface ConnectionStyleConfig {
  type: RelationshipConnectionType;
  label: string;
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
  isBidirectional?: boolean;
  description: string;
  iconName: string;
}

export const CONNECTION_STYLES: Record<RelationshipConnectionType, ConnectionStyleConfig> = {
  sire_childe: {
    type: 'sire_childe',
    label: 'Сир — Дитя',
    color: '#991b1b', // crimson
    strokeWidth: 2.5,
    description: 'Отношения создателя и отпрыска. Кровное преемство.',
    iconName: 'Crown',
  },
  blood_bond: {
    type: 'blood_bond',
    label: 'Узы крови',
    color: '#dc2626', // blood red
    strokeWidth: 3,
    description: 'Мистическое порабощение кровью (направление подчинения).',
    iconName: 'Droplet',
  },
  liege_vassal: {
    type: 'liege_vassal',
    label: 'Сюзерен — Вассал',
    color: '#d97706', // gold amber
    strokeWidth: 2.5,
    description: 'Феодальная иерархия Камарильи или Шабаша.',
    iconName: 'Shield',
  },
  ally: {
    type: 'ally',
    label: 'Союзник',
    color: '#10b981', // emerald green
    strokeWidth: 2,
    isBidirectional: true,
    description: 'Взаимное доверие, поддержка и общие цели.',
    iconName: 'Users',
  },
  enemy: {
    type: 'enemy',
    label: 'Враг',
    color: '#ea580c', // fiery orange
    strokeWidth: 2.5,
    strokeDasharray: '6, 4',
    description: 'Открытое противостояние и угроза существованию.',
    iconName: 'Skull',
  },
  rival: {
    type: 'rival',
    label: 'Соперник',
    color: '#a855f7', // purple
    strokeWidth: 2,
    strokeDasharray: '8, 3, 2, 3',
    description: 'Конкуренция за статус, домен, влияние или признание.',
    iconName: 'Swords',
  },
  love: {
    type: 'love',
    label: 'Любовь',
    color: '#ec4899', // rose pink
    strokeWidth: 2.5,
    isBidirectional: true,
    description: 'Романтическая страсть, платоническая привязанность или одержимость.',
    iconName: 'Heart',
  },
  enmity: {
    type: 'enmity',
    label: 'Вражда',
    color: '#7f1d1d', // blood clot
    strokeWidth: 3,
    strokeDasharray: '4, 2',
    description: 'Глубокая клановая ненависть или вендетта.',
    iconName: 'Skull',
  },
  debt: {
    type: 'debt',
    label: 'Долг (Услуга / Бун)',
    color: '#ca8a04', // brass yellow
    strokeWidth: 2,
    strokeDasharray: '4, 4',
    description: 'Долг жизни, крупная или малая услуга Сородича.',
    iconName: 'Coins',
  },
  touchstone: {
    type: 'touchstone',
    label: 'Опора (Touchstone)',
    color: '#06b6d4', // cyan
    strokeWidth: 2.5,
    description: 'Смертный, якорь человечности Сородича.',
    iconName: 'Anchor',
  },
  relative: {
    type: 'relative',
    label: 'Родственник',
    color: '#6366f1', // indigo
    strokeWidth: 2,
    isBidirectional: true,
    description: 'Смертные кровные узы или общее происхождение.',
    iconName: 'Users',
  },
  other: {
    type: 'other',
    label: 'Прочее',
    color: '#71717a', // zinc
    strokeWidth: 2,
    strokeDasharray: '5, 5',
    description: 'Индивидуальная или особая связь с настраиваемой подписью.',
    iconName: 'HelpCircle',
  },
};

// Mini SVG preview showing the exact arrow style as it appears on the canvas
const ConnectionArrowPreview: React.FC<{
  styleConfig: {
    color: string;
    strokeWidth: number;
    strokeDasharray?: string;
    isBidirectional?: boolean;
  };
  className?: string;
}> = ({ styleConfig, className = '' }) => {
  const { color, strokeWidth, strokeDasharray, isBidirectional } = styleConfig;
  const clampedWidth = Math.min(Math.max(strokeWidth, 1.8), 2.8);
  const startX = isBidirectional ? 8 : 2;
  const endX = 40;

  return (
    <svg
      width="48"
      height="14"
      viewBox="0 0 48 14"
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <line
        x1={startX}
        y1="7"
        x2={endX}
        y2="7"
        stroke={color}
        strokeWidth={clampedWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
      />
      {/* Right arrowhead */}
      <path
        d={`M ${endX - 5} 3.5 L ${endX + 3} 7 L ${endX - 5} 10.5 Z`}
        fill={color}
      />
      {/* Left arrowhead if bidirectional */}
      {isBidirectional && (
        <path
          d={`M ${startX + 5} 3.5 L ${startX - 3} 7 L ${startX + 5} 10.5 Z`}
          fill={color}
        />
      )}
    </svg>
  );
};

const CARD_TYPES: { id: RelationshipCardType; label: string; icon: any; color: string; badgeClass: string }[] = [
  { id: 'pc', label: 'Персонаж игрока', icon: User, color: '#a855f7', badgeClass: 'bg-purple-950/70 text-purple-300 border-purple-800' },
  { id: 'npc', label: 'Неигровой персонаж (NPC)', icon: User, color: '#f59e0b', badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800' },
  { id: 'player', label: 'Игрок', icon: User, color: '#3b82f6', badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-800' },
  { id: 'faction', label: 'Фракция / Котерия', icon: Users, color: '#10b981', badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' },
  { id: 'location', label: 'Место / Домен', icon: Home, color: '#6366f1', badgeClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-800' },
];

const CARD_WIDTH = 190;
const DEFAULT_CARD_HEIGHT = 64;
const CARD_HEIGHT = DEFAULT_CARD_HEIGHT;
const CANVAS_VIRTUAL_WIDTH = 900;
const CANVAS_VIRTUAL_HEIGHT = 1100;

// Helper to parse hex colors into RGB
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) || 0,
      g: parseInt(clean.substring(2, 4), 16) || 0,
      b: parseInt(clean.substring(4, 6), 16) || 0,
    };
  }
  return { r: 120, g: 120, b: 120 };
}

// Calculate perceived brightness / luminance
function getPerceivedBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Compute dynamic contrasting styles for badges on cards (prevents dark-on-dark and light-on-light)
function getBadgeContrastStyle(
  baseColorHex: string,
  isDark: boolean
): { backgroundColor: string; borderColor: string; color: string } {
  const { r, g, b } = parseHexColor(baseColorHex);

  if (isDark) {
    // Dark theme: card surface is dark (#18181c)
    // Badge background is semi-transparent tint of base color
    // Text MUST be light to contrast with the dark background
    // Blend base color toward white (78%) for a crisp pastel tint with guaranteed high luminance (>200)
    const textR = Math.min(255, Math.round(r + (255 - r) * 0.78));
    const textG = Math.min(255, Math.round(g + (255 - g) * 0.78));
    const textB = Math.min(255, Math.round(b + (255 - b) * 0.78));

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.7)`,
      color: `rgb(${textR}, ${textG}, ${textB})`,
    };
  } else {
    // Light theme: card surface is white (#ffffff)
    // Badge background is a soft pastel tint
    // Text MUST be dark and legible against the light badge background
    const baseLum = getPerceivedBrightness(r, g, b);

    // If color is too bright, scale it down to deep readable luminance (<= 65)
    let textR = r;
    let textG = g;
    let textB = b;
    if (baseLum > 65) {
      const factor = 65 / Math.max(baseLum, 1);
      textR = Math.round(r * factor);
      textG = Math.round(g * factor);
      textB = Math.round(b * factor);
    }

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
      color: `rgb(${textR}, ${textG}, ${textB})`,
    };
  }
}

// Helper to determine accurate card height taking actual DOM height into account
function getActualCardHeight(card: RelationshipCard, heightsMap?: Record<string, number>): number {
  if (heightsMap && heightsMap[card.id] && heightsMap[card.id] > 20) {
    return heightsMap[card.id];
  }
  if (card.height && card.height > 20) {
    return card.height;
  }
  return card.notes ? 88 : 56;
}

// Helper to find a free nearby position on the canvas for a new card close to the last created card
function findNearbyEmptyPosition(
  cards: RelationshipCard[],
  preferredRefCard?: RelationshipCard,
  heightsMap?: Record<string, number>
): { x: number; y: number } {
  const cardW = CARD_WIDTH; // 190
  const cardH = DEFAULT_CARD_HEIGHT; // 64

  // Default canvas padding and bounds
  const minX = 40;
  const maxX = CANVAS_VIRTUAL_WIDTH - cardW - 40; // 900 - 190 - 40 = 670
  const minY = 40;
  const maxY = CANVAS_VIRTUAL_HEIGHT - cardH - 60; // 1100 - 64 - 60 = 976

  if (cards.length === 0) {
    return { x: 240, y: 180 };
  }

  // Reference card: preferred card, or the last created card in the array
  const ref = preferredRefCard || cards[cards.length - 1];
  const refW = ref.width || cardW;
  const refH = getActualCardHeight(ref, heightsMap);

  const gapX = 36;
  const gapY = 32;

  // Collision check against all existing cards with safe margin
  const isColliding = (candX: number, candY: number): boolean => {
    // Canvas boundary check
    if (candX < minX || candX > maxX || candY < minY || candY > maxY) {
      return true;
    }
    for (const c of cards) {
      const cw = c.width || cardW;
      const ch = getActualCardHeight(c, heightsMap);
      const margin = 18;
      const overlap = !(
        candX + cardW + margin <= c.x ||
        candX >= c.x + cw + margin ||
        candY + cardH + margin <= c.y ||
        candY >= c.y + ch + margin
      );
      if (overlap) return true;
    }
    return false;
  };

  // Generate candidate positions around the reference card:
  // Priority: Right, Down, Down-Right, Left, Up, Down-Left, Up-Right, Up-Left, then expand outward
  const stepX = refW + gapX;
  const stepY = refH + gapY;

  const candidateOffsets: [number, number][] = [
    // Ring 1 (immediate neighbors)
    [stepX, 0], // Right
    [0, stepY], // Down
    [stepX, stepY], // Down-Right
    [-stepX, 0], // Left
    [0, -stepY], // Up
    [-stepX, stepY], // Down-Left
    [stepX, -stepY], // Up-Right
    [-stepX, -stepY], // Up-Left

    // Ring 2 (two steps away)
    [stepX * 2, 0],
    [0, stepY * 2],
    [stepX * 2, stepY],
    [stepX, stepY * 2],
    [-stepX * 2, 0],
    [0, -stepY * 2],
    [stepX * 2, stepY * 2],

    // Ring 3 (three steps away)
    [stepX * 3, 0],
    [0, stepY * 3],
    [stepX * 3, stepY],
    [stepX, stepY * 3],
  ];

  for (const [dx, dy] of candidateOffsets) {
    const candX = Math.round(ref.x + dx);
    const candY = Math.round(ref.y + dy);
    if (!isColliding(candX, candY)) {
      return { x: candX, y: candY };
    }
  }

  // Fallback if area is dense: scan available grid slots
  for (let r = 1; r <= 8; r++) {
    for (let c = 0; c <= 4; c++) {
      const candX = Math.round(minX + c * (cardW + gapX));
      const candY = Math.round(minY + r * (cardH + gapY));
      if (!isColliding(candX, candY)) {
        return { x: candX, y: candY };
      }
    }
  }

  // Absolute fallback near reference
  return {
    x: Math.min(maxX, Math.max(minX, ref.x + 30)),
    y: Math.min(maxY, Math.max(minY, ref.y + 30)),
  };
}

// Helper to calculate exact coordinates of edge centers
function getSideCoordinates(
  card: RelationshipCard,
  side?: ConnectionSide,
  heightsMap?: Record<string, number>
) {
  const w = card.width || CARD_WIDTH;
  const h = getActualCardHeight(card, heightsMap);
  switch (side) {
    case 'top':
      return { x: card.x + w / 2, y: card.y };
    case 'bottom':
      return { x: card.x + w / 2, y: card.y + h };
    case 'left':
      return { x: card.x, y: card.y + h / 2 };
    case 'right':
    default:
      return { x: card.x + w, y: card.y + h / 2 };
  }
}

// Calculate the closest side between two cards if side is unspecified
function getBestSides(
  fromCard: RelationshipCard,
  toCard: RelationshipCard,
  explicitFromSide?: ConnectionSide,
  explicitToSide?: ConnectionSide,
  heightsMap?: Record<string, number>
): { fromSide: ConnectionSide; toSide: ConnectionSide } {
  if (explicitFromSide && explicitToSide) {
    return { fromSide: explicitFromSide, toSide: explicitToSide };
  }

  const fromH = getActualCardHeight(fromCard, heightsMap);
  const toH = getActualCardHeight(toCard, heightsMap);

  const fromCenter = {
    x: fromCard.x + (fromCard.width || CARD_WIDTH) / 2,
    y: fromCard.y + fromH / 2,
  };
  const toCenter = {
    x: toCard.x + (toCard.width || CARD_WIDTH) / 2,
    y: toCard.y + toH / 2,
  };

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  let fromSide: ConnectionSide = explicitFromSide || 'right';
  let toSide: ConnectionSide = explicitToSide || 'left';

  if (!explicitFromSide || !explicitToSide) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 0) {
        fromSide = explicitFromSide || 'right';
        toSide = explicitToSide || 'left';
      } else {
        fromSide = explicitFromSide || 'left';
        toSide = explicitToSide || 'right';
      }
    } else {
      if (dy > 0) {
        fromSide = explicitFromSide || 'bottom';
        toSide = explicitToSide || 'top';
      } else {
        fromSide = explicitFromSide || 'top';
        toSide = explicitToSide || 'bottom';
      }
    }
  }

  return { fromSide, toSide };
}

// Build smooth Cubic Bezier path between two edge points
function buildBezierPath(
  p1: { x: number; y: number },
  side1: ConnectionSide,
  p2: { x: number; y: number },
  side2: ConnectionSide
) {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const handleOffset = Math.max(30, Math.min(150, dist * 0.4));

  let cp1 = { ...p1 };
  let cp2 = { ...p2 };

  switch (side1) {
    case 'top':
      cp1.y -= handleOffset;
      break;
    case 'bottom':
      cp1.y += handleOffset;
      break;
    case 'left':
      cp1.x -= handleOffset;
      break;
    case 'right':
      cp1.x += handleOffset;
      break;
  }

  switch (side2) {
    case 'top':
      cp2.y -= handleOffset;
      break;
    case 'bottom':
      cp2.y += handleOffset;
      break;
    case 'left':
      cp2.x -= handleOffset;
      break;
    case 'right':
      cp2.x += handleOffset;
      break;
  }

  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
  // Midpoint approximation along Bezier curve
  const midX = 0.125 * p1.x + 0.375 * cp1.x + 0.375 * cp2.x + 0.125 * p2.x;
  const midY = 0.125 * p1.y + 0.375 * cp1.y + 0.375 * cp2.y + 0.125 * p2.y;

  return { path, midX, midY };
}

export const SheetPageRelationshipMap: React.FC<SheetPageRelationshipMapProps> = ({
  sheet,
  onChange,
  isDark = false,
  accentColor,
  textColor,
  primaryTextColor,
  accentTextColor,
  relationshipMapHeight = 820,
}) => {
  // Ensure relationshipMap is initialized with at least the current player character if completely empty
  const mapData = useMemo(() => {
    if (sheet.relationshipMap && sheet.relationshipMap.cards && sheet.relationshipMap.cards.length > 0) {
      return sheet.relationshipMap;
    }
    const defaultCard: RelationshipCard = {
      id: 'char-main-' + (sheet.id || 'default'),
      name: sheet.info?.name || 'Мой персонаж',
      type: 'pc',
      clan: sheet.info?.clan || 'ventrue',
      customClanName: sheet.info?.customClanName,
      imageUrl: sheet.v5Bio?.portraitUrl || '',
      notes: `${sheet.info?.concept || 'Амплуа не указано'}, ${sheet.info?.generation || 13}-е поколение`,
      x: 250,
      y: 200,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
    return {
      cards: [defaultCard],
      connections: [],
    };
  }, [sheet.relationshipMap, sheet.id, sheet.info, sheet.v5Bio]);

  // Fast map lookup for cards
  const cardMap = useMemo(() => {
    const map = new Map<string, RelationshipCard>();
    mapData.cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [mapData.cards]);

  // Selection states
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Dynamic card heights measured from DOM to ensure perfectly centered connection arrows
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});

  const registerCardHeight = useCallback((id: string, height: number) => {
    if (height > 20) {
      setCardHeights((prev) => {
        if (prev[id] === height) return prev;
        return { ...prev, [id]: height };
      });
    }
  }, []);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    const targetCard =
      mapData.cards.find((c) => c.type === 'pc') ||
      mapData.cards.find(
        (c) => c.name && sheet.info?.name && c.name.trim().toLowerCase() === sheet.info.name.trim().toLowerCase()
      ) ||
      mapData.cards.find((c) => c.type === 'player') ||
      mapData.cards[0];

    if (targetCard) {
      const cardWidth = targetCard.width || CARD_WIDTH;
      const cardHeight = targetCard.height || CARD_HEIGHT;
      const cardCenterX = targetCard.x + cardWidth / 2;
      const cardCenterY = targetCard.y + cardHeight / 2;
      const estViewportW = 740;
      const estViewportH = relationshipMapHeight || 820;
      return {
        x: Math.round(estViewportW / 2 - cardCenterX),
        y: Math.round(estViewportH / 2 - cardCenterY),
      };
    }
    return { x: 0, y: 0 };
  });

  // Centering lifecycle and user interaction tracking
  const hasInitialCenteredRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);
  const lastSheetIdRef = useRef<string | undefined>(sheet.id);

  // Sidebar visibility (collapsible on tablet/desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_map_sidebar_open');
      if (saved !== null) return saved === 'true';
      return true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vtm_map_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  // Dragging a card
  const [draggingCard, setDraggingCard] = useState<{
    cardId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Panning the canvas
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number } | null>(null);

  // Dragging to create a connection from a handle (Obsidian style)
  const [connectingState, setConnectingState] = useState<{
    fromCardId: string;
    fromSide: ConnectionSide;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    hoveredTarget?: { cardId: string; side?: ConnectionSide };
  } | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Update map data helper
  const updateMapData = useCallback(
    (newCards: RelationshipCard[], newConnections: RelationshipConnection[]) => {
      onChange({
        ...sheet,
        relationshipMap: {
          cards: newCards,
          connections: newConnections,
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [onChange, sheet]
  );

  // Update single card
  const updateCard = (cardId: string, patch: Partial<RelationshipCard>) => {
    const nextCards = mapData.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c));
    updateMapData(nextCards, mapData.connections);
  };

  // Delete card
  const deleteCard = (cardId: string) => {
    const nextCards = mapData.cards.filter((c) => c.id !== cardId);
    const nextConns = mapData.connections.filter((cn) => cn.fromId !== cardId && cn.toId !== cardId);
    if (selectedCardId === cardId) setSelectedCardId(null);
    updateMapData(nextCards, nextConns);
  };

  // Duplicate card
  const duplicateCard = (cardId: string) => {
    const orig = cardMap.get(cardId);
    if (!orig) return;
    const pos = findNearbyEmptyPosition(mapData.cards, orig, cardHeights);
    const newCard: RelationshipCard = {
      ...orig,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${orig.name} (копия)`,
      x: pos.x,
      y: pos.y,
    };
    updateMapData([...mapData.cards, newCard], mapData.connections);
    setSelectedCardId(newCard.id);
    setSelectedConnectionId(null);
  };

  // Add new card near the last created card on empty space
  const handleAddNewCard = (type: RelationshipCardType = 'npc') => {
    // If a card is currently selected, use it as priority reference, otherwise use last card
    const refCard = selectedCardId ? cardMap.get(selectedCardId) : undefined;
    const pos = findNearbyEmptyPosition(mapData.cards, refCard, cardHeights);

    const newCard: RelationshipCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: type === 'location' ? 'Новое убежище' : type === 'faction' ? 'Новая котерия' : type === 'player' ? 'Игрок' : 'Новый персонаж',
      type,
      clan: type === 'location' || type === 'faction' || type === 'player' ? undefined : 'ventrue',
      notes: '',
      x: pos.x,
      y: pos.y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
    updateMapData([...mapData.cards, newCard], mapData.connections);
    setSelectedCardId(newCard.id);
    setSelectedConnectionId(null);
  };

  // Add player character
  const handleAddMyCharacter = () => {
    const pos = findNearbyEmptyPosition(mapData.cards, undefined, cardHeights);
    const defaultCard: RelationshipCard = {
      id: 'char-main-' + Date.now(),
      name: sheet.info?.name || 'Мой персонаж',
      type: 'pc',
      clan: sheet.info?.clan || 'ventrue',
      customClanName: sheet.info?.customClanName,
      imageUrl: sheet.v5Bio?.portraitUrl || '',
      notes: `${sheet.info?.concept || 'Амплуа не указано'}, ${sheet.info?.generation || 13}-е поколение`,
      x: mapData.cards.length === 0 ? 220 : pos.x,
      y: mapData.cards.length === 0 ? 180 : pos.y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
    updateMapData([...mapData.cards, defaultCard], mapData.connections);
    setSelectedCardId(defaultCard.id);
    setSelectedConnectionId(null);
  };

  // Invert connection direction
  const handleInvertConnection = (connId: string) => {
    const nextConns = mapData.connections.map((cn) => {
      if (cn.id !== connId) return cn;
      return {
        ...cn,
        fromId: cn.toId,
        toId: cn.fromId,
        fromSide: cn.toSide,
        toSide: cn.fromSide,
      };
    });
    updateMapData(mapData.cards, nextConns);
  };

  // Delete connection
  const handleDeleteConnection = (connId: string) => {
    const nextConns = mapData.connections.filter((cn) => cn.id !== connId);
    updateMapData(mapData.cards, nextConns);
    if (selectedConnectionId === connId) setSelectedConnectionId(null);
  };

  // Change connection type
  const handleChangeConnectionType = (connId: string, type: RelationshipConnectionType) => {
    const conf = CONNECTION_STYLES[type];
    const nextConns = mapData.connections.map((cn) => {
      if (cn.id !== connId) return cn;
      return {
        ...cn,
        type,
        isBidirectional: conf.isBidirectional || false,
      };
    });
    updateMapData(mapData.cards, nextConns);
  };

  // Zoom wheel listener on canvas container with preventDefault
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteractedRef.current = true;
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(2.2, Math.max(0.4, +(prev * zoomFactor).toFixed(3))));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Convert client coordinates to virtual canvas coordinates
  const clientToCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasContainerRef.current) return { x: 0, y: 0 };
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left - pan.x;
      const rawY = clientY - rect.top - pan.y;
      return {
        x: rawX / zoom,
        y: rawY / zoom,
      };
    },
    [pan, zoom]
  );

  // Pointer Down on Handle (Begin pulling connection like in Obsidian)
  const handlePointerDownHandle = (card: RelationshipCard, side: ConnectionSide, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getSideCoordinates(card, side, cardHeights);
    setConnectingState({
      fromCardId: card.id,
      fromSide: side,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
    });
    setSelectedCardId(null);
  };

  // Pointer Down on Card body (drag card)
  const handlePointerDownCard = (card: RelationshipCard, e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    userInteractedRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingCard({
      cardId: card.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: card.x,
      initialY: card.y,
    });
    setSelectedCardId(card.id);
    setSelectedConnectionId(null);
  };

  // Helper to center the canvas viewport on the player character card (or matching/first card)
  const centerCanvasOnCharacter = useCallback(
    (forcedZoom?: number) => {
      const container = canvasContainerRef.current;
      if (!container) return false;
      const viewportWidth = container.clientWidth;
      const viewportHeight = container.clientHeight;
      if (viewportWidth <= 0 || viewportHeight <= 0) return false;

      const targetZoom = forcedZoom !== undefined ? forcedZoom : 1;
      setZoom(targetZoom);

      // Priority:
      // 1. Card of type 'pc' (персонаж игрока)
      // 2. Card whose name matches character name in sheet.info
      // 3. Card of type 'player'
      // 4. First card in list
      const targetCard =
        mapData.cards.find((c) => c.type === 'pc') ||
        mapData.cards.find(
          (c) => c.name && sheet.info?.name && c.name.trim().toLowerCase() === sheet.info.name.trim().toLowerCase()
        ) ||
        mapData.cards.find((c) => c.type === 'player') ||
        mapData.cards[0];

      if (targetCard) {
        const cardWidth = targetCard.width || CARD_WIDTH;
        const cardHeight = getActualCardHeight(targetCard, cardHeights);
        const cardCenterX = targetCard.x + cardWidth / 2;
        const cardCenterY = targetCard.y + cardHeight / 2;

        const newPanX = Math.round(viewportWidth / 2 - cardCenterX * targetZoom);
        const newPanY = Math.round(viewportHeight / 2 - cardCenterY * targetZoom);

        setPan({ x: newPanX, y: newPanY });
        return true;
      } else {
        setPan({ x: 0, y: 0 });
        return true;
      }
    },
    [mapData.cards, sheet.info?.name, cardHeights]
  );

  // When sheet ID changes (e.g. user loaded another character), allow re-centering on the new character card
  useEffect(() => {
    if (lastSheetIdRef.current !== sheet.id) {
      lastSheetIdRef.current = sheet.id;
      hasInitialCenteredRef.current = false;
      userInteractedRef.current = false;
    }
  }, [sheet.id]);

  // Initial centering on mount / program launch
  useEffect(() => {
    if (hasInitialCenteredRef.current) return;

    const ok = centerCanvasOnCharacter(1);
    if (ok) {
      hasInitialCenteredRef.current = true;
    } else {
      const rId = requestAnimationFrame(() => {
        if (!hasInitialCenteredRef.current) {
          const success = centerCanvasOnCharacter(1);
          if (success) hasInitialCenteredRef.current = true;
        }
      });
      return () => cancelAnimationFrame(rId);
    }
  }, [centerCanvasOnCharacter]);

  // ResizeObserver: ensures precision once container is laid out or if window is resized before user interaction
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (!hasInitialCenteredRef.current || !userInteractedRef.current) {
            centerCanvasOnCharacter(1);
            hasInitialCenteredRef.current = true;
          }
        }
      }
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [centerCanvasOnCharacter]);

  // Reset Zoom & Pan and center canvas on the player character card (100%)
  const handleResetView = () => {
    userInteractedRef.current = false;
    centerCanvasOnCharacter(1);
  };

  // Pointer Down on empty Canvas (pan or deselect)
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setSelectedCardId(null);
    setSelectedConnectionId(null);
    setIsPanning(true);
    userInteractedRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  // Global pointer listeners during connection drag so arrow line and target drop work reliably across the entire window
  useEffect(() => {
    if (!connectingState) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const coords = clientToCanvasCoords(e.clientX, e.clientY);
      setConnectingState((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null));
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      const coords = clientToCanvasCoords(e.clientX, e.clientY);

      // 1. Direct DOM check for target card element under cursor
      const hitEl = document.elementFromPoint(e.clientX, e.clientY);
      const cardEl = hitEl?.closest('[data-card-id]');
      const domCardId = cardEl?.getAttribute('data-card-id');

      let targetCard: RelationshipCard | undefined;
      if (domCardId && domCardId !== connectingState.fromCardId) {
        targetCard = cardMap.get(domCardId);
      }

      // 2. Coordinate bounding-box check fallback with generous 24px tolerance
      if (!targetCard) {
        targetCard = mapData.cards.find((c) => {
          if (c.id === connectingState.fromCardId) return false;
          const w = c.width || CARD_WIDTH;
          const h = getActualCardHeight(c, cardHeights);
          return (
            coords.x >= c.x - 24 &&
            coords.x <= c.x + w + 24 &&
            coords.y >= c.y - 24 &&
            coords.y <= c.y + h + 24
          );
        });
      }

      if (targetCard) {
        const fromCard = cardMap.get(connectingState.fromCardId);
        if (fromCard) {
          const { toSide } = getBestSides(
            fromCard,
            targetCard,
            connectingState.fromSide,
            undefined,
            cardHeights
          );
          const newConn: RelationshipConnection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            fromId: connectingState.fromCardId,
            toId: targetCard.id,
            type: 'ally',
            fromSide: connectingState.fromSide,
            toSide,
            isBidirectional: true,
          };
          updateMapData(mapData.cards, [...mapData.connections, newConn]);
          setSelectedConnectionId(newConn.id);
          setSelectedCardId(null);
        }
      }

      setConnectingState(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [connectingState, clientToCanvasCoords, cardMap, mapData.cards, mapData.connections, cardHeights, updateMapData]);

  // Unified Pointer Move on Canvas
  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    // 1. If dragging a connection handle
    if (connectingState) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const coords = clientToCanvasCoords(clientX, clientY);
        setConnectingState((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null));
      });
      return;
    }

    // 2. If dragging a card
    if (draggingCard) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const dx = (clientX - draggingCard.startX) / zoom;
        const dy = (clientY - draggingCard.startY) / zoom;
        const newX = Math.round(draggingCard.initialX + dx);
        const newY = Math.round(draggingCard.initialY + dy);

        const nextCards = mapData.cards.map((c) => (c.id === draggingCard.cardId ? { ...c, x: newX, y: newY } : c));
        updateMapData(nextCards, mapData.connections);
      });
      return;
    }

    // 3. If panning canvas
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: Math.round(panStartRef.current.initialPanX + dx),
        y: Math.round(panStartRef.current.initialPanY + dy),
      });
    }
  };

  // Unified Pointer Up on Canvas
  const handlePointerUpCanvas = (e: React.PointerEvent) => {
    // Finish connection drag fallback
    if (connectingState) {
      const coords = clientToCanvasCoords(e.clientX, e.clientY);
      const targetCard = mapData.cards.find((c) => {
        if (c.id === connectingState.fromCardId) return false;
        const w = c.width || CARD_WIDTH;
        const h = getActualCardHeight(c, cardHeights);
        return coords.x >= c.x - 24 && coords.x <= c.x + w + 24 && coords.y >= c.y - 24 && coords.y <= c.y + h + 24;
      });

      if (targetCard) {
        const fromCard = cardMap.get(connectingState.fromCardId);
        if (fromCard) {
          const { toSide } = getBestSides(
            fromCard,
            targetCard,
            connectingState.fromSide,
            undefined,
            cardHeights
          );
          const newConn: RelationshipConnection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            fromId: connectingState.fromCardId,
            toId: targetCard.id,
            type: 'ally',
            fromSide: connectingState.fromSide,
            toSide,
            isBidirectional: true,
          };
          updateMapData(mapData.cards, [...mapData.connections, newConn]);
          setSelectedConnectionId(newConn.id);
          setSelectedCardId(null);
        }
      }
      setConnectingState(null);
    }

    if (draggingCard) {
      setDraggingCard(null);
    }
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCardId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateCard(selectedCardId, { imageUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const focusedCard = selectedCardId ? cardMap.get(selectedCardId) || null : null;
  const focusedConnection = selectedConnectionId
    ? mapData.connections.find((c) => c.id === selectedConnectionId) || null
    : null;

  return (
    <div className="relative w-full">
      {/* ========================================================================= */}
      {/* 1. MOBILE PLACEHOLDER (В мобильной версии схема недоступна, no-print) */}
      {/* ========================================================================= */}
      <div
        className={`block sm:hidden no-print w-full max-w-lg mx-auto my-6 p-6 sm:p-8 rounded-xl border text-center transition-colors shadow-lg ${
          isDark
            ? 'bg-[#141418] border-red-950/60 text-zinc-200 shadow-black/80'
            : 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-400/25'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-inner"
            style={{
              borderColor: accentColor || '#ef4444',
              backgroundColor: (accentColor || '#ef4444') + '1a',
              color: accentColor || '#ef4444',
            }}
          >
            <Network className="w-7 h-7" />
          </div>
          <h3 className={`text-base sm:text-lg font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            В мобильной версии сайта схема отношений недоступна.
          </h3>
          <p className={`text-xs max-w-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Для комфортного построения и редактирования диаграммы связей персонажей, котерий и доменов, пожалуйста, откройте сайт на планшете или компьютере.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLET & DESKTOP INTERACTIVE MAP (Доступна на планшетах, ПК и при печати) */}
      {/* Лист имеет полную ширину A4. Кнопка и меню разворачиваются ПОВЕРХ листа. */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex print:flex flex-col xl:flex-row justify-center items-center xl:items-start gap-4 xl:gap-6 px-1 sm:px-3 w-full pb-10">
        {/* ========================================================================= */}
        {/* DESKTOP SIDEBAR (Слева от листа персонажа, ВСЕГДА развернуто на ПК) */}
        {/* ========================================================================= */}
        <aside
          id="vtm-map-sidebar-desktop"
          className="no-print hidden xl:block w-72 2xl:w-80 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar rounded-xl shadow-xl z-20"
        >
          <RelationshipMapSidebar
            isDark={isDark}
            mapData={mapData}
            cardMap={cardMap}
            focusedCard={focusedCard}
            focusedConnection={focusedConnection}
            isOverlayMode={false}
            onClearCardSelection={() => setSelectedCardId(null)}
            onClearConnectionSelection={() => setSelectedConnectionId(null)}
            onInvertConnection={handleInvertConnection}
            onToggleBidirectional={(connectionId) => {
              const nextConns = mapData.connections.map((c) =>
                c.id === connectionId ? { ...c, isBidirectional: !c.isBidirectional } : c
              );
              updateMapData(mapData.cards, nextConns);
            }}
            onChangeConnectionLabel={(connectionId, label) => {
              const nextConns = mapData.connections.map((c) =>
                c.id === connectionId ? { ...c, customLabel: label } : c
              );
              updateMapData(mapData.cards, nextConns);
            }}
            onChangeConnectionType={handleChangeConnectionType}
            onDeleteConnection={handleDeleteConnection}
            onUpdateCard={updateCard}
            onImageUpload={handleImageUpload}
            onDuplicateCard={duplicateCard}
            onDeleteCard={deleteCard}
            onAddNewCard={handleAddNewCard}
            onAddMyCharacter={handleAddMyCharacter}
          />
        </aside>

        {/* ========================================================================= */}
        {/* THE VERTICAL PRINTABLE SHEET (Стандартный вертикальный лист А4) */}
        {/* ========================================================================= */}
        <div
          className={`relative w-full max-w-[210mm] mx-auto xl:mx-0 p-3 sm:p-5 md:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-relationship flex flex-col justify-start ${
            isDark
              ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800'
              : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
          }`}
          style={{
            boxShadow: isDark
              ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
              : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
          }}
        >
          <SheetHeader
            pageTitle="Схема отношений"
            themeMode={isDark ? 'dark' : 'light'}
            accentColor={accentColor}
            textColor={textColor}
            primaryTextColor={primaryTextColor}
            accentTextColor={accentTextColor}
          />

          {/* Canvas Area with Zoom/Pan controls, Obsidian Handles and Floating Sidebar */}
          <div className="relative w-full my-1">
            {/* Кнопка разворачивания меню схемы отношений (только для планшетов < xl, на ПК скрыта) */}
            {!isSidebarOpen && (
              <div className="no-print xl:hidden absolute top-3 left-3 z-20">
                <button
                  type="button"
                  id="btn-open-map-sidebar"
                  onClick={toggleSidebar}
                  className={`xl:hidden px-3 py-2 rounded-xl border shadow-lg cursor-pointer transition-all flex items-center gap-2 font-serif font-semibold text-xs group backdrop-blur-md ${
                    isDark
                      ? 'bg-zinc-950/90 border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:text-white shadow-black/80'
                      : 'bg-white/95 border-zinc-300 text-zinc-900 hover:bg-zinc-50 shadow-zinc-400/40'
                  }`}
                  title="Развернуть меню схемы отношений поверх листа"
                  aria-label="Развернуть меню схемы отношений поверх листа"
                >
                  <SlidersHorizontal className="w-4 h-4 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-sans font-medium whitespace-nowrap">Меню схемы</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            )}

            {/* Меню схемы отношений поверх листа (только для планшетов < xl, на ПК меню слева) */}
            {isSidebarOpen && (
              <aside
                id="vtm-map-sidebar-overlay"
                className="no-print xl:hidden absolute top-3 left-3 z-30 w-72 sm:w-80 max-w-[calc(100%-24px)] max-h-[82vh] overflow-y-auto no-scrollbar shadow-2xl rounded-xl transition-all"
              >
                <RelationshipMapSidebar
                  isDark={isDark}
                  mapData={mapData}
                  cardMap={cardMap}
                  focusedCard={focusedCard}
                  focusedConnection={focusedConnection}
                  isOverlayMode={true}
                  onToggleSidebar={toggleSidebar}
                  onClearCardSelection={() => setSelectedCardId(null)}
                  onClearConnectionSelection={() => setSelectedConnectionId(null)}
                  onInvertConnection={handleInvertConnection}
                  onToggleBidirectional={(connectionId) => {
                    const nextConns = mapData.connections.map((c) =>
                      c.id === connectionId ? { ...c, isBidirectional: !c.isBidirectional } : c
                    );
                    updateMapData(mapData.cards, nextConns);
                  }}
                  onChangeConnectionLabel={(connectionId, label) => {
                    const nextConns = mapData.connections.map((c) =>
                      c.id === connectionId ? { ...c, customLabel: label } : c
                    );
                    updateMapData(mapData.cards, nextConns);
                  }}
                  onChangeConnectionType={handleChangeConnectionType}
                  onDeleteConnection={handleDeleteConnection}
                  onUpdateCard={updateCard}
                  onImageUpload={handleImageUpload}
                  onDuplicateCard={duplicateCard}
                  onDeleteCard={deleteCard}
                  onAddNewCard={handleAddNewCard}
                  onAddMyCharacter={handleAddMyCharacter}
                />
              </aside>
            )}

          {/* Floating Zoom & Pan Controls on Canvas (no-print) */}
          <div
            className={`no-print absolute top-3 right-3 z-20 flex items-center gap-1 backdrop-blur-md border rounded-lg p-1 shadow-md transition-colors ${
              isDark
                ? 'bg-zinc-950/85 border-zinc-800 text-zinc-300 shadow-black/60'
                : 'bg-white/95 border-zinc-300 text-zinc-800 shadow-zinc-400/40'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                userInteractedRef.current = true;
                setZoom((prev) => Math.min(2.2, +(prev + 0.15).toFixed(2)));
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Приблизить (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span
              className={`text-[10px] font-mono px-1 font-bold ${
                isDark ? 'text-zinc-300' : 'text-zinc-800'
              }`}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                userInteractedRef.current = true;
                setZoom((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)));
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Отдалить (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className={`w-[1px] h-3.5 mx-0.5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button
              type="button"
              onClick={handleResetView}
              className={`p-1 rounded transition-colors text-[10px] font-serif cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Сбросить масштаб и центрировать на персонаже (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Canvas Viewport Frame */}
          <div
            ref={canvasContainerRef}
            onPointerDown={handlePointerDownCanvas}
            onPointerMove={handlePointerMoveCanvas}
            onPointerUp={handlePointerUpCanvas}
            className={`sheet-relationship-canvas-area print-calib-relationship-canvas relative w-full rounded-xl border overflow-hidden transition-colors shadow-inner select-none cursor-grab active:cursor-grabbing ${
              isDark ? 'bg-[#0d0d10] border-zinc-800' : 'bg-[#fcfaf7] border-zinc-300'
            }`}
            style={{
              height: relationshipMapHeight,
              minHeight: 520,
              // Obsidian subtle dot grid
              backgroundImage: isDark
                ? 'radial-gradient(rgba(120, 120, 140, 0.22) 1.2px, transparent 1.2px)'
                : 'radial-gradient(rgba(180, 160, 140, 0.35) 1.2px, transparent 1.2px)',
              backgroundSize: `${Math.round(24 * zoom)}px ${Math.round(24 * zoom)}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          >
            {/* Transform Container for Zoom and Pan */}
            <div
              className="absolute inset-0 origin-top-left pointer-events-none overflow-visible"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                width: CANVAS_VIRTUAL_WIDTH,
                height: CANVAS_VIRTUAL_HEIGHT,
                overflow: 'visible',
              }}
            >
              {/* ------------------------------------------------------------- */}
              {/* SVG CONNECTION LINES LAYER */}
              {/* ------------------------------------------------------------- */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                style={{
                  zIndex: 1,
                  width: CANVAS_VIRTUAL_WIDTH,
                  height: CANVAS_VIRTUAL_HEIGHT,
                  overflow: 'visible',
                }}
              >
                <defs>
                  {Object.values(CONNECTION_STYLES).map((st) => (
                    <React.Fragment key={st.type}>
                      {/* Arrow marker pointing precisely to target edge (refX=10, tip at x=10) */}
                      <marker
                        id={`v5-arrow-end-${st.type}`}
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="7"
                        markerHeight="7"
                        orient="auto"
                        overflow="visible"
                      >
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={st.color} />
                      </marker>
                      {/* Arrow marker pointing precisely to source edge for bidirectional links */}
                      <marker
                        id={`v5-arrow-start-${st.type}`}
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="7"
                        markerHeight="7"
                        orient="auto-start-reverse"
                        overflow="visible"
                      >
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={st.color} />
                      </marker>
                    </React.Fragment>
                  ))}
                  {/* Dynamic marker for dragging connection */}
                  <marker
                    id="v5-arrow-drag"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto"
                    overflow="visible"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Draw existing connections */}
                {mapData.connections.map((conn) => {
                  const fromCard = cardMap.get(conn.fromId);
                  const toCard = cardMap.get(conn.toId);
                  if (!fromCard || !toCard) return null;

                  const styleConfig = CONNECTION_STYLES[conn.type] || CONNECTION_STYLES.other;
                  const { fromSide, toSide } = getBestSides(fromCard, toCard, conn.fromSide, conn.toSide, cardHeights);

                  const p1 = getSideCoordinates(fromCard, fromSide, cardHeights);
                  const p2 = getSideCoordinates(toCard, toSide, cardHeights);

                  const { path, midX, midY } = buildBezierPath(p1, fromSide, p2, toSide);
                  const isSelected = selectedConnectionId === conn.id;

                  return (
                    <g key={conn.id} className="pointer-events-auto cursor-pointer group">
                      {/* Invisible wider hit area for easy click */}
                      <path
                        d={path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConnectionId(conn.id);
                          setSelectedCardId(null);
                        }}
                      />

                      {/* Visible connection path */}
                      <path
                        d={path}
                        fill="none"
                        stroke={isSelected ? '#ef4444' : styleConfig.color}
                        strokeWidth={isSelected ? styleConfig.strokeWidth + 1.5 : styleConfig.strokeWidth}
                        strokeDasharray={styleConfig.strokeDasharray || 'none'}
                        markerEnd={`url(#v5-arrow-end-${conn.type})`}
                        markerStart={conn.isBidirectional ? `url(#v5-arrow-start-${conn.type})` : undefined}
                        opacity={isSelected ? 1 : 0.88}
                        className="transition-all group-hover:opacity-100"
                      />

                      {/* Label badge at midpoint */}
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConnectionId(conn.id);
                          setSelectedCardId(null);
                        }}
                      >
                        {(() => {
                          const labelText = conn.customLabel || styleConfig.label;
                          // Динамическая ширина плашки под длину текста
                          const badgeWidth = Math.max(46, Math.round(labelText.length * 6.6 + 18));
                          const badgeHalfWidth = Math.round(badgeWidth / 2);
                          return (
                            <>
                              <rect
                                x={-badgeHalfWidth}
                                y="-10"
                                width={badgeWidth}
                                height="20"
                                rx="10"
                                fill={isDark ? '#141418' : '#ffffff'}
                                stroke={isSelected ? '#ef4444' : styleConfig.color}
                                strokeWidth="1.2"
                                className="shadow-sm"
                              />
                              <text
                                x="0"
                                y="3.5"
                                textAnchor="middle"
                                fill={isDark ? '#f4f4f5' : '#18181b'}
                                fontSize="9.5"
                                fontWeight="bold"
                                fontFamily="serif"
                              >
                                {labelText}
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    </g>
                  );
                })}

                {/* Live Connection Drag Line (Rubber band while pulling from handle) */}
                {connectingState && (
                  <path
                    d={`M ${connectingState.startX} ${connectingState.startY} Q ${
                      (connectingState.startX + connectingState.currentX) / 2
                    } ${(connectingState.startY + connectingState.currentY) / 2 - 20} ${
                      connectingState.currentX
                    } ${connectingState.currentY}`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="6, 3"
                    markerEnd="url(#v5-arrow-drag)"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* ------------------------------------------------------------- */}
              {/* CARDS LAYER */}
              {/* ------------------------------------------------------------- */}
              {mapData.cards.map((card) => {
                const isSelected = selectedCardId === card.id;
                const typeConfig = CARD_TYPES.find((t) => t.id === card.type) || CARD_TYPES[0];
                const clanData = card.clan ? CLAN_THEMES[card.clan as ClanId] : null;

                return (
                  <div
                    key={card.id}
                    data-card-id={card.id}
                    ref={(el) => {
                      if (el) registerCardHeight(card.id, el.offsetHeight);
                    }}
                    style={{
                      left: card.x,
                      top: card.y,
                      width: CARD_WIDTH,
                      zIndex: isSelected ? 20 : 10,
                      willChange: 'transform',
                    }}
                    onPointerDown={(e) => handlePointerDownCard(card, e)}
                    className={`absolute rounded-xl border p-2 transition-all shadow-md cursor-grab active:cursor-grabbing pointer-events-auto group ${
                      isSelected
                        ? 'ring-2 ring-red-500 border-red-500 shadow-xl shadow-red-950/60'
                        : connectingState && connectingState.fromCardId !== card.id
                        ? isDark
                          ? 'bg-[#18181c]/95 border-red-500/70 ring-2 ring-red-500/25 shadow-lg'
                          : 'bg-white/95 border-red-400 ring-2 ring-red-400/25 shadow-lg'
                        : isDark
                        ? 'bg-[#18181c]/95 border-zinc-800 hover:border-zinc-700 hover:shadow-lg'
                        : 'bg-white/95 border-zinc-300 hover:border-zinc-400 hover:shadow-lg'
                    }`}
                  >
                    {/* OBSIDIAN 4 EDGE HANDLES */}
                    <div className="no-print">
                      {/* Top Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownHandle(card, 'top', e)}
                        title="Потяните для создания связи"
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-30 transition-all ${
                          isSelected || (connectingState?.fromCardId === card.id && connectingState.fromSide === 'top')
                            ? 'opacity-100 pointer-events-auto'
                            : connectingState
                            ? 'opacity-80 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border shadow transition-transform group-hover:scale-125 ${
                            connectingState?.fromCardId === card.id && connectingState.fromSide === 'top'
                              ? 'bg-red-500 ring-2 ring-red-400 scale-125 border-white'
                              : isDark
                              ? 'bg-zinc-400 hover:bg-red-500 border-zinc-900'
                              : 'bg-zinc-400 hover:bg-red-500 border-white'
                          }`}
                        />
                      </div>

                      {/* Bottom Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownHandle(card, 'bottom', e)}
                        title="Потяните для создания связи"
                        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-30 transition-all ${
                          isSelected || (connectingState?.fromCardId === card.id && connectingState.fromSide === 'bottom')
                            ? 'opacity-100 pointer-events-auto'
                            : connectingState
                            ? 'opacity-80 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border shadow transition-transform group-hover:scale-125 ${
                            connectingState?.fromCardId === card.id && connectingState.fromSide === 'bottom'
                              ? 'bg-red-500 ring-2 ring-red-400 scale-125 border-white'
                              : isDark
                              ? 'bg-zinc-400 hover:bg-red-500 border-zinc-900'
                              : 'bg-zinc-400 hover:bg-red-500 border-white'
                          }`}
                        />
                      </div>

                      {/* Left Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownHandle(card, 'left', e)}
                        title="Потяните для создания связи"
                        className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-30 transition-all ${
                          isSelected || (connectingState?.fromCardId === card.id && connectingState.fromSide === 'left')
                            ? 'opacity-100 pointer-events-auto'
                            : connectingState
                            ? 'opacity-80 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border shadow transition-transform group-hover:scale-125 ${
                            connectingState?.fromCardId === card.id && connectingState.fromSide === 'left'
                              ? 'bg-red-500 ring-2 ring-red-400 scale-125 border-white'
                              : isDark
                              ? 'bg-zinc-400 hover:bg-red-500 border-zinc-900'
                              : 'bg-zinc-400 hover:bg-red-500 border-white'
                          }`}
                        />
                      </div>

                      {/* Right Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownHandle(card, 'right', e)}
                        title="Потяните для создания связи"
                        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-30 transition-all ${
                          isSelected || (connectingState?.fromCardId === card.id && connectingState.fromSide === 'right')
                            ? 'opacity-100 pointer-events-auto'
                            : connectingState
                            ? 'opacity-80 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border shadow transition-transform group-hover:scale-125 ${
                            connectingState?.fromCardId === card.id && connectingState.fromSide === 'right'
                              ? 'bg-red-500 ring-2 ring-red-400 scale-125 border-white'
                              : isDark
                              ? 'bg-zinc-400 hover:bg-red-500 border-zinc-900'
                              : 'bg-zinc-400 hover:bg-red-500 border-white'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Card Content Header */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full border shrink-0 overflow-hidden flex items-center justify-center ${
                          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'
                        }`}
                      >
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : card.type === 'faction' ? (
                          <Users className="w-5 h-5 text-emerald-500" />
                        ) : card.type === 'location' ? (
                          <Home className="w-5 h-5 text-indigo-500" />
                        ) : card.type === 'player' ? (
                          <User className="w-5 h-5 text-blue-500" />
                        ) : (card.type === 'pc' || card.type === 'npc') && clanData ? (
                          <ClanSymbol
                            clan={card.clan as ClanId}
                            className="w-5 h-5 object-contain"
                            color={clanData.accentColor}
                          />
                        ) : (
                          <User className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>

                      {/* Name & Badges */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[11px] font-serif font-bold truncate leading-tight ${
                          isDark ? 'text-white' : 'text-zinc-900'
                        }`}>
                          {card.name || 'Без имени'}
                        </h4>

                        <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                          {/* Type badge with dynamic contrast */}
                          {(() => {
                            const badgeStyle = getBadgeContrastStyle(typeConfig.color, isDark);
                            return (
                              <span
                                className="text-[8.5px] px-1.5 py-0.5 rounded font-sans border font-semibold tracking-wide"
                                style={badgeStyle}
                              >
                                {typeConfig.label.split(' ')[0]}
                              </span>
                            );
                          })()}

                          {/* Clan badge with dynamic contrast ONLY for PC and NPC characters */}
                          {(card.type === 'pc' || card.type === 'npc') && (card.customClanName || clanData) && (() => {
                            const clanColor = clanData?.accentColor || '#ef4444';
                            const badgeStyle = getBadgeContrastStyle(clanColor, isDark);
                            return (
                              <span
                                className="text-[8.5px] px-1.5 py-0.5 rounded font-serif border font-semibold truncate max-w-[85px]"
                                style={badgeStyle}
                              >
                                {card.customClanName || clanData?.name}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Notes snippet */}
                    {card.notes && (
                      <p className={`mt-1.5 text-[9.5px] font-serif leading-tight line-clamp-2 italic border-t pt-1 ${
                        isDark ? 'text-zinc-300 border-zinc-800/60' : 'text-zinc-600 border-zinc-200'
                      }`}>
                        {card.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom helper tip */}
          <div className={`flex items-center justify-between text-[10.5px] font-serif pt-1.5 px-1 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-red-500" />
              <span>
                Тяните за точки по краям карточек (появляются при наведении) для создания связи. Клик на стрелку открывает меню настройки.
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
