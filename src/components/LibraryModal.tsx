import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  LIBRARY_DISCIPLINES,
  LIBRARY_MERITS_FLAWS,
  LIBRARY_BACKGROUNDS,
  LIBRARY_ARCHETYPES,
  LIBRARY_PATHS,
  LibraryDiscipline,
  LibraryMeritFlaw,
  LibraryBackground,
  LibraryArchetype,
  LibraryPath,
} from '../data/library';
import { BookOpen, Search, Plus, Check, ShieldCheck, Sparkles, User, Compass } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDiscipline: (discipline: LibraryDiscipline) => void;
  onAddMeritFlaw: (item: LibraryMeritFlaw) => void;
  onAddBackground: (bg: LibraryBackground) => void;
  onSelectArchetype: (arch: LibraryArchetype, target: 'nature' | 'demeanor') => void;
  onSelectPath: (path: LibraryPath) => void;
  initialTab?: 'disciplines' | 'merits' | 'backgrounds' | 'archetypes' | 'paths';
  id?: string;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onAddDiscipline,
  onAddMeritFlaw,
  onAddBackground,
  onSelectArchetype,
  onSelectPath,
  initialTab = 'disciplines',
}) => {
  const [activeTab, setActiveTab] = useState<'disciplines' | 'merits' | 'backgrounds' | 'archetypes' | 'paths'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const markAdded = (id: string) => {
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const filteredDisciplines = LIBRARY_DISCIPLINES.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clans.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeritsFlaws = LIBRARY_MERITS_FLAWS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBackgrounds = LIBRARY_BACKGROUNDS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchetypes = LIBRARY_ARCHETYPES.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPaths = LIBRARY_PATHS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      id="vtm-library-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          Библиотека Мира Тьмы (Быстрое заполнение)
        </span>
      }
      subtitle="Выберите дисциплину, достоинство, предысторию или архетип для добавления в лист"
      maxWidth="max-w-4xl"
    >
      {/* Search & Tabs bar */}
      <div className="space-y-3 pb-3 border-b border-red-900/20">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="library-search-input"
            type="text"
            placeholder="Поиск по названию, клану или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-zinc-800 text-sm text-zinc-200 rounded-lg focus:border-red-900 focus:outline-none"
          />
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs font-serif">
          <button
            id="tab-lib-disciplines"
            onClick={() => setActiveTab('disciplines')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'disciplines'
                ? 'bg-red-950 text-red-200 font-bold border border-red-900/80 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Дисциплины ({filteredDisciplines.length})
          </button>
          <button
            id="tab-lib-merits"
            onClick={() => setActiveTab('merits')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'merits'
                ? 'bg-red-950 text-red-200 font-bold border border-red-900/80 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Достоинства и Недостатки ({filteredMeritsFlaws.length})
          </button>
          <button
            id="tab-lib-backgrounds"
            onClick={() => setActiveTab('backgrounds')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backgrounds'
                ? 'bg-red-950 text-red-200 font-bold border border-red-900/80 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Предыстории ({filteredBackgrounds.length})
          </button>
          <button
            id="tab-lib-archetypes"
            onClick={() => setActiveTab('archetypes')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'archetypes'
                ? 'bg-red-950 text-red-200 font-bold border border-red-900/80 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Архетипы (Натура / Маска) ({filteredArchetypes.length})
          </button>
          <button
            id="tab-lib-paths"
            onClick={() => setActiveTab('paths')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paths'
                ? 'bg-red-950 text-red-200 font-bold border border-red-900/80 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            Пути Просветления ({filteredPaths.length})
          </button>
        </div>
      </div>

      {/* Content depending on tab */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        {/* TAB: DISCIPLINES */}
        {activeTab === 'disciplines' && (
          <div className="space-y-4">
            {filteredDisciplines.map((d) => (
              <div
                key={d.id}
                className="bg-[#0a0a0a] border border-red-900/20 hover:border-red-900/50 rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-900">
                  <div>
                    <h3 className="text-base font-bold text-red-500 font-serif flex items-center gap-2">
                      {d.name}
                      <span className="text-xs text-zinc-500 font-sans font-normal">
                        ({d.nameEn})
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.clans.map((clan, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] bg-red-950/60 text-red-300 border border-red-900/50 rounded-full"
                        >
                          {clan}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    id={`add-disc-${d.id}`}
                    onClick={() => {
                      onAddDiscipline(d);
                      markAdded(d.id);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md ${
                      addedIds[d.id]
                        ? 'bg-emerald-800 text-white'
                        : 'bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-900/80'
                    }`}
                  >
                    {addedIds[d.id] ? (
                      <>
                        <Check className="w-4 h-4" /> Добавлено!
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Добавить в лист
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-300 my-2 leading-relaxed">
                  {d.description}
                </p>

                {/* Dot power list preview */}
                <div className="space-y-1.5 mt-3 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 block font-sans">
                    Уровни способностей (1-5 точек):
                  </span>
                  {d.powers.map((p) => (
                    <div
                      key={p.level}
                      className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-850 flex items-start gap-2"
                    >
                      <div
                        className="flex items-center gap-1 shrink-0 px-1.5 py-1 rounded bg-red-950/80 border border-red-900/50 mt-0.5"
                        title={`Уровень силы: ${p.level}`}
                        aria-label={`Уровень ${p.level}`}
                      >
                        {Array.from({ length: p.level }, (_, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.85)]"
                          />
                        ))}
                      </div>
                      <div>
                        <strong className="text-white font-serif">{p.name}:</strong>{' '}
                        <span className="text-zinc-400">{p.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: MERITS & FLAWS */}
        {activeTab === 'merits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMeritsFlaws.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0a0a] border border-red-900/20 hover:border-red-900/50 rounded-xl p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 font-bold font-mono rounded-full border ${
                        item.type === 'merit'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-red-950/60 text-red-300 border-red-800'
                      }`}
                    >
                      {item.type === 'merit' ? 'Достоинство' : 'Недостаток'} ({item.points} {item.points === 1 ? 'очко' : 'очка'})
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-sans tracking-wider">{item.category}</span>
                  </div>
                  <h4 className="text-sm font-bold font-serif text-white">{item.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
                <div className="pt-3 mt-2 border-t border-zinc-900 flex justify-end">
                  <button
                    id={`add-mf-${item.id}`}
                    onClick={() => {
                      onAddMeritFlaw(item);
                      markAdded(item.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow ${
                      addedIds[item.id]
                        ? 'bg-emerald-800 text-white'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {addedIds[item.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> В листе
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Добавить
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: BACKGROUNDS */}
        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBackgrounds.map((bg) => (
              <div
                key={bg.id}
                className="bg-[#0a0a0a] border border-red-900/20 hover:border-red-900/50 rounded-xl p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold font-serif text-white">{bg.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{bg.description}</p>
                </div>
                <div className="pt-3 mt-2 border-t border-zinc-900 flex justify-end">
                  <button
                    id={`add-bg-${bg.id}`}
                    onClick={() => {
                      onAddBackground(bg);
                      markAdded(bg.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow ${
                      addedIds[bg.id]
                        ? 'bg-emerald-800 text-white'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {addedIds[bg.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> В листе
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Добавить в предыстории
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ARCHETYPES */}
        {activeTab === 'archetypes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredArchetypes.map((arch) => (
              <div
                key={arch.id}
                className="bg-[#0a0a0a] border border-red-900/20 hover:border-red-900/50 rounded-xl p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold font-serif text-white flex items-center gap-1.5">
                    {arch.name}
                    <span className="text-xs text-zinc-500 font-sans font-normal">
                      ({arch.nameEn})
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{arch.description}</p>
                  <div className="mt-2 text-[11px] text-red-200/80 bg-red-950/30 p-2 rounded border border-red-900/40">
                    <strong className="text-white font-serif">Восстановление Силы Воли:</strong> {arch.recovery}
                  </div>
                </div>
                <div className="pt-3 mt-2 border-t border-zinc-900 flex items-center justify-end gap-2">
                  <button
                    id={`set-nature-${arch.id}`}
                    onClick={() => {
                      onSelectArchetype(arch, 'nature');
                      markAdded(`${arch.id}-nature`);
                    }}
                    className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-800 cursor-pointer"
                  >
                    {addedIds[`${arch.id}-nature`] ? '✓ Задано!' : 'Как Натура'}
                  </button>
                  <button
                    id={`set-demeanor-${arch.id}`}
                    onClick={() => {
                      onSelectArchetype(arch, 'demeanor');
                      markAdded(`${arch.id}-demeanor`);
                    }}
                    className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-800 cursor-pointer"
                  >
                    {addedIds[`${arch.id}-demeanor`] ? '✓ Задано!' : 'Как Маска'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: PATHS */}
        {activeTab === 'paths' && (
          <div className="space-y-3">
            {filteredPaths.map((path) => (
              <div
                key={path.id}
                className="bg-[#0a0a0a] border border-red-900/20 hover:border-red-900/50 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-900">
                  <h4 className="text-sm font-bold font-serif text-red-500">{path.name}</h4>
                  <button
                    id={`select-path-${path.id}`}
                    onClick={() => {
                      onSelectPath(path);
                      markAdded(path.id);
                    }}
                    className="px-3 py-1 text-xs bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-900/80 rounded-lg cursor-pointer"
                  >
                    {addedIds[path.id] ? '✓ Выбран!' : 'Выбрать этот Путь'}
                  </button>
                </div>
                <p className="text-xs text-zinc-300 mt-2">{path.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-zinc-400">
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                    <strong className="text-white font-serif">Добродетели:</strong> {path.virtues}
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                    <strong className="text-white font-serif">Аура / Влияние:</strong> {path.bearing}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
