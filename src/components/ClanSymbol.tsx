import React from 'react';
import { ClanId } from '../types';
import { CLAN_SYMBOLS, ClanSymbolData } from '../data/clanSymbols';

export interface ClanSymbolProps extends React.SVGProps<SVGSVGElement> {
  clan?: ClanId | string;
  generation?: number;
  className?: string;
  color?: string;
  size?: number | string;
  title?: string;
}

export const getClanSymbolKey = (clan?: string, generation?: number): string => {
  const normalized = (clan || '').toLowerCase().trim();
  if (normalized === 'caitiff' && Number(generation) >= 14) {
    return 'thinblood';
  }
  if (normalized === 'thinblood' || normalized === 'thin-blood' || normalized === 'слабокровный' || normalized === 'слабокровные') {
    return 'thinblood';
  }
  if (CLAN_SYMBOLS[normalized]) {
    return normalized;
  }
  // aliases & Russian translations
  if (normalized.includes('haqim') || normalized.includes('assam') || normalized.includes('хаким') || normalized.includes('ассамит')) return 'assamite';
  if (normalized.includes('hecata') || normalized.includes('giovanni') || normalized.includes('хеката') || normalized.includes('джованни')) return 'giovanni';
  if (normalized.includes('ministry') || normalized.includes('set') || normalized.includes('министерство') || normalized.includes('сет')) return 'setite';
  if (normalized.includes('brujah') || normalized.includes('бруха')) return 'brujah';
  if (normalized.includes('ventrue') || normalized.includes('вентру')) return 'ventrue';
  if (normalized.includes('toreador') || normalized.includes('тореадор')) return 'toreador';
  if (normalized.includes('tremere') || normalized.includes('тремер')) return 'tremere';
  if (normalized.includes('malkav') || normalized.includes('малкав')) return 'malkavian';
  if (normalized.includes('nosferatu') || normalized.includes('носферату')) return 'nosferatu';
  if (normalized.includes('gangrel') || normalized.includes('гангрел')) return 'gangrel';
  if (normalized.includes('lasombra') || normalized.includes('ласомбра')) return 'lasombra';
  if (normalized.includes('tzimisce') || normalized.includes('цимисх')) return 'tzimisce';
  if (normalized.includes('ravnos') || normalized.includes('равнос')) return 'ravnos';
  if (normalized.includes('salubri') || normalized.includes('салюбри')) return 'salubri';
  if (normalized.includes('caitiff') || normalized.includes('каитиф')) return 'caitiff';
  return 'custom';
};

export const ClanSymbol: React.FC<ClanSymbolProps> = ({
  clan,
  generation,
  className = 'w-6 h-6',
  color,
  size,
  style,
  title,
  ...rest
}) => {
  const symbolKey = getClanSymbolKey(clan, generation);
  const symbolData: ClanSymbolData = CLAN_SYMBOLS[symbolKey] || CLAN_SYMBOLS.custom;

  return (
    <svg
      viewBox={symbolData.viewBox}
      className={`inline-block shrink-0 transition-colors ${className}`}
      style={{
        color: color || 'currentColor',
        fill: color || 'currentColor',
        width: size,
        height: size,
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || `Символ клана ${clan || 'Кастомный'}`}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path
        d={symbolData.path}
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
