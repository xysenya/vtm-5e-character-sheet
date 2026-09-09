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
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sidebar visibility (collapsible on small screens)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

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
    const newCard: RelationshipCard = {
      ...orig,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${orig.name} (копия)`,
      x: orig.x + 30,
      y: orig.y + 30,
    };
    updateMapData([...mapData.cards, newCard], mapData.connections);
    setSelectedCardId(newCard.id);
    setSelectedConnectionId(null);
  };

  // Add new card
  const handleAddNewCard = (type: RelationshipCardType = 'npc') => {
    const offset = (mapData.cards.length % 5) * 28;
    const newCard: RelationshipCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: type === 'location' ? 'Новое убежище' : type === 'faction' ? 'Новая котерия' : type === 'player' ? 'Игрок' : 'Новый персонаж',
      type,
      clan: type === 'location' || type === 'faction' || type === 'player' ? undefined : 'ventrue',
      notes: '',
      x: 180 + offset,
      y: 160 + offset,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
    updateMapData([...mapData.cards, newCard], mapData.connections);
    setSelectedCardId(newCard.id);
    setSelectedConnectionId(null);
  };

  // Add player character
  const handleAddMyCharacter = () => {
    const defaultCard: RelationshipCard = {
      id: 'char-main-' + Date.now(),
      name: sheet.info?.name || 'Мой персонаж',
      type: 'pc',
      clan: sheet.info?.clan || 'ventrue',
      customClanName: sheet.info?.customClanName,
      imageUrl: sheet.v5Bio?.portraitUrl || '',
      notes: `${sheet.info?.concept || 'Амплуа не указано'}, ${sheet.info?.generation || 13}-е поколение`,
      x: 220,
      y: 180,
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

  // Reset Zoom & Pan and center canvas on the player character card (or first card if multiple/none)
  const handleResetView = () => {
    const targetZoom = 1;
    setZoom(targetZoom);

    const container = canvasContainerRef.current;
    const viewportWidth = container ? container.clientWidth : 750;
    const viewportHeight = container ? container.clientHeight : 520;

    // Pick first PC card, or fallback to first card
    const targetCard = mapData.cards.find((c) => c.type === 'pc') || mapData.cards[0];

    if (targetCard) {
      const cardWidth = targetCard.width || CARD_WIDTH;
      const cardHeight = getActualCardHeight(targetCard, cardHeights);
      const cardCenterX = targetCard.x + cardWidth / 2;
      const cardCenterY = targetCard.y + cardHeight / 2;

      const newPanX = Math.round(viewportWidth / 2 - cardCenterX * targetZoom);
      const newPanY = Math.round(viewportHeight / 2 - cardCenterY * targetZoom);

      setPan({ x: newPanX, y: newPanY });
    } else {
      setPan({ x: 0, y: 0 });
    }
  };

  // Pointer Down on empty Canvas (pan or deselect)
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setSelectedCardId(null);
    setSelectedConnectionId(null);
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  // Unified Pointer Move on Canvas
  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    // 1. If dragging a connection handle
    if (connectingState) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const coords = clientToCanvasCoords(e.clientX, e.clientY);
        setConnectingState((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null));
      });
      return;
    }

    // 2. If dragging a card
    if (draggingCard) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const dx = (e.clientX - draggingCard.startX) / zoom;
        const dy = (e.clientY - draggingCard.startY) / zoom;
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
    // Finish connection drag
    if (connectingState) {
      const coords = clientToCanvasCoords(e.clientX, e.clientY);
      // Find card under pointer (excluding source card)
      const targetCard = mapData.cards.find((c) => {
        if (c.id === connectingState.fromCardId) return false;
        const w = c.width || CARD_WIDTH;
        const h = getActualCardHeight(c, cardHeights);
        return coords.x >= c.x - 15 && coords.x <= c.x + w + 15 && coords.y >= c.y - 15 && coords.y <= c.y + h + 15;
      });

      if (targetCard) {
        // Determine target side closest to drop point
        const { toSide } = getBestSides(
          cardMap.get(connectingState.fromCardId)!,
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
    <div className="relative w-full flex flex-col xl:flex-row justify-center items-center xl:items-start gap-5 px-1 sm:px-2">
      {/* ========================================================================= */}
      {/* 1. ANCHORED SIDEBAR MENU (Слева от листа со схемой, no-print) */}
      {/* ========================================================================= */}
      <aside className="no-print w-full max-w-[340px] xl:w-80 shrink-0 sticky top-4 self-start z-20">
        <div
          className={`w-full rounded-xl border p-4 shadow-xl transition-colors flex flex-col gap-3.5 backdrop-blur-md ${
            isDark
              ? 'bg-[#141418] border-zinc-750 text-zinc-200 shadow-black/80'
              : 'bg-white border-zinc-300 text-zinc-900 shadow-xl shadow-zinc-400/25 ring-1 ring-zinc-200'
          }`}
        >
          {/* ------------------------------------------------------------- */}
          {/* CASE 1: CONNECTION IN FOCUS (Кликнули на стрелку) */}
          {/* ------------------------------------------------------------- */}
          {focusedConnection ? (
            <div className="space-y-3.5">
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-zinc-700/60' : 'border-zinc-200'}`}>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CONNECTION_STYLES[focusedConnection.type]?.color || '#ef4444' }}
                  />
                  <h3 className={`font-serif font-bold text-sm ${isDark ? 'text-white' : '!text-zinc-900'}`}>Настройка связи</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConnectionId(null)}
                  className={`p-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Снять выбор</span>
                </button>
              </div>

              {/* Connected Cards summary */}
              <div className={`p-2 rounded border text-xs flex items-center justify-between ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
              }`}>
                <div className="truncate font-serif">
                  <strong className={`block truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{cardMap.get(focusedConnection.fromId)?.name || 'А'}</strong>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Начало ({focusedConnection.fromSide || 'сторона'})</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-500 shrink-0 mx-2" />
                <div className="truncate text-right font-serif">
                  <strong className={`block truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{cardMap.get(focusedConnection.toId)?.name || 'Б'}</strong>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Конец ({focusedConnection.toSide || 'сторона'})</span>
                </div>
              </div>

              {/* Invert Direction & Bidirectional Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInvertConnection(focusedConnection.id)}
                  className={`flex-1 px-2.5 py-1.5 border text-xs rounded font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-serif ${
                    isDark
                      ? 'bg-red-950/40 hover:bg-red-900/60 border-red-800/60 text-red-200'
                      : 'bg-red-50 hover:bg-red-100 border-red-300 text-red-800'
                  }`}
                  title="Поменять направление стрелки между карточками"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Инвертировать</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextConns = mapData.connections.map((c) =>
                      c.id === focusedConnection.id ? { ...c, isBidirectional: !c.isBidirectional } : c
                    );
                    updateMapData(mapData.cards, nextConns);
                  }}
                  className={`px-2.5 py-1.5 border rounded text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer font-serif ${
                    focusedConnection.isBidirectional
                      ? isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                      : isDark
                      ? 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                  }`}
                  title="Сделать связь обоюдной (стрелки с обоих концов)"
                >
                  <span>{focusedConnection.isBidirectional ? 'Двунаправленная' : 'Односторонняя'}</span>
                </button>
              </div>

              {/* Custom Label */}
              <div className="space-y-1">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Подпись связи
                </label>
                <input
                  type="text"
                  value={focusedConnection.customLabel || ''}
                  onChange={(e) => {
                    const nextConns = mapData.connections.map((c) =>
                      c.id === focusedConnection.id ? { ...c, customLabel: e.target.value } : c
                    );
                    updateMapData(mapData.cards, nextConns);
                  }}
                  placeholder={CONNECTION_STYLES[focusedConnection.type]?.label || 'Особое примечание...'}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white focus:border-red-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-red-600'
                  }`}
                />
              </div>

              {/* 12 Relationship Types selector */}
              <div className="space-y-1.5">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Выберите тип связи:
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {Object.values(CONNECTION_STYLES).map((style) => (
                    <button
                      key={style.type}
                      type="button"
                      onClick={() => handleChangeConnectionType(focusedConnection.id, style.type)}
                      className={`w-full text-left p-1.5 rounded border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        focusedConnection.type === style.type
                          ? isDark
                            ? 'ring-2 ring-red-500 bg-red-950/60 border-red-600 font-bold text-white'
                            : 'ring-2 ring-red-400 bg-red-50 border-red-400 font-bold text-red-900'
                          : isDark
                          ? 'bg-zinc-900/70 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
                        <span className="truncate font-serif">{style.label}</span>
                      </div>
                      <ConnectionArrowPreview styleConfig={style} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete Connection */}
              <div className={`pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <button
                  type="button"
                  onClick={() => handleDeleteConnection(focusedConnection.id)}
                  className={`w-full px-2.5 py-1.5 border rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-serif ${
                    isDark
                      ? 'bg-red-950/40 hover:bg-red-900/60 border-red-900/60 text-red-400 hover:text-red-200'
                      : 'bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-900'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить эту связь</span>
                </button>
              </div>
            </div>
          ) : focusedCard ? (
            /* ------------------------------------------------------------- */
            /* CASE 2: CARD IN FOCUS (Кликнули на карточку) */
            /* ------------------------------------------------------------- */
            <div className="space-y-3.5">
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-zinc-700/60' : 'border-zinc-200'}`}>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        CARD_TYPES.find((t) => t.id === focusedCard.type)?.color || '#ef4444',
                    }}
                  />
                  <h3 className={`font-serif font-bold text-sm ${isDark ? 'text-white' : '!text-zinc-900'}`}>Карточка в фокусе</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCardId(null)}
                  className={`p-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Закрыть</span>
                </button>
              </div>

              {/* Card Image */}
              <div className="space-y-1.5">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Изображение
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg border-2 overflow-hidden flex items-center justify-center shrink-0 relative ${
                      isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'
                    }`}
                  >
                    {focusedCard.imageUrl ? (
                      <img
                        src={focusedCard.imageUrl}
                        alt={focusedCard.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        {focusedCard.type === 'faction' ? (
                          <Users className="w-6 h-6 text-emerald-500" />
                        ) : focusedCard.type === 'location' ? (
                          <Home className="w-6 h-6 text-indigo-500" />
                        ) : focusedCard.type === 'player' ? (
                          <User className="w-6 h-6 text-blue-500" />
                        ) : (focusedCard.type === 'pc' || focusedCard.type === 'npc') && focusedCard.clan && CLAN_THEMES[focusedCard.clan as ClanId] ? (
                          <ClanSymbol
                            clan={focusedCard.clan as ClanId}
                            className="w-7 h-7 opacity-70"
                            color={CLAN_THEMES[focusedCard.clan as ClanId]?.accentColor}
                          />
                        ) : (
                          <User className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full px-2.5 py-1 border text-xs rounded font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-red-950/40 hover:bg-red-900/60 border-red-800/60 text-red-200'
                          : 'bg-red-50 hover:bg-red-100 border-red-300 text-red-800'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Загрузить фото</span>
                    </button>
                    {focusedCard.imageUrl && (
                      <button
                        type="button"
                        onClick={() => updateCard(focusedCard.id, { imageUrl: '' })}
                        className={`text-[10px] cursor-pointer block text-center w-full ${
                          isDark ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-500 hover:text-red-600'
                        }`}
                      >
                        Удалить фото
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Имя / Название
                </label>
                <input
                  type="text"
                  value={focusedCard.name}
                  onChange={(e) => updateCard(focusedCard.id, { name: e.target.value })}
                  placeholder="Имя Сородича, котерии или домена"
                  className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white focus:border-red-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-red-600'
                  }`}
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Тип карточки
                </label>
                <select
                  value={focusedCard.type}
                  onChange={(e) => {
                    const nextType = e.target.value as RelationshipCardType;
                    const patch: Partial<RelationshipCard> = { type: nextType };
                    if (nextType === 'faction' || nextType === 'location' || nextType === 'player') {
                      patch.clan = '';
                    }
                    updateCard(focusedCard.id, patch);
                  }}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white focus:border-red-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-red-600'
                  }`}
                >
                  {CARD_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clan selector (ONLY if character: PC or NPC) */}
              {(focusedCard.type === 'pc' || focusedCard.type === 'npc') && (
                <div className="space-y-1">
                  <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Клан Сородича
                  </label>
                  <select
                    value={focusedCard.clan || 'ventrue'}
                    onChange={(e) => updateCard(focusedCard.id, { clan: e.target.value as ClanId })}
                    className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-red-600'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-red-600'
                    }`}
                  >
                    <option value="">Без клана / Не Сородич</option>
                    {Object.values(CLAN_THEMES).map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name} ({cl.nameEn})
                      </option>
                    ))}
                    <option value="thinblood">Слабокровный (Thin-blood)</option>
                    <option value="mortal">Смертный (Mortal)</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className={`text-[10.5px] font-semibold uppercase tracking-wider block font-serif ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Заметки
                </label>
                <textarea
                  rows={2}
                  value={focusedCard.notes || ''}
                  onChange={(e) => updateCard(focusedCard.id, { notes: e.target.value })}
                  placeholder="Статус, секреты, положение в городе..."
                  className={`w-full px-2.5 py-1.5 text-xs rounded border resize-none transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white focus:border-red-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-red-600'
                  }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-2 border-t flex items-center gap-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <button
                  type="button"
                  onClick={() => duplicateCard(focusedCard.id)}
                  className={`flex-1 px-2 py-1.5 border rounded text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer font-serif ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Дубликат</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteCard(focusedCard.id)}
                  className={`px-2.5 py-1.5 border rounded text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer font-serif ${
                    isDark
                      ? 'bg-red-950/40 hover:bg-red-900/60 border-red-900/60 text-red-400 hover:text-red-200'
                      : 'bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-900'
                  }`}
                  title="Удалить карточку"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* CASE 3: NO SELECTION (Главное меню схемы) */
            /* ------------------------------------------------------------- */
            <div className="space-y-3">
              <div className={`pb-1 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <h3 className={`font-serif font-bold text-sm flex items-center gap-1.5 ${isDark ? 'text-white' : '!text-zinc-900'}`}>
                  <Link2 className="w-4 h-4 text-red-500" />
                  <span>Схема отношений</span>
                </h3>
                <p className={`text-[11px] font-serif leading-tight pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Потяните от круглых точек по краям карточки (как в Obsidian), чтобы провести связь.
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleAddNewCard('npc')}
                  className="w-full px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer font-serif"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Создать карточку</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddMyCharacter}
                  className={`w-full px-2.5 py-1 border rounded text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-serif ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-900/40'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  }`}
                  title="Добавить текущего персонажа с листа на холст"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Добавить моего персонажа</span>
                </button>
              </div>

              {/* Relationship Types Legend */}
              <div className="space-y-1">
                <span className={`text-[10px] font-semibold uppercase tracking-wider block font-sans ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Виды связей (12 типов):
                </span>
                <div className="space-y-1">
                  {Object.values(CONNECTION_STYLES).map((conn) => (
                    <div
                      key={conn.type}
                      className={`p-1.5 rounded border text-xs flex items-center justify-between gap-2 ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: conn.color }} />
                        <span className={`font-serif text-[11px] truncate font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{conn.label}</span>
                      </div>
                      <ConnectionArrowPreview styleConfig={conn} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections count summary */}
              <div className={`pt-2 border-t text-[11px] font-serif flex items-center justify-between ${
                isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'
              }`}>
                <span>Карточек: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{mapData.cards.length}</strong></span>
                <span>Связей: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{mapData.connections.length}</strong></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. THE VERTICAL PRINTABLE SHEET (Стандартный вертикальный лист А4) */}
      {/* ========================================================================= */}
      <div
        className={`relative w-full max-w-[210mm] shrink-0 p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-relationship flex flex-col justify-start ${
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

        {/* Canvas Area with Zoom/Pan controls and Obsidian Handles */}
        <div className="relative w-full my-1">
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
              onClick={() => setZoom((prev) => Math.min(2.2, +(prev + 0.15).toFixed(2)))}
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
              onClick={() => setZoom((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)))}
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
              className="absolute inset-0 origin-top-left pointer-events-none"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                width: CANVAS_VIRTUAL_WIDTH,
                height: CANVAS_VIRTUAL_HEIGHT,
              }}
            >
              {/* ------------------------------------------------------------- */}
              {/* SVG CONNECTION LINES LAYER */}
              {/* ------------------------------------------------------------- */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1, width: CANVAS_VIRTUAL_WIDTH, height: CANVAS_VIRTUAL_HEIGHT }}
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
                    className={`absolute rounded-xl border p-2 transition-shadow shadow-md cursor-grab active:cursor-grabbing pointer-events-auto group ${
                      isSelected
                        ? 'ring-2 ring-red-500 border-red-500 shadow-xl shadow-red-950/60'
                        : isDark
                        ? 'bg-[#18181c]/95 border-zinc-800 hover:border-zinc-700 hover:shadow-lg'
                        : 'bg-white/95 border-zinc-300 hover:border-zinc-400 hover:shadow-lg'
                    }`}
                  >
                    {/* OBSIDIAN 4 EDGE HANDLES (Отображаются ТОЛЬКО при наведении курсора на карточку) */}
                    <div className="no-print">
                      {/* Top Handle */}
                      <button
                        type="button"
                        onPointerDown={(e) => handlePointerDownHandle(card, 'top', e)}
                        title="Потяните вверх для создания связи"
                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-zinc-400 hover:bg-red-500 hover:scale-125 border ${
                          isDark ? 'border-zinc-900' : 'border-white'
                        } transition-all shadow cursor-crosshair ${
                          connectingState?.fromCardId === card.id
                            ? 'opacity-100 ring-2 ring-red-500 scale-110 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      />
                      {/* Bottom Handle */}
                      <button
                        type="button"
                        onPointerDown={(e) => handlePointerDownHandle(card, 'bottom', e)}
                        title="Потяните вниз для создания связи"
                        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-zinc-400 hover:bg-red-500 hover:scale-125 border ${
                          isDark ? 'border-zinc-900' : 'border-white'
                        } transition-all shadow cursor-crosshair ${
                          connectingState?.fromCardId === card.id
                            ? 'opacity-100 ring-2 ring-red-500 scale-110 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      />
                      {/* Left Handle */}
                      <button
                        type="button"
                        onPointerDown={(e) => handlePointerDownHandle(card, 'left', e)}
                        title="Потяните влево для создания связи"
                        className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-zinc-400 hover:bg-red-500 hover:scale-125 border ${
                          isDark ? 'border-zinc-900' : 'border-white'
                        } transition-all shadow cursor-crosshair ${
                          connectingState?.fromCardId === card.id
                            ? 'opacity-100 ring-2 ring-red-500 scale-110 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      />
                      {/* Right Handle */}
                      <button
                        type="button"
                        onPointerDown={(e) => handlePointerDownHandle(card, 'right', e)}
                        title="Потяните вправо для создания связи"
                        className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-zinc-400 hover:bg-red-500 hover:scale-125 border ${
                          isDark ? 'border-zinc-900' : 'border-white'
                        } transition-all shadow cursor-crosshair ${
                          connectingState?.fromCardId === card.id
                            ? 'opacity-100 ring-2 ring-red-500 scale-110 pointer-events-auto'
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                        }`}
                      />
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
                          <span
                            className={`text-[8.5px] px-1 py-0.2 rounded font-sans border font-medium ${typeConfig.badgeClass}`}
                          >
                            {typeConfig.label.split(' ')[0]}
                          </span>

                          {/* Clan badge ONLY for PC and NPC characters */}
                          {(card.type === 'pc' || card.type === 'npc') && clanData && (
                            <span
                              className="text-[8.5px] px-1 py-0.2 rounded font-serif border font-medium truncate max-w-[75px]"
                              style={{
                                borderColor: clanData.accentColor + '80',
                                color: clanData.accentColor,
                                backgroundColor: clanData.accentColor + '18',
                              }}
                            >
                              {clanData.name}
                            </span>
                          )}
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
  );
};
