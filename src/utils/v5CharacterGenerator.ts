import { CharacterSheet, ClanId, V5SkillItem, V5DisciplineSlot, V5AdvantageItem } from '../types';
import { CLAN_THEMES } from '../data/clans';
import { PREDATOR_TYPES } from '../data/predatorTypes';
import { getPowersForDiscipline, BloodPower } from '../data/bloodPowers';
import { ALL_ADVANTAGES, AdvantageItem } from '../data/advantages';
import { getGenerationInfo } from './calculations';
import { DEFAULT_HEADER_SLOTS } from '../components/HeaderSettingsModal';

export interface V5GeneratorOptions {
  clanId?: ClanId | 'random';
  predatorTypeId?: string | 'random';
  skillTemplate?: 'balanced' | 'specialist' | 'jack' | 'random';
  conceptId?: string | 'random';
  name?: string;
  sire?: string;
  blankStory?: boolean;
}

// Extensive pool of names
export const V5_NAMES_MALE = [
  'Маркус Вейн',
  'Виктор Демидов',
  'Александр Корвин',
  'Роман Волков',
  'Кирилл Багрицкий',
  'Даниил Морозов',
  'Ян Воропаев',
  'Константин Рейн',
  'Глеб Савельев',
  'Артём Беляев',
  'Вадим Смирнов',
  'Илья Соколовский',
  'Максим Орлов',
  'Ярослав Рощин',
  'Эдуард Кауфман',
  'Леон Градов',
  'Кристиан Вальц',
  'Феликс Черных',
  'Богдан Нестеров',
  'Себастьян Гримм',
  'Руслан Кречетов',
  'Матвей Заславский',
  'Денис Воронцов',
  'Артур фон Штейн',
];

export const V5_NAMES_FEMALE = [
  'Елена Власова',
  'Вероника Блэквуд',
  'Анна Морозова',
  'Диана Лазарева',
  'Алиса Рейхерт',
  'Ксения Вересова',
  'София Романова',
  'Инга Штерн',
  'Камилла Воронцова',
  'Валерия Орлова',
  'Милена Залесская',
  'Полина Громова',
  'Элеонора Кросс',
  'Агата Лисовская',
  'Татьяна Снежина',
  'Беатрис Фонтен',
  'Дарья Северная',
  'Маргарита Новак',
  'Кира Воронова',
  'Майя Левицкая',
];

export const V5_SIRES = [
  'Барон Артур «Седой»',
  'Примоген Калеб',
  'Мадам Элеонора',
  'Доктор Гессен',
  'Виктор «Молот» Крейг',
  'Старейшина Мариус',
  'Леди Камилла де Сен-Жермен',
  'Граф Владислав Корвин',
  'Архивариус Игнатий',
  'Тень (Николай)',
  'Маэстро Джулиан',
  'Сестра Магдалина',
  'Серафим Кровник',
  'Брат Августин',
  'Баронесса Жанна',
  'Профессор Вайс',
  'Майор Сорокин',
  'Хирург Воронов',
  'Примоген Валериан',
  'Патриций Аврелий',
];

export const V5_CHRONICLES = [
  'Тени Петербурга',
  'Кровь над Невой',
  'Ночи Москвы',
  'Пепел Праги',
  'Хроники Лондона',
  'Чикаго во тьме',
  'Парижский маскарад',
  'Бостонский узел',
];

export interface ConceptArchetype {
  id: string;
  title: string;
  description: string;
  preferredClans: ClanId[];
  preferredPredators: string[];
  attributePriority: ('strength' | 'dexterity' | 'stamina' | 'charisma' | 'manipulation' | 'composure' | 'intelligence' | 'wits' | 'resolve')[];
  topSkills: { id: string; specialty?: string }[];
  ambition: string;
  desire: string;
  touchstone: string;
  chronicleTenet: string;
  haven: string;
  sect: string;
  distinguishingFeatures: string;
  appearance: string;
  history: string;
  inventory: string;
  diaryNote: string;
}

