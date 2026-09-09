import React from 'react';
import { SheetHeader, SectionDivider } from './SheetHeader';

interface SheetPage5Props {
  isDark?: boolean;
  accentColor?: string;
  textColor?: string;
  primaryTextColor?: string;
  accentTextColor?: string;
}

export const SheetPage5: React.FC<SheetPage5Props> = ({
  isDark = false,
  accentColor,
  textColor,
  primaryTextColor,
  accentTextColor,
}) => {
  const cardBg = isDark
    ? 'bg-zinc-900/40 border-zinc-800'
    : 'bg-white/70 border-zinc-300 shadow-xs';

  return (
    <div
      className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-5 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
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

      <div className="space-y-3.5 my-2 text-xs print-calib-p5-rules-stack">
            {/* ROW 1: DICE & HUNGER RULES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
              {/* Card 1: Dice & Outcomes */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  <span>Правила бросков V5</span>
                  <span className="text-sm">🎲</span>
                </div>
                <ul className="space-y-1.5 font-serif leading-relaxed text-[11px]">
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Пул кубиков:</strong> Характеристика + Навык (d10).
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Успех:</strong> Выпадение 6, 7, 8, 9 или 10.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Триумф (критический успех):</strong> Каждая пара 10 на обычных кубиках дает +2 дополнительных успеха (итого 4 успеха за пару).
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Переброс за Силу Воли:</strong> Потратив 1 очко Силы Воли (1 поверхностный урон Воле), можно перебросить до 3 обычных кубиков (но НЕ кубики Голода).
                  </li>
                </ul>
              </div>

              {/* Card 2: Hunger Dice */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  <span>Кубики Голода (Hunger)</span>
                  <span className="text-sm">🩸</span>
                </div>
                <ul className="space-y-1.5 font-serif leading-relaxed text-[11px]">
                  <li>
                    Количество кубиков Голода равно текущему значению Голода (1-5). Они заменяют обычные кубики в пуле.
                  </li>
                  <li>
                    <strong className="text-amber-500 font-semibold">Кровавый триумф (Messy Critical):</strong> При успешном броске хотя бы одна из 10 выпала на кубике Голода. Зверь выходит наружу: успех достигнут ценой сопутствующего ущерба, жестокости, нарушения Маскарада или Одержимости (Наваждения).
                  </li>
                  <li>
                    <strong className="text-red-500 font-semibold">Кровавый провал (Bestial Failure):</strong> При неуспешном броске выпала 1 на кубике Голода. Зверь берет верх — наступает Одержимость (Наваждение) либо персонаж теряет самоконтроль / впадает в Бешенство.
                  </li>
                </ul>
              </div>
            </div>

            {/* ROW 2: DIFFICULTY & ROUSE CHECKS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
              {/* Card 3: Difficulties */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Таблица сложностей бросков
                </div>
                <table className="w-full text-left font-serif text-[11px]">
                  <tbody>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>1</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Элементарная</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>ударить неподвижную цель</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>2</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Простая</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>запугать слабовольного человека</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>3</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Непростая</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>пройтись по канату</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>4</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Серьёзная</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>создать произведение искусства</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>5</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Сложная</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>убедить полицейского, что ты не под кайфом</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-red-950/10'}`}>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>6</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Невероятно сложная</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>бежать по канату под пулями</td>
                    </tr>
                    <tr>
                      <td className={`py-1 font-mono font-bold w-7 text-center ${isDark ? 'text-red-500' : 'text-red-800'}`}>7+</td>
                      <td className={`py-1 font-semibold w-24 sm:w-28 pr-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Почти невыполнимая</td>
                      <td className={`py-1 text-[10.5px] leading-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>найти конкретного бездомного в Лос-Анджелесе за ночь</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 4: Rouse Checks & Blood Surge */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Воззвание к Крови (Rouse Check)
                </div>
                <ul className="space-y-1.5 font-serif leading-relaxed text-[11px]">
                  <li>
                    Бросается 1d10. Результат <strong>6-10:</strong> успех (Голод не растет). Результат <strong>1-5:</strong> Голод увеличивается на 1.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Воззвание требуется:</strong> каждое пробуждение на закате, исцеление ран, Прилив Крови (Blood Surge), Румянец Жизни (Blush of Life), активация сил Дисциплин.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Прилив Крови (Blood Surge):</strong> перед броском можно совершить Воззвание к Крови и добавить к пулу кубики согласно Силе Крови.
                  </li>
                </ul>
              </div>
            </div>

            {/* ROW 3: DAMAGE & FRENZY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
              {/* Card 5: Damage */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Урон и исцеление ран
                </div>
                <ul className="space-y-1.5 font-serif leading-relaxed text-[11px]">
                  <li>
                    <strong>Поверхностный урон (/):</strong> удары руками, пули, холодное оружие. Делится пополам для вампиров (округление вверх). За 1 Воззвание к Крови заживляется объем ран, указанный в Силе Крови.
                  </li>
                  <li>
                    <strong>Тяжелый (аггравированный) урон (✕):</strong> огонь, солнечный свет, клыки/когти сверхъестественных существ. Заживляется во время дневного сна за Воззвания к Крови (три успешных за 1 пункт).
                  </li>
                  <li>
                    Когда трек здоровья полностью заполнен поверхностным уроном, каждая новая рана превращает легкую рану в тяжелую (заменяет / на ✕)!
                  </li>
                </ul>
              </div>

              {/* Card 6: Frenzy & Humanity */}
              <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
                <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                  Бешенство и Муки совести (Угрызения)
                </div>
                <ul className="space-y-1.5 font-serif leading-relaxed text-[11px]">
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Бросок против Бешенства (Frenzy):</strong> Самообладание + Решительность против сложности провокации (2-5).
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Ярость (Fury):</strong> оскорбление, нападение, физическое насилие, унижение.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Ужас / Ротшрек (Rötschreck):</strong> открытый огонь, солнечный свет.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Голод (Hunger Frenzy):</strong> вид или запах свежей крови при Голоде 4-5.
                  </li>
                  <li>
                    <strong className={isDark ? 'text-red-400' : 'text-red-700'}>Муки совести / Угрызения (Remorse):</strong> в конце сессии, если есть Пятна (Stains), бросаются свободные ячейки Человечности (минимум 1 кубик). Если выпал хотя бы 1 успех — Пятна снимаются. При провале персонаж теряет 1 пункт Человечности.
                  </li>
                </ul>
              </div>
            </div>

            {/* ROW 4: EXPERIENCE COSTS (СТОИМОСТЬ УЛУЧШЕНИЙ) */}
            <div className={`p-3.5 rounded-sm border print-calib-p5-rules-card ${cardBg}`}>
              <div className={`font-benguiat font-bold text-xs uppercase tracking-wider pb-1.5 mb-2 border-b border-red-900/20 flex items-center justify-between ${isDark ? 'text-red-500' : 'text-red-800'}`}>
                <span>Стоимость улучшений за Опыт</span>
                <span className="text-sm">✦</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-2">
                {/* Column 1 */}
                <table className="w-full text-left font-serif text-[11px]">
                  <thead>
                    <tr className={`border-b font-benguiat text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-600 border-red-950/15'}`}>
                      <th className="py-1 font-semibold">Покупка</th>
                      <th className="py-1 font-semibold text-right">Стоимость опыта</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Характеристика</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 5
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Навык</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 3
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Новая специализация</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        3
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Клановая Дисциплина</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 5
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Сторонняя (внеклановая) Дисциплина</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 7
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Любая Дисциплина для каитифа</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 6
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Column 2 */}
                <table className="w-full text-left font-serif text-[11px]">
                  <thead>
                    <tr className={`border-b font-benguiat text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-600 border-red-950/15'}`}>
                      <th className="py-1 font-semibold">Покупка</th>
                      <th className="py-1 font-semibold text-right">Стоимость опыта</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Ритуал Кровавого Чародейства</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        уровень Ритуала × 3
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Церемония Забвения</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        уровень Церемонии × 3
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Рецептура Алхимии слабокровных</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        уровень рецептуры × 3
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Достоинство / Преимущество</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        3 за каждый пункт
                      </td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-zinc-800/80' : 'border-red-950/10'}`}>
                      <td className="py-1 font-medium">Сила Крови</td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 10
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">
                        Человечность
                        <span className={`block text-[9.5px] font-normal italic ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          только с разрешения Рассказчика
                        </span>
                      </td>
                      <td className={`py-1 text-right font-mono font-bold whitespace-nowrap ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                        новое значение × 10
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    </div>
  );
};
