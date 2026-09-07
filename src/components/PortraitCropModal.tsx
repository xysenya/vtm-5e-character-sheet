import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Check,
  X,
  Grid3X3,
  Move,
  Upload,
} from 'lucide-react';

interface PortraitCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
  onSelectAnotherFile?: () => void;
  isDark?: boolean;
}

type AspectRatioOption = {
  label: string;
  ratio: number; // width / height
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Портрет листа (11:14)', ratio: 11 / 14 },
  { label: 'Квадрат (1:1)', ratio: 1 / 1 },
  { label: 'Классика (3:4)', ratio: 3 / 4 },
];

export const PortraitCropModal: React.FC<PortraitCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  onSelectAnotherFile,
  isDark = true,
}) => {
  // Crop settings state
  const [aspectRatio, setAspectRatio] = useState<number>(11 / 14);
  const [zoom, setZoom] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(0.2);
  const [maxZoom, setMaxZoom] = useState<number>(4);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Loaded image ref
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  // Canvas refs
  const interactiveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Size of crop area inside container
  const CROP_BOX_WIDTH = 264; // px
  const cropBoxHeight = Math.round(CROP_BOX_WIDTH / aspectRatio);

  // Load Image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      imgRef.current = null;
      setIsImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setIsImageLoaded(true);

      // Calculate initial zoom so image covers the crop box nicely
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Fit or fill initial scale
      const scaleX = CROP_BOX_WIDTH / imgW;
      const scaleY = (CROP_BOX_WIDTH / (11 / 14)) / imgH;
      const initialFillScale = Math.max(scaleX, scaleY);

      setZoom(initialFillScale);
      setMinZoom(Math.max(0.05, initialFillScale * 0.3));
      setMaxZoom(Math.max(3, initialFillScale * 5));
      setOffset({ x: 0, y: 0 });
      setRotation(0);
      setFlipH(false);
    };
    img.onerror = () => {
      setIsImageLoaded(false);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw Interactive and Preview Canvases
  const drawCanvases = useCallback(() => {
    const img = imgRef.current;
    if (!img || !isImageLoaded) return;

    // 1. Draw Main Interactive Canvas
    const canvas = interactiveCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const w = CROP_BOX_WIDTH;
        const h = cropBoxHeight;
        canvas.width = w;
        canvas.height = h;

        // Clear canvas
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        // Move origin to center of crop box
        ctx.translate(w / 2 + offset.x, h / 2 + offset.y);
        ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) {
          ctx.scale(-1, 1);
        }
        ctx.scale(zoom, zoom);

        // Draw image centered at (0, 0)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        // Optional Rule-of-Thirds Grid
        if (showGrid) {
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // subtle red grid
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);

          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(w / 3, 0);
          ctx.lineTo(w / 3, h);
          ctx.moveTo((2 * w) / 3, 0);
          ctx.lineTo((2 * w) / 3, h);

          // Horizontal lines
          ctx.moveTo(0, h / 3);
          ctx.lineTo(w, h / 3);
          ctx.moveTo(0, (2 * h) / 3);
          ctx.lineTo(w, (2 * h) / 3);
          ctx.stroke();

          // Outer guide border
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.setLineDash([]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(0, 0, w, h);
          ctx.restore();
        }
      }
    }

    // 2. Draw Preview Canvas (Mini sheet preview: 110px wide)
    const prevCanvas = previewCanvasRef.current;
    if (prevCanvas) {
      const prevCtx = prevCanvas.getContext('2d');
      if (prevCtx) {
        const prevW = 110;
        const prevH = Math.round(prevW / aspectRatio);
        prevCanvas.width = prevW;
        prevCanvas.height = prevH;

        const scaleRatio = prevW / CROP_BOX_WIDTH;

        prevCtx.fillStyle = '#0a0a0c';
        prevCtx.fillRect(0, 0, prevW, prevH);

        prevCtx.save();
        prevCtx.translate(prevW / 2 + offset.x * scaleRatio, prevH / 2 + offset.y * scaleRatio);
        prevCtx.rotate((rotation * Math.PI) / 180);
        if (flipH) {
          prevCtx.scale(-1, 1);
        }
        prevCtx.scale(zoom * scaleRatio, zoom * scaleRatio);
        prevCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        prevCtx.restore();
      }
    }
  }, [CROP_BOX_WIDTH, cropBoxHeight, offset, rotation, flipH, zoom, showGrid, isImageLoaded, aspectRatio]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Zoom centered on crop frame
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev * factor)));
  };

  // Quick Action Buttons
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH((prev) => !prev);
  };

  const handleFitToFrame = () => {
    const img = imgRef.current;
    if (!img) return;
    const isRotated = rotation === 90 || rotation === 270;
    const imgW = isRotated ? img.naturalHeight : img.naturalWidth;
    const imgH = isRotated ? img.naturalWidth : img.naturalHeight;

    // Fit so entire image is inside frame
    const scale = Math.min(CROP_BOX_WIDTH / imgW, cropBoxHeight / imgH);
    setZoom(scale);
    setOffset({ x: 0, y: 0 });
  };

  const handleFillFrame = () => {
    const img = imgRef.current;
    if (!img) return;
    const isRotated = rotation === 90 || rotation === 270;
    const imgW = isRotated ? img.naturalHeight : img.naturalWidth;
    const imgH = isRotated ? img.naturalWidth : img.naturalHeight;

    // Fill so frame is completely covered
    const scale = Math.max(CROP_BOX_WIDTH / imgW, cropBoxHeight / imgH);
    setZoom(scale);
    setOffset({ x: 0, y: 0 });
  };

  const handleResetCenter = () => {
    setOffset({ x: 0, y: 0 });
  };

  // Export High-Resolution Cropped Image
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !isImageLoaded) return;

    // High resolution target canvas (Crisp 3x for print & retina display)
    // 176px x 224px * 3 = 528px x 672px
    const exportWidth = 528;
    const exportHeight = Math.round(exportWidth / aspectRatio);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const scaleRatio = exportWidth / CROP_BOX_WIDTH;

    // Draw background
    ctx.fillStyle = '#111113';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Apply transform matching interactive canvas exactly
    ctx.save();
    ctx.translate(exportWidth / 2 + offset.x * scaleRatio, exportHeight / 2 + offset.y * scaleRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) {
      ctx.scale(-1, 1);
    }
    ctx.scale(zoom * scaleRatio, zoom * scaleRatio);

    // Use high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Export as clean JPEG (quality 0.92) or PNG
    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    onSave(croppedDataUrl);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-100">
          <Crop className="w-5 h-5 text-red-500" />
          <span>Кадрирование портрета</span>
        </div>
      }
      subtitle="Перетаскивайте и масштабируйте изображение, чтобы выбрать область для портрета на листе"
      maxWidth="max-w-2xl"
      id="vtm-portrait-crop-modal"
    >
      <div className="space-y-4 text-zinc-200">
        {/* Aspect Ratio Tabs & Guide Grid Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
            <span className="text-zinc-400 font-serif px-2 hidden sm:inline">Пропорции:</span>
            {ASPECT_RATIOS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setAspectRatio(item.ratio)}
                className={`px-2.5 py-1 rounded font-serif text-xs transition-colors cursor-pointer ${
                  Math.abs(aspectRatio - item.ratio) < 0.01
                    ? 'bg-red-900 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer ${
              showGrid
                ? 'bg-red-950/60 border-red-800/70 text-red-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Сетка третей для центрирования взгляда и лица"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Сетка третей</span>
          </button>
        </div>

        {/* Main Workspace: Interactive Cropper + Live Preview Sidebar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* Left: Interactive Cropper Canvas (8 cols) */}
          <div className="sm:col-span-8 flex flex-col items-center">
            <div
              ref={containerRef}
              onWheel={handleWheel}
              className="relative bg-zinc-950 rounded-xl border-2 border-red-900/60 p-4 shadow-inner flex flex-col items-center justify-center overflow-hidden select-none w-full max-w-[340px] touch-none"
              style={{ minHeight: '360px' }}
            >
              {/* Instructions banner */}
              <div className="absolute top-2 left-2 right-2 text-center pointer-events-none z-10">
                <span className="text-[10px] font-serif tracking-wide px-2 py-0.5 rounded-full bg-black/75 border border-zinc-800 text-zinc-400 flex items-center justify-center gap-1 mx-auto w-fit">
                  <Move className="w-2.5 h-2.5 text-red-400" />
                  Перетаскивайте мышью или пальцем • Колесо для зума
                </span>
              </div>

              {/* The Crop Canvas Frame */}
              <div
                className="relative rounded border-2 border-red-700/80 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing group transition-shadow"
                style={{
                  width: `${CROP_BOX_WIDTH}px`,
                  height: `${cropBoxHeight}px`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 20px rgba(185, 28, 28, 0.3)',
                }}
              >
                <canvas
                  ref={interactiveCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="block w-full h-full"
                />
              </div>

              {/* Corner framing ornaments */}
              <div className="absolute bottom-2 text-[10px] text-zinc-500 font-mono">
                {rotation !== 0 && `Поворот: ${rotation}° `}
                {flipH && `• Отражено `}
                {`Масштаб: ${(zoom / minZoom).toFixed(1)}x`}
              </div>
            </div>

            {/* Zoom Slider Controls */}
            <div className="w-full max-w-[340px] mt-3 space-y-1.5 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-serif">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-red-400" />
                  <span>Масштаб:</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-400 font-bold">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(minZoom, z * 0.9))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  title="Уменьшить"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={(maxZoom - minZoom) / 100}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-red-600 cursor-pointer h-1.5 bg-zinc-700 rounded-lg appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(maxZoom, z * 1.1))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  title="Увеличить"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Tools + Live Preview (4 cols) */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-start space-y-3.5 w-full">
            {/* Live Sheet Preview */}
            <div className="w-full bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 flex flex-col items-center text-center">
              <span className="text-xs font-serif font-semibold text-zinc-300 mb-2 block">
                Вид на листе персонажа:
              </span>
              <div
                className={`rounded-sm border-2 overflow-hidden shadow-lg ${
                  isDark ? 'border-red-900/60 bg-zinc-950' : 'border-red-900/40 bg-zinc-100'
                }`}
                style={{ width: '110px', height: `${Math.round(110 / aspectRatio)}px` }}
              >
                <canvas ref={previewCanvasRef} className="w-full h-full block" />
              </div>
              <span className="text-[10px] font-sans text-zinc-500 mt-1.5">
                Итоговый портрет на стр. 3
              </span>
            </div>

            {/* Transform Controls Toolbar */}
            <div className="w-full bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-serif text-zinc-300 block font-semibold">
                Инструменты подгонки:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleFillFrame}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Масштабировать изображение так, чтобы оно полностью закрыло рамку"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Заполнить</span>
                </button>
                <button
                  type="button"
                  onClick={handleFitToFrame}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Вписать изображение целиком в рамку"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Вписать</span>
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Повернуть на 90 градусов по часовой стрелке"
                >
                  <RotateCw className="w-3.5 h-3.5 text-red-400" />
                  <span>Повернуть</span>
                </button>
                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Отразить по горизонтали"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-red-400" />
                  <span>Отразить</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetCenter}
                className="w-full py-1 text-center text-xs text-zinc-400 hover:text-zinc-200 hover:underline cursor-pointer block"
              >
                Вернуть в центр
              </button>
            </div>

            {/* Select Another File Button */}
            {onSelectAnotherFile && (
              <button
                type="button"
                onClick={onSelectAnotherFile}
                className="w-full py-2 px-3 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-serif flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Выбрать другой файл</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-serif text-xs transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            id="vtm-save-cropped-portrait-btn"
            onClick={handleApplyCrop}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-red-950 hover:from-red-800 hover:to-red-900 text-white font-serif font-bold text-xs tracking-wide border border-red-700/60 shadow-lg shadow-red-950/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Применить кадрирование</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
