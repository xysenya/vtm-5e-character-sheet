import React from 'react';
import { SheetHeader } from './SheetHeader';

interface SheetPage5Props {
  isDark?: boolean;
  accentColor?: string;
  textColor?: string;
  primaryTextColor?: string;
  accentTextColor?: string;
  rulesLineHeight?: number;
  rulesFontSize?: number;
}

export const SheetPage5: React.FC<SheetPage5Props> = ({
  isDark = false,
  accentColor,
  textColor,
  primaryTextColor,
  accentTextColor,
  rulesLineHeight = 1.5,
  rulesFontSize = 11.5,
}) => {
  const cardBg = isDark
    ? 'bg-zinc-900/40 border-zinc-800'
    : 'bg-white/70 border-zinc-300 shadow-xs';

  const dynamicLineHeight = rulesLineHeight || 1.5;
  const dynamicFontSize = rulesFontSize || 11.5;
  const listMarginBottom = Math.max(0, Math.round((dynamicLineHeight - 1.05) * 6));
  const tableCellPadding = Math.max(1, Math.round((dynamicLineHeight - 1.0) * 5));

  const listStyle: React.CSSProperties = {
    lineHeight: dynamicLineHeight,
    fontSize: `${dynamicFontSize}px`,
  };

  const itemStyle: React.CSSProperties = {
    marginBottom: `${listMarginBottom}px`,
    lineHeight: dynamicLineHeight,
    fontSize: `${dynamicFontSize}px`,
  };

  const cellStyle: React.CSSProperties = {
    paddingTop: `${tableCellPadding}px`,
    paddingBottom: `${tableCellPadding}px`,
    lineHeight: dynamicLineHeight,
    fontSize: `${dynamicFontSize}px`,
  };

  const tableSubtextStyle: React.CSSProperties = {
    paddingTop: `${tableCellPadding}px`,
    paddingBottom: `${tableCellPadding}px`,
    lineHeight: dynamicLineHeight,
    fontSize: `${Math.max(7.5, dynamicFontSize - 0.75)}px`,
  };

  const tableHeaderStyle: React.CSSProperties = {
    paddingTop: `${tableCellPadding}px`,
    paddingBottom: `${tableCellPadding}px`,
    lineHeight: dynamicLineHeight,
    fontSize: `${Math.max(8, dynamicFontSize - 1.5)}px`,
  };

  const noteStyle: React.CSSProperties = {
    fontSize: `${Math.max(8, dynamicFontSize - 1.5)}px`,
  };

  return (
    <div
      className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-5 sheet-page-6 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
        isDark ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800' : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
      }`}
      style={{
        boxShadow: isDark
          ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
      }}
    >
      <SheetHeader
        pageTitle="Подсказки по правилам"
        themeMode={isDark ? 'dark' : 'light'}
        accentColor={accentColor}
        textColor={textColor}
        primaryTextColor={primaryTextColor}
        accentTextColor={accentTextColor}
      />

      <div className="flex flex-col gap-1.5 sm:gap-2 print:gap-1 my-1 text-xs print-calib-p5-rules-stack">
        {/* ROW 1: DICE & ROUSE CHECKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 sm:gap-2 print:gap-1">
          {/* Card 1: Dice & Outcomes */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Правила бросков V5</span>
              <span className="text-sm">🎲</span>
            </div>
            <ul style={listStyle} className="font-serif text-[10px] sm:text-[10.5px] print:text-[9px]">
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Пул кубиков:</strong> Характеристика + Навык (d10).
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Успех:</strong> Выпадение 6, 7, 8, 9 или 10.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Триумф (критический успех):</strong> Каждая пара 10 на обычных кубиках дает +2 дополнительных успеха (итого 4 успеха за пару).
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Переброс за Силу Воли:</strong> Потратив 1 очко Силы Воли (1 поверхностный урон Воле), можно перебросить до 3 обычных кубиков (но НЕ кубики Голода).
              </li>
            </ul>
          </div>

          {/* Card 2: Rouse Checks & Blood Surge */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Воззвание к Крови (Rouse Check)</span>
              <span className="text-sm">⚡</span>
            </div>
            <ul style={listStyle} className="font-serif text-[10px] sm:text-[10.5px] print:text-[9px]">
              <li style={itemStyle}>
                Бросается 1d10. Результат <strong>6-10:</strong> успех (Голод не растет). Результат <strong>1-5:</strong> Голод увеличивается на 1.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Воззвание требуется:</strong> каждое пробуждение на закате, исцеление ран, Прилив Крови (Blood Surge), Румянец Жизни (Blush of Life), активация сил Дисциплин.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Прилив Крови (Blood Surge):</strong> перед броском можно совершить Воззвание к Крови и добавить к пулу кубики согласно Силе Крови.
              </li>
            </ul>
          </div>
        </div>

        {/* ROW 2: DIFFICULTY & HUNGER DICE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 sm:gap-2 print:gap-1">
          {/* Card 3: Difficulties */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Таблица сложностей бросков</span>
              <span className="text-sm">🎯</span>
            </div>
            <table className="w-full text-left font-serif">
              <tbody>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>1</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Элементарная</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>ударить неподвижную цель</td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>2</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Простая</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>запугать слабовольного человека</td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>3</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Непростая</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>пройтись по канату</td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>4</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Серьёзная</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>создать произведение искусства</td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>5</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Сложная</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>убедить полицейского, что ты не под кайфом</td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>6</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Невероятно сложная</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>бежать по канату под пулями</td>
                </tr>
                <tr>
                  <td style={cellStyle} className={`font-mono font-bold w-6 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>7+</td>
                  <td style={cellStyle} className={`font-semibold w-24 sm:w-28 pr-1 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Почти невыполнимая</td>
                  <td style={tableSubtextStyle} className={`leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>найти человека в мегаполисе за ночь</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card 4: Hunger Dice */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Кубики Голода (Hunger)</span>
              <span className="text-sm">🩸</span>
            </div>
            <ul style={listStyle} className="font-serif text-[10px] sm:text-[10.5px] print:text-[9px]">
              <li style={itemStyle}>
                Количество кубиков Голода равно текущему значению Голода (1-5). Они заменяют обычные кубики в пуле.
              </li>
              <li style={itemStyle}>
                <strong className="text-amber-500 font-semibold">Кровавый триумф (Messy Critical):</strong> При успешном броске хотя бы одна из 10 выпала на кубике Голода. Зверь выходит наружу: успех ценой жестокости, сопутствующего ущерба, нарушения Маскарада или Наваждения.
              </li>
              <li style={itemStyle}>
                <strong className="text-red-500 font-semibold">Кровавый провал (Bestial Failure):</strong> При неуспешном броске выпала 1 на кубике Голода. Зверь берет верх — наступает Наваждение, либо персонаж теряет самоконтроль / впадает в Бешенство.
              </li>
            </ul>
          </div>
        </div>

        {/* ROW 3: DAMAGE & FRENZY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 sm:gap-2 print:gap-1">
          {/* Card 5: Damage */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Урон и исцеление ран</span>
              <span className="text-sm">⚔️</span>
            </div>
            <ul style={listStyle} className="font-serif text-[10px] sm:text-[10.5px] print:text-[9px]">
              <li style={itemStyle}>
                <strong>Поверхностный урон (/):</strong> удары руками, пули, холодное оружие. Делится пополам для вампиров (округление вверх). За 1 Воззвание заживляется объем ран по Силе Крови.
              </li>
              <li style={itemStyle}>
                <strong>Тяжелый (аггравированный) урон (✕):</strong> огонь, солнечный свет, клыки/когти сверхъестественных существ. Заживляется во сне за Воззвания (три успешных за 1 пункт).
              </li>
              <li style={itemStyle}>
                Когда трек здоровья заполнен поверхностным уроном, каждая новая рана превращает легкую рану в тяжелую (заменяет / на ✕)!
              </li>
            </ul>
          </div>

          {/* Card 6: Frenzy & Humanity */}
          <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
            <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
              <span>Бешенство и Муки совести (Угрызения)</span>
              <span className="text-sm">🔥</span>
            </div>
            <ul style={listStyle} className="font-serif text-[10px] sm:text-[10.5px] print:text-[9px]">
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Бросок против Бешенства (Frenzy):</strong> Самообладание + Решительность (сложность 2-5).
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Ярость (Fury):</strong> оскорбление, нападение, физическое насилие, унижение.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Ужас / Ротшрек (Rötschreck):</strong> открытый огонь, солнечный свет.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Голод (Hunger Frenzy):</strong> вид или запах свежей крови при Голоде 4-5.
              </li>
              <li style={itemStyle}>
                <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Муки совести / Угрызения (Remorse):</strong> бросок свободных ячеек Человечности (мин. 1). Хотя бы 1 успех снимает все Пятна; провал — потеря 1 Человечности.
              </li>
            </ul>
          </div>
        </div>

        {/* ROW 4: EXPERIENCE COSTS (СТОИМОСТЬ УЛУЧШЕНИЙ) - 3 Columns Layout */}
        <div className={`p-2 sm:p-2.5 print:p-1.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
          <div className={`font-benguiat font-bold text-[11px] sm:text-xs uppercase tracking-wider pb-0.5 mb-1 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
            <span>Стоимость улучшений за Опыт</span>
            <span className="text-sm">✦</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-x-4 gap-y-1">
            {/* Column 1 */}
            <table className="w-full text-left font-serif">
              <thead>
                <tr className={`border-b font-benguiat uppercase tracking-wider ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-600 border-red-950/15'}`}>
                  <th style={tableHeaderStyle} className="font-semibold">Покупка</th>
                  <th style={tableHeaderStyle} className="font-semibold text-right">Опыт</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Характеристика</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 5
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Навык</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 3
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Специализация</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    3
                  </td>
                </tr>
                <tr>
                  <td style={cellStyle} className="font-medium">Человечность*</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 10
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Column 2 */}
            <table className="w-full text-left font-serif">
              <thead>
                <tr className={`border-b font-benguiat uppercase tracking-wider ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-600 border-red-950/15'}`}>
                  <th style={tableHeaderStyle} className="font-semibold">Покупка</th>
                  <th style={tableHeaderStyle} className="font-semibold text-right">Опыт</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Клановая Дисциплина</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 5
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Внеклановая Дисциплина</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 7
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Дисциплина (каитиф)</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 6
                  </td>
                </tr>
                <tr>
                  <td style={cellStyle} className="font-medium">Сила Крови</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    новое × 10
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Column 3 */}
            <table className="w-full text-left font-serif">
              <thead>
                <tr className={`border-b font-benguiat uppercase tracking-wider ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-600 border-red-950/15'}`}>
                  <th style={tableHeaderStyle} className="font-semibold">Покупка</th>
                  <th style={tableHeaderStyle} className="font-semibold text-right">Опыт</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Ритуал Кров. Чародейства</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    уровень × 3
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Церемония Забвения</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    уровень × 3
                  </td>
                </tr>
                <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                  <td style={cellStyle} className="font-medium">Рецептура Алхимии</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    уровень × 3
                  </td>
                </tr>
                <tr>
                  <td style={cellStyle} className="font-medium">Преимущество / Достоинство</td>
                  <td style={cellStyle} className={`text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                    3 за пункт
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={noteStyle} className={`italic mt-1 pt-0.5 border-t ${isDark ? 'border-zinc-800/60 text-zinc-400' : 'border-red-950/10 text-zinc-500'}`}>
            * Повышение Человечности за Опыт возможно исключительно с разрешения Рассказчика.
          </div>
        </div>
      </div>
    </div>
  );
};