export const CONCEPT_ARCHETYPES: ConceptArchetype[] = [
  {
    id: 'detective',
    title: 'Бывший следователь убойного отдела',
    description: 'Внимательный и жесткий сыщик, расследовавший ритуальные убийства и узнавший слишком много о ночных хищниках.',
    preferredClans: ['brujah', 'nosferatu', 'assamite', 'gangrel'],
    preferredPredators: ['alleycat', 'pursuer', 'sandman'],
    attributePriority: ['wits', 'resolve', 'stamina', 'dexterity', 'strength', 'intelligence', 'composure', 'charisma', 'manipulation'],
    topSkills: [
      { id: 'investigation', specialty: 'Место преступления' },
      { id: 'firearms', specialty: 'Пистолеты' },
      { id: 'insight', specialty: 'Детекция лжи' },
      { id: 'streetwise', specialty: 'Информаторы' },
      { id: 'awareness' },
      { id: 'brawl', specialty: 'Захваты' },
      { id: 'stealth' },
    ],
    ambition: 'Раскрыть тайный сговор камарильского шерифа и Второй Инквизиции',
    desire: 'Допросить связного, сдавшего место прошлой облавы',
    touchstone: 'Елена (бывшая напарница) — верность профессиональному долгу',
    chronicleTenet: 'Никогда не убивать невиновных смертных',
    haven: 'Конспиративная квартира с решетками на окнах в старом фонде',
    sect: 'Анархи',
    distinguishingFeatures: 'Шрам через бровь, цепкий холодный взгляд, привычка не моргать.',
    appearance: 'Высокий мужчина крепкого телосложения в потертом темном пальто и армейских ботинках. Держится настороженно.',
    history: 'В смертной жизни вел дело о серийных обескровленных трупах в порту. Сир заметил его дотошность и обратил в ночь штурма склада.',
    inventory: 'Пистолет Glock 17, 2 магазина с экспансивными пулями, отмычки, диктофон, жетон частного детектива, тактический фонарь.',
    diaryNote: 'Шериф дал понять, что за расследование в районе доков мне оторвут голову. Значит, я копаю в правильном направлении.',
  },
  {
    id: 'art_curator',
    title: 'Куратор закрытой арт-галереи',
    description: 'Эстет, знаток шедевров и светский лев, использующий выставки для торговли тайнами и вербовки смертных.',
    preferredClans: ['toreador', 'ventrue', 'malkavian'],
    preferredPredators: ['siren', 'consensualist', 'osiris'],
    attributePriority: ['charisma', 'manipulation', 'composure', 'wits', 'intelligence', 'dexterity', 'resolve', 'stamina', 'strength'],
    topSkills: [
      { id: 'persuasion', specialty: 'Светская беседа' },
      { id: 'academics', specialty: 'История искусств' },
      { id: 'insight', specialty: 'Чтение эмоций' },
      { id: 'etiquette', specialty: 'Высшее общество' },
      { id: 'subterfuge', specialty: 'Лесть' },
      { id: 'finance' },
      { id: 'awareness' },
    ],
    ambition: 'Организовать закрытый ночной салон, диктующий вкусы всему домену',
    desire: 'Заполучить утерянное полотно эпохи Ренессанса из частной коллекции',
    touchstone: 'София (юная художница) — восхищение чистым смертным талантом',
    chronicleTenet: 'Искусство и красота священны; вульгарность наказуема',
    haven: 'Апартаменты в мансарде исторического особняка с панорамными окнами',
    sect: 'Камарилья',
    distinguishingFeatures: 'Идеальная осанка, гипнотический взгляд, безупречный гардероб от кутюр.',
    appearance: 'Изящный силуэт, фарфоровая бледность кожи, темные уложенные волосы. Носит элегантный костюм-тройку.',
    history: 'Курировал частные коллекции аристократов. Был обращен своей сиром прямо на закрытом открытии вернисажа под звуки виолончели.',
    inventory: 'Золотой портсигар, антикварная карманная лупа, зашифрованный смартфон, ключи от галереи, стилет в трости.',
    diaryNote: 'Гарпии шепчутся о новом декрете Принца. Мой салон в пятницу станет идеальной ареной для проверки их лояльности.',
  },
  {
    id: 'mob_lawyer',
    title: 'Адвокат криминального синдиката',
    description: 'Мастер юридических петель, подкупа и шантажа, обеспечивающий прикрытие операциям вампирского домена.',
    preferredClans: ['ventrue', 'lasombra', 'toreador'],
    preferredPredators: ['extortionist', 'consensualist', 'siren'],
    attributePriority: ['manipulation', 'composure', 'intelligence', 'charisma', 'resolve', 'wits', 'stamina', 'dexterity', 'strength'],
    topSkills: [
      { id: 'persuasion', specialty: 'Судебные прения' },
      { id: 'politics', specialty: 'Муниципалитет' },
      { id: 'subterfuge', specialty: 'Сокрытие фактов' },
      { id: 'finance', specialty: 'Отмывание денег' },
      { id: 'insight' },
      { id: 'intimidation' },
      { id: 'investigation' },
    ],
    ambition: 'Взять под негласный контроль коллегию судей и прокурора города',
    desire: 'Закрыть уголовное дело против доверенного гуля-бизнесмена',
    touchstone: 'Профессор Аркадий (старый учитель права) — идеал справедливости',
    chronicleTenet: 'Держать данное слово даже перед врагом',
    haven: 'Укрепленный офис на верхнем этаже бизнес-центра с тонированными стеклами',
    sect: 'Камарилья',
    distinguishingFeatures: 'Холодная расчетливая улыбка, платиновые запонки с гравировкой рода.',
    appearance: 'Строгий деловой костюм, безупречный пробор, пронзительный взгляд серых глаз.',
    history: 'Защищал верхушку мафии от тюрьмы. Старейшины Вентру оценили способность находить лазейки в любых законах и подарили Поцелуй.',
    inventory: 'Защищенный планшет, папка с компроматом на чиновников, дорогие швейцарские часы, ключи от бронированного седана.',
    diaryNote: 'Прокурор почти подписал ордер на обыск складских помещений. Пришлось напомнить ему об ипотеке его дочери.',
  },
  {
    id: 'occult_librarian',
    title: 'Оккультный букинист и мистик',
    description: 'Исследователь забытых манускриптов, гримуаров и тайн крови, знающий древние ритуалы и хроники Каинитов.',
    preferredClans: ['tremere', 'malkavian', 'giovanni', 'assamite'],
    preferredPredators: ['sandman', 'osiris', 'graverobber'],
    attributePriority: ['intelligence', 'resolve', 'wits', 'composure', 'stamina', 'dexterity', 'strength', 'charisma', 'manipulation'],
    topSkills: [
      { id: 'occult', specialty: 'Ритуалы крови' },
      { id: 'academics', specialty: 'Мертвые языки' },
      { id: 'investigation', specialty: 'Поиск фолиантов' },
      { id: 'awareness' },
      { id: 'technology', specialty: 'Шифрование данных' },
      { id: 'insight' },
      { id: 'subterfuge' },
    ],
    ambition: 'Восстановить утраченный фрагмент Александрийского манускрипта Крови',
    desire: 'Провести полуночный ритуал очищения от ментального следа инквизиторов',
    touchstone: 'Монах Варфоломей — хранитель древней монастырской библиотеки',
    chronicleTenet: 'Знание священно; невежество разрушительно',
    haven: 'Подвальное книгохранилище за тяжелой герметичной сейфовой дверью',
    sect: 'Камарилья',
    distinguishingFeatures: 'Пепельные круги под глазами, серебряный перстень с герметическим символом.',
    appearance: 'Худощавый мужчина в темном бархатном сюртуке, очки в тонкой оправе, тихий вкрадчивый голос.',
    history: 'Всю жизнь искал доказательства подлинности вампирских легенд. В капелле Тремеров его знания оценили и посвятили в таинства.',
    inventory: 'Кожаный дорожный несессер с реактивами, древний пергамент в тубусе, серебряный кинжал для ритуалов, УФ-лампа.',
    diaryNote: 'Вчерашняя формула из венской копии трактата сработала. Витэ среагировало именно так, как описывал Гортрикс.',
  },
  {
    id: 'street_racer',
    title: 'Уличный гонщик и автомеханик',
    description: 'Сорвиголова ночных автострад, знающий каждый переулок мегаполиса и не признающий авторитетов власти.',
    preferredClans: ['brujah', 'gangrel', 'ravnos'],
    preferredPredators: ['alleycat', 'roadside_killer'],
    attributePriority: ['dexterity', 'wits', 'strength', 'stamina', 'resolve', 'composure', 'charisma', 'manipulation', 'intelligence'],
    topSkills: [
      { id: 'drive', specialty: 'Ночные погони' },
      { id: 'craft', specialty: 'Тюнинг двигателей' },
      { id: 'streetwise', specialty: 'Уличные банды' },
      { id: 'brawl', specialty: 'Уличная драка' },
      { id: 'athletics' },
      { id: 'awareness' },
      { id: 'larceny' },
    ],
    ambition: 'Создать сеть безопасных путей эвакуации для Анархов по всему региону',
    desire: 'Обогнать и загнать в угол патруль шерифа на мосту',
    touchstone: 'Младший брат Артём — обещание уберечь его от криминального дна',
    chronicleTenet: 'Свобода воли превыше любых приказов старцев',
    haven: 'Утепленный гаражный бокс с ямой, инструментами и звукоизоляцией',
    sect: 'Анархи',
    distinguishingFeatures: 'Татуировка поршней на шее, мозолистые руки, запах бензина и кожи.',
    appearance: 'Жилистый парень в потертой мотокуртке, рваных джинсах и тяжелых ботинках с железными носками.',
    history: 'Был легендой нелегальных гонок. Попал в смертельную аварию, подстроенную конкурентами, но местный Бруха спас его укусом.',
    inventory: 'Ключи от форсированного маслкара, набор профессиональных отмычек, мультитул, карманный нож, рация с полис-сканером.',
    diaryNote: 'Полиция перекрыла южную объездную, но через промзону можно пройти на скорости за три минуты. Дорога наша.',
  },
  {
    id: 'forensic_pathologist',
    title: 'Судмедэксперт городского морга',
    description: 'Хладнокровный исследователь смерти, контролирующий поток тел в городе и заметающий следы пиров Сородичей.',
    preferredClans: ['giovanni', 'nosferatu', 'tremere'],
    preferredPredators: ['graverobber', 'grim_reaper', 'bagger'],
    attributePriority: ['intelligence', 'resolve', 'wits', 'stamina', 'composure', 'dexterity', 'manipulation', 'charisma', 'strength'],
    topSkills: [
      { id: 'medicine', specialty: 'Патологоанатомия' },
      { id: 'investigation', specialty: 'Анализ улик' },
      { id: 'science', specialty: 'Токсикология' },
      { id: 'subterfuge', specialty: 'Фальсификация отчетов' },
      { id: 'awareness' },
      { id: 'stealth' },
      { id: 'technology' },
    ],
    ambition: 'Получить полный контроль над всеми патологоанатомическими отделениями области',
    desire: 'Изучить ткани тела гуля, подвергшегося мутациям плоти',
    touchstone: 'Санитар Денис — добродушный и честный смертный помощник',
    chronicleTenet: 'Мертвые заслуживают покоя, тайны заслуживают молчания',
    haven: 'Холодная подсобная лаборатория под городским крематорием',
    sect: 'Автономы',
    distinguishingFeatures: 'Бледность трупа, запах формалина и мяты, абсолютно невозмутимый пульс.',
    appearance: 'Высокий, сутулый человек в медицинском халате или строгом темном свитере, резиновые перчатки в кармане.',
    history: 'Много лет оформлял вампирские укусы как «нападения бродячих собак». Семья Хеката обратила его, чтобы закрепить контроль над моргом.',
    inventory: 'Набор скальпелей, бланки свидетельств о смерти с печатями, портативный микроскоп, ампулы с консервантом.',
    diaryNote: 'Сегодня привезли двоих с разорванными яремными венами. Пришлось переписать причину смерти на промышленный несчастный случай.',
  },
  {
    id: 'underground_surgeon',
    title: 'Хирург подпольной клиники',
    description: 'Врач без лицензии, штопающий огнестрельные раны наемников и Сородичей за наличные и витэ.',
    preferredClans: ['salubri', 'tremere', 'nosferatu', 'gangrel'],
    preferredPredators: ['bagger', 'consensualist', 'grim_reaper'],
    attributePriority: ['intelligence', 'dexterity', 'resolve', 'composure', 'wits', 'stamina', 'charisma', 'manipulation', 'strength'],
    topSkills: [
      { id: 'medicine', specialty: 'Полевая хирургия' },
      { id: 'science', specialty: 'Фармакология' },
      { id: 'insight', specialty: 'Состояние пациента' },
      { id: 'streetwise' },
      { id: 'awareness' },
      { id: 'subterfuge' },
      { id: 'technology' },
    ],
    ambition: 'Разработать метод быстрого восстановления тканей смертных без использования видимой магии',
    desire: 'Достать партию военного гемостатика и свежей плазмы крови',
    touchstone: 'Медсестра Ольга — преданность спасению жизней любой ценой',
    chronicleTenet: 'Не отказывать в помощи тем, кто истекает кровью на твоем столе',
    haven: 'Подвал заброшенной стоматологии с резервным генератором',
    sect: 'Анархи',
    distinguishingFeatures: 'Чуткие пальцы, усталый сочувствующий взгляд, тихий голос.',
    appearance: 'Спокойный человек в удобной темной медицинской форме, всегда собран и готов к экстренной операции.',
    history: 'Лишился лицензии за спасение раненого бандита. Был найден Сородичем Салюбри, который увидел в нем родственную целительскую душу.',
    inventory: 'Хирургический чемодан, зажимы, шовный материал, портативный дефибриллятор, ампулы антибиотиков и морфия.',
    diaryNote: 'Привели молодого неоната с серебряной картечью в груди. Пришлось вычищать ткани вручную при свете фонаря.',
  },
  {
    id: 'darknet_hacker',
    title: 'Хакер информационной безопасности',
    description: 'Невидимка цифровых сетей, взламывающий камеры наружного наблюдения, системы распознавания лиц и серверы Инквизиции.',
    preferredClans: ['nosferatu', 'brujah', 'malkavian'],
    preferredPredators: ['sandman', 'trapdoor', 'alleycat'],
    attributePriority: ['intelligence', 'wits', 'resolve', 'dexterity', 'composure', 'stamina', 'manipulation', 'charisma', 'strength'],
    topSkills: [
      { id: 'technology', specialty: 'Сетевой взлом' },
      { id: 'investigation', specialty: 'Цифровой след' },
      { id: 'stealth', specialty: 'Уход от слежки' },
      { id: 'streetwise', specialty: 'Даркнет' },
      { id: 'awareness' },
      { id: 'subterfuge' },
      { id: 'larceny' },
    ],
    ambition: 'Внедрить вирус в городскую базу камер "Безопасный город" для автоматического стирания лиц вампиров',
    desire: 'Перехватить зашифрованный отчет ячейки Второй Инквизиции',
    touchstone: 'Сетевой друг «Ghost» — дружба и доверие сквозь анонимные чаты',
    chronicleTenet: 'Информация должна быть свободной, личные тайны — неприкосновенны',
    haven: 'Серверная комната в затопленном техническом подвале НИИ',
    sect: 'Анархи',
    distinguishingFeatures: 'Капюшон, свет монитора на лице, наушники на шее, пальцы в постоянном движении.',
    appearance: 'Неприметный подросток/юноша в бесформенном худи, кроссовках и рюкзаке, полном проводов.',
    history: 'Случайно взломал закрытый закрытый архив принцевской канцелярии. Носферату восхитились его дерзостью и спасли от расправы шерифа.',
    inventory: 'Кастомный ноутбук с Linux и аппаратным шифрованием, Wi-Fi антенны, флешки-киллеры, отмычки, пауэрбанки.',
    diaryNote: 'Камеры на углу Невского снова зафиксировали лицо Барона. Скрипт вовремя подменил видеопоток на запись с пустой улицей.',
  },
  {
    id: 'club_diva',
    title: 'Владелица элитного ночного клуба',
    description: 'Королева полуночной богемы, контролирующая танцполы, вип-ложи и самые эксклюзивные вечеринки города.',
    preferredClans: ['toreador', 'setite', 'ventrue'],
    preferredPredators: ['siren', 'scene_queen', 'osiris'],
    attributePriority: ['charisma', 'manipulation', 'composure', 'dexterity', 'wits', 'resolve', 'stamina', 'strength', 'intelligence'],
    topSkills: [
      { id: 'persuasion', specialty: 'Соблазнение' },
      { id: 'performance', specialty: 'Танцы и сцена' },
      { id: 'insight', specialty: 'Желания толпы' },
      { id: 'streetwise', specialty: 'Клубный трафик' },
      { id: 'subterfuge' },
      { id: 'finance' },
      { id: 'etiquette' },
    ],
    ambition: 'Сделать свой клуб главным местом встреч Примогенов и нейтральной зоной',
    desire: 'Очаровать нового шерифа и добиться права охоты в своем заведении',
    touchstone: 'Бармен Марк — память о первой влюбленности юности',
    chronicleTenet: 'Экстаз и наслаждение даруют бессмертие душе',
    haven: 'Роскошные звуконепроницаемые апартаменты над VIP-зоной клуба',
    sect: 'Камарилья',
    distinguishingFeatures: 'Ослепительная внешность, гипнотический парфюм, грациозная пластика пантеры.',
    appearance: 'Эффектная женщина в шелковом вечернем платье с глубоким вырезом, сверкающие бриллианты в ушах.',
    history: 'Создала с нуля самый популярный клуб в городе. Ее шарм покорил старейшину Тореадоров, который подарил ей вечную ночь.',
    inventory: 'Ключи от VIP-комнат, пачка стодолларовых купюр, золотая зажигалка, флакон экзотических духов, скрытый пистолет Derringer.',
    diaryNote: 'Вчера в VIP-ложе сидели сразу трое представителей Совета. Ни один не посмел обнажить клыки без моего согласия.',
  },
  {
    id: 'ex_mercenary',
    title: 'Экс-оперативник спецподразделения',
    description: 'Опытный ветеран боевых действий, знающий тактику штурма, снайперское дело и выживание в экстремальных условиях.',
    preferredClans: ['assamite', 'brujah', 'gangrel', 'ventrue'],
    preferredPredators: ['alleycat', 'blood_leech', 'pursuer'],
    attributePriority: ['stamina', 'strength', 'dexterity', 'wits', 'resolve', 'composure', 'intelligence', 'charisma', 'manipulation'],
    topSkills: [
      { id: 'firearms', specialty: 'Штурмовые винтовки' },
      { id: 'brawl', specialty: 'Армейский рукопашный бой' },
      { id: 'stealth', specialty: 'Бесшумное передвижение' },
      { id: 'survival', specialty: 'Городские руины' },
      { id: 'athletics' },
      { id: 'intimidation' },
      { id: 'awareness' },
    ],
    ambition: 'Уничтожить ударную группу охотников, ликвидировавшую мое прошлое подразделение',
    desire: 'Оборудовать тайник с тяжелым оружием на случай прорыва Маскарада',
    touchstone: 'Ирина (вдова боевого товарища) — священный долг заботы о семье павшего',
    chronicleTenet: 'Никогда не бросать соратника на поле боя',
    haven: 'Замаскированный подземный тир в заброшенной воинской части',
    sect: 'Камарилья',
    distinguishingFeatures: 'Множественные боевые шрамы, стрижка под ноль, абсолютная собранность.',
    appearance: 'Широкоплечий мужчина мощного телосложения в тактических брюках 5.11 и прочной ветровке.',
    history: 'Служил в горячих точках. Во время секретной операции в горах отряд столкнулся с чудовищем. Сир обратил единственного выжившего.',
    inventory: 'Пистолет Ярыгина, тактический нож Extrema Ratio, тепловизионный монокуляр, бронежилет скрытого ношения, радиостанция.',
    diaryNote: 'Заметил хвост на углу Литейного. Двое в гражданском с армейской выправкой. Пусть подойдут ближе — встречу по уставу.',
  },
];

