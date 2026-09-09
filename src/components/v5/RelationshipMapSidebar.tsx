import React, { useRef } from 'react';
import {
  RelationshipCard,
  RelationshipConnection,
  RelationshipCardType,
  RelationshipConnectionType,
  ClanId,
} from '../../types';
import { CLAN_THEMES } from '../../data/clans';
import { ClanSymbol } from '../ClanSymbol';
import {
  SlidersHorizontal,
  ChevronLeft,
  X,
  ArrowRight,
  ArrowLeftRight,
  Trash2,
  Upload,
  Copy,
  Plus,
  Sparkles,
  Link2,
  Users,
  Home,
  User,
} from 'lucide-react';

export interface ConnectionStyleConfig {
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
    color: '#dc2626', // blood red
    strokeWidth: 3,
    description: 'Прямая связь обращения в вампира. Иерархия и долг крови.',
    iconName: 'Droplet',
  },
  blood_bond: {
    type: 'blood_bond',
    label: 'Узы крови',
    color: '#991b1b', // dark crimson
    strokeWidth: 3.5,
    strokeDasharray: '6, 3',
    description: 'Мистическое подчинение через вкушение витэ Сородича.',
    iconName: 'Heart',
  },
  liege_vassal: {
    type: 'liege_vassal',
    label: 'Сюзерен — Вассал',
    color: '#d97706', // amber gold
    strokeWidth: 2.5,
    description: 'Феодальная клятва верности, статус и подчинение в Камарилье.',
    iconName: 'Crown',
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

export const ConnectionArrowPreview: React.FC<{
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

export const CARD_TYPES: { id: RelationshipCardType; label: string; icon: any; color: string; badgeClass: string }[] = [
  { id: 'pc', label: 'Персонаж игрока', icon: User, color: '#a855f7', badgeClass: 'bg-purple-950/70 text-purple-300 border-purple-800' },
  { id: 'npc', label: 'Неигровой персонаж (NPC)', icon: User, color: '#f59e0b', badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800' },
  { id: 'player', label: 'Игрок', icon: User, color: '#3b82f6', badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-800' },
  { id: 'faction', label: 'Фракция / Котерия', icon: Users, color: '#10b981', badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' },
  { id: 'location', label: 'Место / Домен', icon: Home, color: '#6366f1', badgeClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-800' },
];

interface RelationshipMapSidebarProps {
  isDark?: boolean;
  mapData: {
    cards: RelationshipCard[];
    connections: RelationshipConnection[];
  };
  cardMap: Map<string, RelationshipCard>;
  focusedCard: RelationshipCard | null;
  focusedConnection: RelationshipConnection | null;
  isOverlayMode?: boolean;
  onToggleSidebar?: () => void;
  onClearCardSelection: () => void;
  onClearConnectionSelection: () => void;
  onInvertConnection: (connectionId: string) => void;
  onToggleBidirectional: (connectionId: string) => void;
  onChangeConnectionLabel: (connectionId: string, label: string) => void;
  onChangeConnectionType: (connectionId: string, type: RelationshipConnectionType) => void;
  onDeleteConnection: (connectionId: string) => void;
  onUpdateCard: (cardId: string, patch: Partial<RelationshipCard>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDuplicateCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onAddNewCard: (type: RelationshipCardType) => void;
  onAddMyCharacter: () => void;
}

export const RelationshipMapSidebar: React.FC<RelationshipMapSidebarProps> = ({
  isDark = true,
  mapData,
  cardMap,
  focusedCard,
  focusedConnection,
  isOverlayMode = false,
  onToggleSidebar,
  onClearCardSelection,
  onClearConnectionSelection,
  onInvertConnection,
  onToggleBidirectional,
  onChangeConnectionLabel,
  onChangeConnectionType,
  onDeleteConnection,
  onUpdateCard,
  onImageUpload,
  onDuplicateCard,
  onDeleteCard,
  onAddNewCard,
  onAddMyCharacter,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`w-full rounded-xl border p-3.5 sm:p-4 shadow-2xl transition-all flex flex-col gap-3 backdrop-blur-xl ${
        isDark
          ? 'bg-[#141418]/95 border-zinc-750 text-zinc-200 shadow-black/95 ring-1 ring-white/5'
          : 'bg-white/95 border-zinc-300 text-zinc-900 shadow-xl shadow-zinc-400/25 ring-1 ring-zinc-200'
      }`}
    >
      {/* Sidebar Top Bar: Title, Badges and Collapse Toggle */}
      <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-zinc-750' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <SlidersHorizontal className="w-4 h-4 text-red-500 shrink-0" />
          <h3 className={`font-serif font-bold text-xs sm:text-sm tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Меню схемы
          </h3>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-sans border font-medium ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
            }`}
          >
            {mapData.cards.length} карт. / {mapData.connections.length} связ.
          </span>
        </div>

        {isOverlayMode && onToggleSidebar && (
          <button
            type="button"
            id="btn-toggle-map-sidebar"
            onClick={onToggleSidebar}
            className={`px-2 py-1 rounded text-xs font-serif font-medium cursor-pointer transition-all flex items-center gap-1 border shadow-2xs ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-300 hover:text-black'
            }`}
            title="Свернуть меню"
            aria-label="Свернуть меню"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px]">Свернуть</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CASE 1: CONNECTION IN FOCUS (Кликнули на стрелку) */}
      {/* ------------------------------------------------------------- */}
      {focusedConnection ? (
        <div className="space-y-3.5">
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-zinc-700/60' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CONNECTION_STYLES[focusedConnection.type]?.color || '#ef4444' }}
              />
              <h3 className={`font-serif font-bold text-sm ${isDark ? 'text-white' : '!text-zinc-900'}`}>Настройка связи</h3>
            </div>
            <button
              type="button"
              onClick={onClearConnectionSelection}
              className={`p-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-[11px]">Снять выбор</span>
            </button>
          </div>

          {/* Connected Cards summary */}
          <div
            className={`p-2 rounded border text-xs flex items-center justify-between ${
              isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}
          >
            <div className="truncate font-serif">
              <strong className={`block truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {cardMap.get(focusedConnection.fromId)?.name || 'А'}
              </strong>
              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Начало ({focusedConnection.fromSide || 'сторона'})
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-red-500 shrink-0 mx-2" />
            <div className="truncate text-right font-serif">
              <strong className={`block truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {cardMap.get(focusedConnection.toId)?.name || 'Б'}
              </strong>
              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Конец ({focusedConnection.toSide || 'сторона'})
              </span>
            </div>
          </div>

          {/* Invert Direction & Bidirectional Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onInvertConnection(focusedConnection.id)}
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
              onClick={() => onToggleBidirectional(focusedConnection.id)}
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
              onChange={(e) => onChangeConnectionLabel(focusedConnection.id, e.target.value)}
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
                  onClick={() => onChangeConnectionType(focusedConnection.id, style.type)}
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
              onClick={() => onDeleteConnection(focusedConnection.id)}
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
                  backgroundColor: CARD_TYPES.find((t) => t.id === focusedCard.type)?.color || '#ef4444',
                }}
              />
              <h3 className={`font-serif font-bold text-sm ${isDark ? 'text-white' : '!text-zinc-900'}`}>Карточка в фокусе</h3>
            </div>
            <button
              type="button"
              onClick={onClearCardSelection}
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
                  onChange={onImageUpload}
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
                    onClick={() => onUpdateCard(focusedCard.id, { imageUrl: '' })}
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
              onChange={(e) => onUpdateCard(focusedCard.id, { name: e.target.value })}
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
                onUpdateCard(focusedCard.id, patch);
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
                onChange={(e) => onUpdateCard(focusedCard.id, { clan: e.target.value as ClanId })}
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
              onChange={(e) => onUpdateCard(focusedCard.id, { notes: e.target.value })}
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
              onClick={() => onDuplicateCard(focusedCard.id)}
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
              onClick={() => onDeleteCard(focusedCard.id)}
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
              onClick={() => onAddNewCard('npc')}
              className="w-full px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer font-serif"
            >
              <Plus className="w-4 h-4" />
              <span>+ Создать карточку</span>
            </button>

            <button
              type="button"
              onClick={onAddMyCharacter}
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
                    <span className={`font-serif text-[11px] truncate font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {conn.label}
                    </span>
                  </div>
                  <ConnectionArrowPreview styleConfig={conn} />
                </div>
              ))}
            </div>
          </div>

          {/* Connections count summary */}
          <div
            className={`pt-2 border-t text-[11px] font-serif flex items-center justify-between ${
              isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'
            }`}
          >
            <span>
              Карточек: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{mapData.cards.length}</strong>
            </span>
            <span>
              Связей: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{mapData.connections.length}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
