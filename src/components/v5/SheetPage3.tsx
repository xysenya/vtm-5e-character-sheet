import React, { useRef, useState } from 'react';
import { CharacterSheet, V5BioData } from '../../types';
import { SheetHeader, SectionDivider } from './SheetHeader';
import { useIsPrinting } from '../../utils/useIsPrinting';
import { PortraitCropModal } from '../PortraitCropModal';
import { Crop } from 'lucide-react';
import { RichTextarea } from './RichTextarea';

interface SheetPage3Props {
  sheet: CharacterSheet;
  onChange: (updated: CharacterSheet) => void;
  onShowAlert?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  isDark?: boolean;
  bioHeight?: number;
  inventoryHeight?: number;
}

export const SheetPage3: React.FC<SheetPage3Props> = ({
  sheet,
  onChange,
  onShowAlert,
  isDark = false,
  bioHeight = 280,
  inventoryHeight = 140,
}) => {
  const isPrinting = useIsPrinting();
  const ph = (text: string) => (isPrinting ? '' : text);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for image cropping modal
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const bio: V5BioData = sheet.v5Bio || {
    portraitUrl: '',
    rank: 'Неонат',
    totalXp: sheet.experience?.total || 15,
    spentXp: sheet.experience?.spent || 8,
    birthDate: sheet.notes?.dateOfBirth || '',
    deathDate: sheet.notes?.dateOfEmbrace || '',
    trueAge: '',
    apparentAge: sheet.notes?.apparentAge || '',
    distinguishingFeatures: '',
    bloodBonds: '',
    appearance: sheet.notes?.appearanceDescription || '',
    history: '',
    inventory: sheet.notes?.equipment || '',
  };

  const handleBioChange = (key: keyof V5BioData, value: any) => {
    onChange({
      ...sheet,
      v5Bio: {
        ...bio,
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Image processing & Cropping handler (supports drag-and-drop or manual file choose)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (onShowAlert) {
        onShowAlert(
          'Неверный формат',
          'Пожалуйста, выберите файл изображения (JPEG, PNG, WebP и т.д.).',
          'warning'
        );
      }
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      if (onShowAlert) {
        onShowAlert(
          'Файл слишком велик',
          'Размер исходного файла превышает 15 МБ. Пожалуйста, выберите изображение меньшего размера.',
          'warning'
        );
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCropImageSrc(result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const inputBg = isDark
    ? 'bg-zinc-900/60 border-zinc-700 text-zinc-100 focus:border-red-500 focus:bg-zinc-900'
    : 'bg-white/80 border-zinc-400 text-zinc-900 focus:border-red-700 focus:bg-white';

  const availableXp = Math.max(0, bio.totalXp - bio.spentXp);

  return (
    <div
      className={`relative w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 sm:p-6 mb-8 rounded-sm shadow-xl transition-colors page-break sheet-page-3 print:p-0 print:m-0 print:max-w-full print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col justify-start ${
        isDark ? 'sheet-theme-dark bg-[#0f0f11] text-zinc-100 border border-zinc-800' : 'sheet-theme-light bg-[#faf8f5] text-zinc-900 border border-zinc-300'
      }`}
      style={{
        boxShadow: isDark
          ? '0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(153, 27, 27, 0.1)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
      }}
    >
      <SheetHeader
        pageTitle="Биография и Инвентарь"
        themeMode={isDark ? 'dark' : 'light'}
        useGraphicLogo={sheet.v5UseGraphicLogo}
      />

      {/* TOP SECTION: PORTRAIT & XP (LEFT) + IDENTITY TABLE (RIGHT) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 print:grid-cols-12 gap-5 print:gap-3 my-2 text-xs print-calib-p3-top-grid">
        {/* Left (5 cols): Portrait & XP */}
        <div className="sm:col-span-5 print:col-span-5 space-y-3 min-w-0">
          {/* Portrait Box */}
          <div className="flex flex-col items-center">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  processImageFile(file);
                }
              }}
              className={`relative w-44 h-56 rounded-sm border-2 overflow-hidden flex flex-col items-center justify-center group transition-all ${
                isDraggingOver
                  ? 'border-red-500 ring-2 ring-red-500/50 scale-102 bg-red-950/40'
                  : isDark
                  ? 'border-red-900/50 bg-zinc-900/80'
                  : 'border-red-900/40 bg-zinc-100'
              }`}
            >
              {bio.portraitUrl ? (
                <>
                  <img
                    src={bio.portraitUrl}
                    alt="Портрет персонажа"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCropImageSrc(bio.portraitUrl);
                        setCropModalOpen(true);
                      }}
                      className="w-full py-1 text-[11px] font-serif bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-800/80 rounded cursor-pointer text-center flex items-center justify-center gap-1"
                      title="Настроить кадрирование текущего портрета"
                    >
                      <Crop className="w-3 h-3 text-red-400" />
                      <span>Кадрировать</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1 text-[11px] font-serif bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer text-center"
                    >
                      Заменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBioChange('portraitUrl', '')}
                      className="w-full py-1 text-[11px] font-serif bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded cursor-pointer text-center"
                    >
                      Удалить
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-3">
                  <span className={`text-3xl block mb-1 ${isDark ? 'text-red-500' : 'text-red-800'}`}>👤</span>
                  <p className={`font-serif text-[11px] mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {isDraggingOver ? 'Отпустите файл здесь' : 'Портрет персонажа'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-serif uppercase tracking-wider bg-red-900 hover:bg-red-800 text-white rounded cursor-pointer shadow"
                  >
                    Загрузить фото
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFile}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Rank */}
          <div className="flex flex-col gap-0.5">
            <label className={`font-benguiat uppercase font-bold text-[10px] tracking-wider ${isDark ? 'text-red-600' : 'text-red-800'}`}>
              Ранг
            </label>
            <input
              type="text"
              value={bio.rank}
              onChange={(e) => handleBioChange('rank', e.target.value)}
              placeholder={ph('Неонат / Анцилла / Старейшина')}
              className={`px-2 py-1 border rounded-xs font-serif text-xs transition-colors ${inputBg}`}
            />
          </div>

          {/* XP Bar */}
          <div className={`p-2.5 rounded-sm border ${isDark ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-300 bg-white/70'}`}>
            <div className={`font-benguiat font-bold uppercase tracking-wider text-[10px] mb-2 text-center border-b border-red-900/20 pb-1 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
              Очки опыта (XP)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] block opacity-70">Всего</span>
                <input
                  type="number"
                  min={0}
                  value={bio.totalXp}
                  onChange={(e) => handleBioChange('totalXp', parseInt(e.target.value) || 0)}
                  className={`w-full text-center font-mono font-bold text-sm bg-transparent border-b ${
                    isDark ? 'border-zinc-700 text-zinc-100' : 'border-zinc-400 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <span className="text-[10px] block opacity-70">Потрачено</span>
                <input
                  type="number"
                  min={0}
                  value={bio.spentXp}
                  onChange={(e) => handleBioChange('spentXp', parseInt(e.target.value) || 0)}
                  className={`w-full text-center font-mono font-bold text-sm bg-transparent border-b ${
                    isDark ? 'border-zinc-700 text-zinc-100' : 'border-zinc-400 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <span className="text-[10px] block opacity-70">Остаток</span>
                <div className={`font-mono font-bold text-sm pt-0.5 ${isDark ? 'text-red-600' : 'text-red-700'}`}>
                  {availableXp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right (7 cols): Identity Table */}
        <div className="sm:col-span-7 print:col-span-7 space-y-2 min-w-0 flex flex-col">
          <SectionDivider title="Сведения о Сородиче" isDark={isDark} />

          <div className={`border rounded-sm overflow-hidden flex-1 flex flex-col ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`}>
            <table className="w-full text-left border-collapse text-xs flex-1 flex flex-col">
              <tbody className="flex-1 flex flex-col">
                <tr className={`border-b shrink-0 flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <td className={`py-2 px-3 font-benguiat font-semibold w-1/2 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Дата рождения
                  </td>
                  <td className="py-1 px-3 w-1/2 flex justify-end">
                    <input
                      type="text"
                      value={bio.birthDate}
                      onChange={(e) => handleBioChange('birthDate', e.target.value)}
                      placeholder={ph('Напр. 14 мая 1968 г.')}
                      className={`w-full text-left px-1 py-0.5 bg-transparent border-b border-dotted font-serif ${
                        isDark ? 'border-zinc-700 text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-400 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    />
                  </td>
                </tr>

                <tr className={`border-b shrink-0 flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <td className={`py-2 px-3 font-benguiat font-semibold w-1/2 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Дата смерти (Становление)
                  </td>
                  <td className="py-1 px-3 w-1/2 flex justify-end">
                    <input
                      type="text"
                      value={bio.deathDate}
                      onChange={(e) => handleBioChange('deathDate', e.target.value)}
                      placeholder={ph('Напр. 22 октября 1996 г.')}
                      className={`w-full text-left px-1 py-0.5 bg-transparent border-b border-dotted font-serif ${
                        isDark ? 'border-zinc-700 text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-400 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    />
                  </td>
                </tr>

                <tr className={`border-b shrink-0 flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <td className={`py-2 px-3 font-benguiat font-semibold w-1/2 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Истинный возраст
                  </td>
                  <td className="py-1 px-3 w-1/2 flex justify-end">
                    <input
                      type="text"
                      value={bio.trueAge}
                      onChange={(e) => handleBioChange('trueAge', e.target.value)}
                      placeholder={ph('Напр. 58 лет')}
                      className={`w-full text-left px-1 py-0.5 bg-transparent border-b border-dotted font-serif ${
                        isDark ? 'border-zinc-700 text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-400 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    />
                  </td>
                </tr>

                <tr className={`border-b shrink-0 flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <td className={`py-2 px-3 font-benguiat font-semibold w-1/2 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Видимый возраст
                  </td>
                  <td className="py-1 px-3 w-1/2 flex justify-end">
                    <input
                      type="text"
                      value={bio.apparentAge}
                      onChange={(e) => handleBioChange('apparentAge', e.target.value)}
                      placeholder={ph('Напр. 28 лет')}
                      className={`w-full text-left px-1 py-0.5 bg-transparent border-b border-dotted font-serif ${
                        isDark ? 'border-zinc-700 text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-400 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    />
                  </td>
                </tr>

                <tr className={`border-b flex-1 min-h-[64px] ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <td className={`py-2 px-3 font-benguiat font-semibold align-top w-2/5 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Отличительные черты
                  </td>
                  <td className="p-2 flex-1 flex flex-col">
                    <RichTextarea
                      value={bio.distinguishingFeatures}
                      onChange={(val) => handleBioChange('distinguishingFeatures', val)}
                      placeholder={ph('Шрамы, татуировки, клыки, дефекты...')}
                      isDark={isDark}
                      className={`w-full flex-1 p-1.5 bg-transparent match-sheet-bg border border-dotted rounded-xs font-serif leading-snug print:bg-transparent ${
                        isDark ? 'border-zinc-700 text-zinc-100' : 'border-zinc-400 text-zinc-900'
                      }`}
                    />
                  </td>
                </tr>

                <tr className="flex-1 min-h-[64px]">
                  <td className={`py-2 px-3 font-benguiat font-semibold align-top w-2/5 shrink-0 ${isDark ? 'text-red-600' : 'text-red-800'}`}>
                    Узы крови
                  </td>
                  <td className="p-2 flex-1 flex flex-col">
                    <RichTextarea
                      value={bio.bloodBonds}
                      onChange={(val) => handleBioChange('bloodBonds', val)}
                      placeholder={ph('Кому обязан или кто привязан...')}
                      isDark={isDark}
                      className={`w-full flex-1 p-1.5 bg-transparent match-sheet-bg border border-dotted rounded-xs font-serif leading-snug print:bg-transparent ${
                        isDark ? 'border-zinc-700 text-zinc-100' : 'border-zinc-400 text-zinc-900'
                      }`}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* APPEARANCE & HISTORY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 my-2.5 print:my-2 text-xs print-calib-p3-bio-grid">
        <div className="space-y-1 min-w-0 flex flex-col">
          <SectionDivider title="Внешность" isDark={isDark} />
          <RichTextarea
            value={bio.appearance}
            onChange={(val) => handleBioChange('appearance', val)}
            placeholder={ph('Описание телосложения, манеры держаться, одежды и голоса...')}
            minHeight={bioHeight}
            height={bioHeight}
            style={{ minHeight: `${bioHeight}px`, height: `${bioHeight}px` }}
            isDark={isDark}
            className={`w-full p-2.5 print:p-2 border rounded-xs font-serif text-xs transition-colors leading-relaxed print-white-bg print-calib-p3-bio-editor ${inputBg}`}
          />
        </div>

        <div className="space-y-1 min-w-0 flex flex-col">
          <SectionDivider title="История" isDark={isDark} />
          <RichTextarea
            value={bio.history}
            onChange={(val) => handleBioChange('history', val)}
            placeholder={ph('Смертная жизнь, обстоятельства Становления, сир, важные события...')}
            minHeight={bioHeight}
            height={bioHeight}
            style={{ minHeight: `${bioHeight}px`, height: `${bioHeight}px` }}
            isDark={isDark}
            className={`w-full p-2.5 print:p-2 border rounded-xs font-serif text-xs transition-colors leading-relaxed print-white-bg print-calib-p3-bio-editor ${inputBg}`}
          />
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="section-avoid-break my-2 print:my-1 text-xs print-calib-p3-inventory-section flex flex-col">
        <SectionDivider title="Инвентарь" isDark={isDark} />
        <RichTextarea
          value={bio.inventory}
          onChange={(val) => handleBioChange('inventory', val)}
          placeholder={ph('Снаряжение, оружие, документы, транспорт, ключи от убежища, личные вещи...')}
          minHeight={inventoryHeight}
          height={inventoryHeight}
          style={{ minHeight: `${inventoryHeight}px`, height: `${inventoryHeight}px` }}
          isDark={isDark}
          className={`w-full p-3 print:p-2 border rounded-xs font-serif text-xs transition-colors leading-relaxed print-white-bg print-calib-p3-inventory-editor ${inputBg}`}
        />
      </div>

      {/* Portrait Cropper Modal */}
      <PortraitCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropModalOpen(false)}
        onSave={(croppedDataUrl) => {
          handleBioChange('portraitUrl', croppedDataUrl);
          setCropModalOpen(false);
        }}
        onSelectAnotherFile={() => fileInputRef.current?.click()}
        isDark={isDark}
      />
    </div>
  );
};