/**
 * Returns an authentic discipline power from our library matching discipline and level.
 */
function pickPowerForDiscipline(discName: string, level: number): string {
  const powers = getPowersForDiscipline(discName);
  const matching = powers.filter((p) => p.level === level);
  if (matching.length > 0) {
    const picked = matching[Math.floor(Math.random() * matching.length)];
    return picked.name;
  }
  // Fallbacks if not found
  const defaultNames: Record<string, string[]> = {
    'Мощь (Potence)': ['Сокрушительный удар', 'Хватка титана', 'Брутальное могущество'],
    'Стремительность (Celerity)': ['Кошачья грация', 'Быстрота мысли', 'Мгновенное уклонение'],
    'Величие (Presence)': ['Трепет', 'Обаяние', 'Устрашение'],
    'Доминирование (Dominate)': ['Приказ', 'Забвение', 'Подавление воли'],
    'Стойкость (Fortitude)': ['Стойкость плоти', 'Непреклонность', 'Окаменение'],
    'Ясновидение (Auspex)': ['Обостренные чувства', 'Прорицание', 'Чтение ауры'],
    'Сокрытие (Obfuscate)': ['Плащ теней', 'Невидимое присутствие', 'Маска тысячи лиц'],
    'Анимализм (Animalism)': ['Связь со зверем', 'Зов стаи', 'Усмирение зверя'],
    'Метаморфозы (Protean)': ['Глаза зверя', 'Оружие плоти', 'Земное слияние'],
    'Кровавое чародейство (Blood Sorcery)': ['Вкус крови', 'Едкая кровь', 'Кража витэ'],
    'Забвение (Oblivion)': ['Теневая мантия', 'Рука праха', 'Врата теней'],
  };
  const list = defaultNames[discName] || ['Базовая сила', 'Продвинутая сила', 'Мастерская сила'];
  return list[level - 1] || `Сила уровня ${level}`;
}

/**
 * Generates a full, legal V5 character sheet according to 5th edition rules!
 */
export function generateV5Character(options: V5GeneratorOptions = {}): CharacterSheet {
  // 1. Clan Selection
  const allClanIds: ClanId[] = (Object.keys(CLAN_THEMES).filter(k => k !== 'custom') as ClanId[]);

  let selectedClan: ClanId = 'brujah';
  if (options.clanId && options.clanId !== 'random') {
    selectedClan = options.clanId;
  } else {
    selectedClan = allClanIds[Math.floor(Math.random() * allClanIds.length)];
  }

  const clanData = CLAN_THEMES[selectedClan] || CLAN_THEMES.brujah;

  // 2. Predator Type Selection
  const allPredatorKeys = Object.keys(PREDATOR_TYPES);
  let selectedPredatorKey = 'alleycat';
  if (options.predatorTypeId && options.predatorTypeId !== 'random') {
    selectedPredatorKey = options.predatorTypeId;
  } else {
    selectedPredatorKey = allPredatorKeys[Math.floor(Math.random() * allPredatorKeys.length)];
  }

  const predatorData = PREDATOR_TYPES[selectedPredatorKey] || PREDATOR_TYPES.alleycat;

  // 3. Concept Archetype Selection
  let archetype = CONCEPT_ARCHETYPES[0];
  if (options.conceptId && options.conceptId !== 'random') {
    const found = CONCEPT_ARCHETYPES.find((c) => c.id === options.conceptId);
    if (found) archetype = found;
  } else {
    // Try to pick an archetype matching the selected clan
    const matching = CONCEPT_ARCHETYPES.filter((c) => c.preferredClans.includes(selectedClan));
    if (matching.length > 0) {
      archetype = matching[Math.floor(Math.random() * matching.length)];
    } else {
      archetype = CONCEPT_ARCHETYPES[Math.floor(Math.random() * CONCEPT_ARCHETYPES.length)];
    }
  }

  // 4. Name and Sire
  const isFemale = Math.random() > 0.5;
  const chosenName = options.name || (isFemale
    ? V5_NAMES_FEMALE[Math.floor(Math.random() * V5_NAMES_FEMALE.length)]
    : V5_NAMES_MALE[Math.floor(Math.random() * V5_NAMES_MALE.length)]);

  const chosenSire = options.sire || V5_SIRES[Math.floor(Math.random() * V5_SIRES.length)];
  const chosenChronicle = V5_CHRONICLES[Math.floor(Math.random() * V5_CHRONICLES.length)];

  // 5. Attributes Distribution according to V5 rules:
  // Strictly: 1 at 4, 3 at 3, 4 at 2, 1 at 1 (Total: 22 dots)
  const attrPool = [4, 3, 3, 3, 2, 2, 2, 2, 1];
  const allAttrKeys: ('strength' | 'dexterity' | 'stamina' | 'charisma' | 'manipulation' | 'composure' | 'intelligence' | 'wits' | 'resolve')[] = [
    'strength', 'dexterity', 'stamina', 'charisma', 'manipulation', 'composure', 'intelligence', 'wits', 'resolve',
  ];

  // Sort keys according to archetype priorities first, then fill remaining
  const orderedKeys: typeof allAttrKeys = [];
  for (const k of archetype.attributePriority) {
    if (allAttrKeys.includes(k) && !orderedKeys.includes(k)) {
      orderedKeys.push(k);
    }
  }
  for (const k of allAttrKeys) {
    if (!orderedKeys.includes(k)) {
      orderedKeys.push(k);
    }
  }

  const assignedAttrs: Record<string, number> = {};
  orderedKeys.forEach((key, idx) => {
    assignedAttrs[key] = attrPool[idx];
  });

  const staminaVal = assignedAttrs.stamina || 2;
  const composureVal = assignedAttrs.composure || 2;
  const resolveVal = assignedAttrs.resolve || 2;

  const healthMax = staminaVal + 3;
  const willpowerMax = composureVal + resolveVal;

  // 6. Skills Distribution according to V5:
  let template = options.skillTemplate || 'balanced';
  if (template === 'random') {
    const templates: ('balanced' | 'specialist' | 'jack')[] = ['balanced', 'specialist', 'jack'];
    template = templates[Math.floor(Math.random() * templates.length)];
  }

  let skillPointsPool: number[] = [];
  if (template === 'jack') {
    // 1x3, 8x2, 10x1, 8x0 (27 skills)
    skillPointsPool = [
      3,
      2, 2, 2, 2, 2, 2, 2, 2,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0,
    ];
  } else if (template === 'specialist') {
    // 1x4, 3x3, 3x2, 3x1, 17x0
    skillPointsPool = [
      4,
      3, 3, 3,
      2, 2, 2,
      1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  } else {
    // balanced: 3x3, 5x2, 7x1, 12x0
    skillPointsPool = [
      3, 3, 3,
      2, 2, 2, 2, 2,
      1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  }

  // Base list of 27 skills
  const baseSkillsList: { id: string; name: string; nameEn: string; category: 'physical' | 'social' | 'mental' }[] = [
    // Physical (9)
    { id: 'ath', name: 'Атлетика', nameEn: 'Athletics', category: 'physical' },
    { id: 'brawl', name: 'Драка', nameEn: 'Brawl', category: 'physical' },
    { id: 'craft', name: 'Ремесло', nameEn: 'Craft', category: 'physical' },
    { id: 'drive', name: 'Вождение', nameEn: 'Drive', category: 'physical' },
    { id: 'firearms', name: 'Стрельба', nameEn: 'Firearms', category: 'physical' },
    { id: 'larceny', name: 'Воровство', nameEn: 'Larceny', category: 'physical' },
    { id: 'melee', name: 'Фехтование', nameEn: 'Melee', category: 'physical' },
    { id: 'stealth', name: 'Скрытность', nameEn: 'Stealth', category: 'physical' },
    { id: 'survival', name: 'Выживание', nameEn: 'Survival', category: 'physical' },
    // Social (9)
    { id: 'animalKen', name: 'Обр. с животными', nameEn: 'Animal Ken', category: 'social' },
    { id: 'etiquette', name: 'Этикет', nameEn: 'Etiquette', category: 'social' },
    { id: 'insight', name: 'Проницательность', nameEn: 'Insight', category: 'social' },
    { id: 'intimidation', name: 'Запугивание', nameEn: 'Intimidation', category: 'social' },
    { id: 'leadership', name: 'Лидерство', nameEn: 'Leadership', category: 'social' },
    { id: 'performance', name: 'Исполнение', nameEn: 'Performance', category: 'social' },
    { id: 'persuasion', name: 'Убеждение', nameEn: 'Persuasion', category: 'social' },
    { id: 'streetwise', name: 'Уличное чутьё', nameEn: 'Streetwise', category: 'social' },
    { id: 'subterfuge', name: 'Хитрость', nameEn: 'Subterfuge', category: 'social' },
    // Mental (9)
    { id: 'academics', name: 'Гуманитарные науки', nameEn: 'Academics', category: 'mental' },
    { id: 'awareness', name: 'Наблюдательность', nameEn: 'Awareness', category: 'mental' },
    { id: 'finance', name: 'Финансы', nameEn: 'Finance', category: 'mental' },
    { id: 'investigation', name: 'Расследование', nameEn: 'Investigation', category: 'mental' },
    { id: 'medicine', name: 'Медицина', nameEn: 'Medicine', category: 'mental' },
    { id: 'occult', name: 'Оккультизм', nameEn: 'Occult', category: 'mental' },
    { id: 'politics', name: 'Политика', nameEn: 'Politics', category: 'mental' },
    { id: 'science', name: 'Естественные науки', nameEn: 'Science', category: 'mental' },
    { id: 'technology', name: 'Техника', nameEn: 'Technology', category: 'mental' },
  ];

  // Prioritize archetype skills first
  const archetypeSkillIds = archetype.topSkills.map((s) => s.id);
  const prioritizedSkills = [
    ...baseSkillsList.filter((s) => archetypeSkillIds.includes(s.id)),
    ...baseSkillsList.filter((s) => !archetypeSkillIds.includes(s.id)),
  ];

  const generatedSkills: V5SkillItem[] = prioritizedSkills.map((skill, index) => {
    const val = skillPointsPool[index] || 0;
    let spec = '';

    // Assign specialty if skill points >= 3 or if archetype specifies it
    const archMatch = archetype.topSkills.find((s) => s.id === skill.id);
    if (archMatch && archMatch.specialty) {
      spec = archMatch.specialty;
    } else if (val >= 3) {
      // Common default specialties
      const commonSpecs: Record<string, string> = {
        brawl: 'Захваты',
        firearms: 'Пистолеты',
        melee: 'Ножи',
        stealth: 'Городские тени',
        investigation: 'Место преступления',
        academics: 'История',
        occult: 'Ритуалы',
        medicine: 'Первая помощь',
        persuasion: 'Переговоры',
        subterfuge: 'Маскировка мотивов',
        streetwise: 'Информаторы',
        technology: 'Сетевой взлом',
        drive: 'Экстремальное вождение',
        insight: 'Чтение эмоций',
        awareness: 'Засады',
      };
      spec = commonSpecs[skill.id] || 'Практика';
    }

    return {
      id: skill.id,
      name: skill.name,
      nameEn: skill.nameEn,
      value: val,
      category: skill.category,
      specialty: spec,
    };
  });

  // 7. Disciplines & Blood Powers selection from library:
  // V5 Rule: Neonate chooses 2 Clan disciplines: 1 at 2 dots, 1 at 1 dot.
  // Predator type grants +1 dot in a discipline (can be a 3rd discipline or enhance one of clan disciplines).
  const clanDiscs = clanData.disciplines || ['Мощь (Potence)', 'Стремительность (Celerity)', 'Величие (Presence)'];
  const predatorDiscs = predatorData.disciplines || [];

  // Pick primary and secondary clan disciplines
  const clanDisc1 = clanDiscs[0] || 'Мощь (Potence)';
  const clanDisc2 = clanDiscs[1] || 'Стремительность (Celerity)';

  let disc1Dots = 2;
  let disc2Dots = 1;
  let disc3Name = '';
  let disc3Dots = 0;

  // Apply predator discipline (+1 dot)
  if (predatorDiscs.length > 0) {
    const predDisc = predatorDiscs[0];
    if (predDisc === clanDisc1) {
      disc1Dots = 3;
    } else if (predDisc === clanDisc2) {
      disc2Dots = 2;
    } else {
      disc3Name = predDisc;
      disc3Dots = 1;
    }
  }

  // Populate powers for each discipline dot using real library powers
  const buildPowers = (discName: string, dots: number): string[] => {
    const powers: string[] = ['', '', '', '', ''];
    for (let i = 1; i <= dots && i <= 5; i++) {
      powers[i - 1] = pickPowerForDiscipline(discName, i);
    }
    return powers;
  };

  const v5Disciplines: V5DisciplineSlot[] = [
    {
      id: 'd1',
      name: clanDisc1,
      dots: disc1Dots,
      powers: buildPowers(clanDisc1, disc1Dots),
    },
    {
      id: 'd2',
      name: clanDisc2,
      dots: disc2Dots,
      powers: buildPowers(clanDisc2, disc2Dots),
    },
    {
      id: 'd3',
      name: disc3Name,
      dots: disc3Dots,
      powers: disc3Name ? buildPowers(disc3Name, disc3Dots) : ['', '', '', '', ''],
    },
    { id: 'd4', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd5', name: '', dots: 0, powers: ['', '', '', '', ''] },
    { id: 'd6', name: '', dots: 0, powers: ['', '', '', '', ''] },
  ];

  // 8. Advantages and Flaws from library (advantages.json):
  // Rule: 7 dots of Advantages, 2 dots of Flaws + Predator bonuses
  const allAdvLibrary = ALL_ADVANTAGES.filter((a) => a.kind === 'advantage');
  const allFlawLibrary = ALL_ADVANTAGES.filter((a) => a.kind === 'disadvantage');

  // Sample solid advantages from library
  const pickedMerits: V5AdvantageItem[] = [
    {
      id: `m-haven-${Date.now()}`,
      name: 'Убежище (Haven)',
      dots: 2,
      type: 'advantage',
      description: 'Безопасное укрытие от дневного света с дополнительной защитой.',
    },
    {
      id: `m-contacts-${Date.now()}`,
      name: 'Связи (Contacts)',
      dots: 2,
      type: 'advantage',
      description: 'Надежные информаторы в полиции, криминале или городских службах.',
    },
    {
      id: `m-resources-${Date.now()}`,
      name: 'Ресурсы (Resources)',
      dots: 2,
      type: 'advantage',
      description: 'Стабильные денежные средства, банковские счета и наличные.',
    },
    {
      id: `m-ironwill-${Date.now()}`,
      name: 'Железная воля (Iron Will)',
      dots: 1,
      type: 'advantage',
      description: 'Стойкость разума против внушений и ментального контроля.',
    },
  ];

  // Sample solid flaws from library
  const pickedFlaws: V5AdvantageItem[] = [
    {
      id: `f-enemy-${Date.now()}`,
      name: 'Враг (Enemy)',
      dots: 2,
      type: 'flaw',
      description: 'Опасный противник из смертной жизни или конкурирующий неонат.',
    },
  ];

  // Predator adjustments
  if (selectedPredatorKey === 'alleycat') {
    pickedMerits.push({
      id: `m-pred-contacts-${Date.now()}`,
      name: 'Контакты: Криминальный мир',
      dots: 2,
      type: 'advantage',
      description: 'Связи со скупщиками краденого и уличными бандами.',
    });
    pickedFlaws.push({
      id: `f-pred-criminal-${Date.now()}`,
      name: 'Преступник (Criminal)',
      dots: 2,
      type: 'flaw',
      description: 'Полицейские сводки и ориентировки на розыск.',
    });
  } else if (selectedPredatorKey === 'siren') {
    pickedMerits.push({
      id: `m-pred-beauty-${Date.now()}`,
      name: 'Прекрасная внешность (Beautiful)',
      dots: 2,
      type: 'advantage',
      description: 'Притягательная внешность, дающая бонус к соблазнению.',
    });
    pickedFlaws.push({
      id: `f-pred-enemy-${Date.now()}`,
      name: 'Отвергнутый поклонник (Enemy)',
      dots: 1,
      type: 'flaw',
      description: 'Ревнивый бывший партнер, преследующий персонажа.',
    });
  } else if (selectedPredatorKey === 'sandman') {
    pickedMerits.push({
      id: `m-pred-resources-${Date.now()}`,
      name: 'Ресурсы: Ценности из спален',
      dots: 1,
      type: 'advantage',
      description: 'Украденные вещи и драгоценности во время ночной охоты.',
    });
  }

  // Pad to 14 rows each
  const finalMerits: V5AdvantageItem[] = [...pickedMerits];
  while (finalMerits.length < 14) {
    finalMerits.push({ id: `m-empty-${finalMerits.length + 1}`, name: '', dots: 0, type: 'advantage' });
  }

  const finalFlaws: V5AdvantageItem[] = [...pickedFlaws];
  while (finalFlaws.length < 14) {
    finalFlaws.push({ id: `f-empty-${finalFlaws.length + 1}`, name: '', dots: 0, type: 'flaw' });
  }

  const finalCombinedAdvantages = [...pickedMerits, ...pickedFlaws];
  while (finalCombinedAdvantages.length < 18) {
    finalCombinedAdvantages.push({ id: `adv-empty-${finalCombinedAdvantages.length + 1}`, name: '', dots: 0 });
  }

  // 9. Humanity and Blood Potency
  let humanityVal = 7;
  if (['alleycat', 'blood_leech', 'pursuer', 'montero'].includes(selectedPredatorKey)) {
    humanityVal = 6;
  } else if (['consensualist', 'grim_reaper'].includes(selectedPredatorKey)) {
    humanityVal = 8;
  }

  const bloodPotencyVal = selectedPredatorKey === 'blood_leech' ? 2 : 1;
  const genInfo = getGenerationInfo(13);

  // 10. Dates calculation
  const currentYear = new Date().getFullYear();
  const embraceYear = currentYear - (20 + Math.floor(Math.random() * 20));
  const birthYear = embraceYear - (24 + Math.floor(Math.random() * 14));
  const trueAge = currentYear - birthYear;
  const apparentAge = embraceYear - birthYear;

  // Assemble full sheet
  return {
    id: `vtm-${Date.now()}`,
    syncCode: 'LOCAL',
    updatedAt: new Date().toISOString(),
    info: {
      name: options.blankStory ? '' : chosenName,
      player: '',
      chronicle: options.blankStory ? '' : chosenChronicle,
      concept: options.blankStory ? '' : archetype.title,
      conceptDetail: options.blankStory ? '' : archetype.title,
      clan: selectedClan,
      generation: 13,
      sire: options.blankStory ? '' : chosenSire,
      ambition: options.blankStory ? '' : archetype.ambition,
      purpose: options.blankStory ? '' : archetype.ambition,
      desire: options.blankStory ? '' : archetype.desire,
      predatorType: `${predatorData.name} (${predatorData.nameEn})`,
      touchstones: options.blankStory ? '' : archetype.touchstone,
      chronicleTenet: options.blankStory ? '' : archetype.chronicleTenet,
      haven: options.blankStory ? '' : archetype.haven,
      sect: options.blankStory ? 'Камарилья' : archetype.sect,
      title: 'Неонат',
    },
    attributes: {
      physical: {
        strength: { id: 'str', name: 'Сила', nameEn: 'Strength', value: assignedAttrs.strength },
        dexterity: { id: 'dex', name: 'Ловкость', nameEn: 'Dexterity', value: assignedAttrs.dexterity },
        stamina: { id: 'sta', name: 'Выносливость', nameEn: 'Stamina', value: assignedAttrs.stamina },
      },
      social: {
        charisma: { id: 'cha', name: 'Харизма', nameEn: 'Charisma', value: assignedAttrs.charisma },
        manipulation: { id: 'man', name: 'Манипуляция', nameEn: 'Manipulation', value: assignedAttrs.manipulation },
        appearance: { id: 'app', name: 'Внешность', nameEn: 'Appearance', value: 2 },
        composure: { id: 'com', name: 'Самообладание', nameEn: 'Composure', value: assignedAttrs.composure },
      },
      mental: {
        perception: { id: 'per', name: 'Восприятие', nameEn: 'Perception', value: assignedAttrs.wits },
        intelligence: { id: 'int', name: 'Интеллект', nameEn: 'Intelligence', value: assignedAttrs.intelligence },
        wits: { id: 'wit', name: 'Смекалка', nameEn: 'Wits', value: assignedAttrs.wits },
        resolve: { id: 'res', name: 'Решительность', nameEn: 'Resolve', value: assignedAttrs.resolve },
      },
    },
    v5Skills: generatedSkills,
    v5Tracks: {
      health: { max: healthMax, superficial: 0, aggravated: 0 },
      willpower: { max: willpowerMax, superficial: 0, aggravated: 0 },
      humanity: { value: humanityVal, stains: 0 },
      hunger: 1,
    },
    v5Disciplines,
    v5Advantages: finalCombinedAdvantages,
    v5Merits: finalMerits,
    v5Flaws: finalFlaws,
    v5Blood: {
      potency: bloodPotencyVal,
      bloodSurge: bloodPotencyVal === 2 ? '+2 кубика' : '+1 кубик',
      mendAmount: bloodPotencyVal === 2 ? '2 поверхностных' : '1 поверхностный',
      powerBonus: bloodPotencyVal === 2 ? '+1 кубик' : 'Нет',
      rouseReroll: '1-й уровень',
      baneSeverity: 2,
      feedingPenalty: bloodPotencyVal === 2 ? 'Кровь животных не утоляет Голод' : 'Нет ограничений',
      clanBane: clanData.bane || clanData.weakness,
      clanCompulsion: clanData.compulsion || '',
    },
    v5Bio: {
      portraitUrl: '',
      rank: 'Неонат',
      totalXp: 15,
      spentXp: 0,
      birthDate: options.blankStory ? '' : `14 мая ${birthYear} г.`,
      deathDate: options.blankStory ? '' : `22 октября ${embraceYear} г.`,
      trueAge: options.blankStory ? '' : `${trueAge} лет`,
      apparentAge: options.blankStory ? '' : `${apparentAge} лет`,
      distinguishingFeatures: options.blankStory ? '' : archetype.distinguishingFeatures,
      bloodBonds: 'Нет активных уз крови.',
      appearance: options.blankStory ? '' : archetype.appearance,
      history: options.blankStory ? '' : archetype.history,
      inventory: options.blankStory ? '' : archetype.inventory,
    },
    pageNotes: options.blankStory
      ? ''
      : `Заметки хроники:\n- ${archetype.diaryNote}\n- Барон доков предупредил о запрете кормления возле порта.\n- Слухи о проверках со стороны Камарильи.`,
    abilities: { talents: [], skills: [], knowledges: [] },
    disciplines: [],
    backgrounds: [],
    virtues: { conscience: 3, conscienceType: 'Совесть', selfControl: 3, selfControlType: 'Самоконтроль', courage: 4 },
    humanity: { rating: humanityVal, pathName: 'Человечность (Humanity)', bearing: 'Нормальность (Штраф 0)' },
    willpower: { permanent: willpowerMax, current: willpowerMax },
    bloodPool: { current: 10, max: genInfo.maxBlood, perTurn: genInfo.bloodPerTurn },
    health: [],
    meritsAndFlaws: [],
    experience: {
      total: 15,
      spent: 0,
      unspent: 15,
      log: [{ id: '1', reason: 'Создание персонажа (V5)', amount: 15, type: 'gained', date: new Date().toISOString().slice(0, 10) }],
    },
    notes: {
      apparentAge: options.blankStory ? '' : `${apparentAge} лет`,
      dateOfBirth: options.blankStory ? '' : `${birthYear} г.`,
      dateOfEmbrace: options.blankStory ? '' : `${embraceYear} г.`,
      appearanceDescription: options.blankStory ? '' : archetype.appearance,
      havenDescription: options.blankStory ? '' : archetype.haven,
      equipment: options.blankStory ? '' : archetype.inventory,
      otherNotes: options.blankStory ? '' : archetype.diaryNote,
    },
    v5HeaderSlots: [...DEFAULT_HEADER_SLOTS],
  };
}
