import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Droplet } from 'lucide-react';

interface ParticleHeart {
  type: 'heart';
  x: number;
  startX: number;
  y: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  alpha: number;
  maxAlpha: number;
}

interface ParticleBlood {
  type: 'blood';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
  targetGround: number;
}

interface ParticleSplash {
  type: 'splash';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ParticleRipple {
  type: 'ripple';
  x: number;
  y: number;
  rx: number;
  ry: number;
  maxRx: number;
  color: string;
  alpha: number;
  growth: number;
}

type Particle = ParticleHeart | ParticleBlood | ParticleSplash | ParticleRipple;

const HEART_COLORS = [
  '#ef4444',
  '#dc2626',
  '#f43f5e',
  '#e11d48',
  '#be123c',
  '#ff4d6d',
  '#ff758f',
  '#b91c1c',
];

const BLOOD_COLORS = [
  '#880808',
  '#990000',
  '#b91c1c',
  '#a80010',
  '#7f1d1d',
  '#dc2626',
  '#6b0512',
  '#991b1b',
];

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;

  ctx.beginPath();
  const topY = -size * 0.35;
  const bottomY = size * 0.65;
  const halfW = size * 0.55;

  ctx.moveTo(0, topY);
  // Left curve
  ctx.bezierCurveTo(-halfW * 0.7, topY - size * 0.45, -halfW * 1.3, topY + size * 0.3, 0, bottomY);
  // Right curve
  ctx.bezierCurveTo(halfW * 1.3, topY + size * 0.3, halfW * 0.7, topY - size * 0.45, 0, topY);
  ctx.closePath();
  ctx.fill();

  // Glossy highlight on the upper left lobe
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-halfW * 0.4, topY - size * 0.05, size * 0.12, size * 0.08, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBloodDroplet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;

  // Teardrop: pointed at top (0, -height/2), round bulb at bottom (0, height/2)
  ctx.beginPath();
  const halfW = width / 2;
  const halfH = height / 2;
  ctx.moveTo(0, -halfH);
  ctx.bezierCurveTo(-halfW * 0.4, -halfH * 0.15, -halfW, halfH * 0.25, -halfW, halfH * 0.6);
  ctx.bezierCurveTo(-halfW, halfH * 0.98, -halfW * 0.5, halfH, 0, halfH);
  ctx.bezierCurveTo(halfW * 0.5, halfH, halfW, halfH * 0.98, halfW, halfH * 0.6);
  ctx.bezierCurveTo(halfW, halfH * 0.25, halfW * 0.4, -halfH * 0.15, 0, -halfH);
  ctx.closePath();
  ctx.fill();

  // Glossy specular highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-halfW * 0.35, halfH * 0.45, halfW * 0.16, halfH * 0.22, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSplash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRipple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

interface EasterEggEffectsProps {
  isDark?: boolean;
}

export const EasterEggEffects: React.FC<EasterEggEffectsProps> = ({ isDark = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Resize canvas according to device pixel ratio
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Main animation loop
  const runAnimationLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const newSplashes: Particle[] = [];

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.type === 'heart') {
        p.phase += p.swaySpeed;
        p.y += p.vy;
        p.x = p.startX + Math.sin(p.phase) * p.swayAmp;
        p.rotation += p.rotSpeed;

        // Smooth fade-in at top and fade-out near bottom
        if (p.y < 100) {
          p.alpha = Math.min(p.maxAlpha, (p.y + 40) / 140 * p.maxAlpha);
        } else if (p.y > h - 120) {
          p.alpha = Math.max(0, ((h - p.y) / 120) * p.maxAlpha);
        }

        drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);

        if (p.y > h + 50 || p.alpha <= 0.01) {
          particles.splice(i, 1);
        }
      } else if (p.type === 'blood') {
        p.y += p.vy;
        p.x += p.vx;
        p.vy += 0.12; // Slight gravity acceleration

        drawBloodDroplet(ctx, p.x, p.y, p.width, p.height, p.color, p.alpha);

        // Check if blood droplet hits the ground/viewport bottom
        if (p.y >= p.targetGround) {
          // Spawn expanding ground ripple
          newSplashes.push({
            type: 'ripple',
            x: p.x,
            y: p.targetGround,
            rx: 2,
            ry: 1,
            maxRx: p.width * 1.5,
            color: p.color,
            alpha: 0.8,
            growth: 1.2,
          });

          // Spawn 3-5 little splash droplets popping upward
          const splashCount = 3 + Math.floor(Math.random() * 3);
          for (let s = 0; s < splashCount; s++) {
            newSplashes.push({
              type: 'splash',
              x: p.x + (Math.random() - 0.5) * 6,
              y: p.targetGround,
              vx: (Math.random() - 0.5) * 5,
              vy: -2 - Math.random() * 4.5,
              radius: 1.5 + Math.random() * 2,
              color: p.color,
              alpha: 0.9,
              decay: 0.035 + Math.random() * 0.02,
            });
          }

          particles.splice(i, 1);
        }
      } else if (p.type === 'splash') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Splash gravity
        p.alpha -= p.decay;

        drawSplash(ctx, p.x, p.y, p.radius, p.color, p.alpha);

        if (p.alpha <= 0.01 || p.y > h + 10) {
          particles.splice(i, 1);
        }
      } else if (p.type === 'ripple') {
        p.rx += p.growth;
        p.ry = p.rx * 0.45;
        p.alpha -= 0.035;

        drawRipple(ctx, p.x, p.y, p.rx, p.ry, p.color, p.alpha);

        if (p.alpha <= 0.01 || p.rx >= p.maxRx) {
          particles.splice(i, 1);
        }
      }
    }

    if (newSplashes.length > 0) {
      particles.push(...newSplashes);
    }

    if (particles.length > 0) {
      animFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
    } else {
      ctx.clearRect(0, 0, w, h);
      setIsActive(false);
      animFrameIdRef.current = null;
    }
  }, []);

  const ensureLoopRunning = useCallback(() => {
    setIsActive(true);
    updateCanvasSize();
    if (!animFrameIdRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
    }
  }, [runAnimationLoop, updateCanvasSize]);

  // Trigger: Falling Hearts Animation
  const triggerHearts = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const heartCount = 55;

    for (let i = 0; i < heartCount; i++) {
      const size = 18 + Math.random() * 20;
      const startX = Math.random() * w;
      particlesRef.current.push({
        type: 'heart',
        x: startX,
        startX,
        // Stagger spawn positions above the screen
        y: -30 - Math.random() * (h * 0.65),
        vy: 1.8 + Math.random() * 2.2,
        swayAmp: 18 + Math.random() * 32,
        swaySpeed: 0.018 + Math.random() * 0.024,
        phase: Math.random() * Math.PI * 2,
        size,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        alpha: 0,
        maxAlpha: 0.85 + Math.random() * 0.15,
      });
    }

    ensureLoopRunning();
  }, [ensureLoopRunning]);

  // Trigger: Blood Rain Animation
  const triggerBlood = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dropCount = 75;

    for (let i = 0; i < dropCount; i++) {
      const width = 12 + Math.random() * 12;
      const height = width * (1.35 + Math.random() * 0.45);
      const startX = Math.random() * w;
      const groundOffset = 10 + Math.random() * 25;

      particlesRef.current.push({
        type: 'blood',
        x: startX,
        // Stagger spawn positions above the screen
        y: -40 - Math.random() * (h * 0.85),
        vx: (Math.random() - 0.5) * 0.6,
        vy: 7.5 + Math.random() * 7.5,
        width,
        height,
        color: BLOOD_COLORS[Math.floor(Math.random() * BLOOD_COLORS.length)],
        alpha: 0.88 + Math.random() * 0.12,
        targetGround: h - groundOffset,
      });
    }

    ensureLoopRunning();
  }, [ensureLoopRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Fullscreen particle canvas (overlay, non-blocking) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden no-print"
        style={{
          display: isActive ? 'block' : 'none',
        }}
        aria-hidden="true"
      />

      {/* Easter egg text & interactive icons under the disclaimer */}
      <div className="mt-4 pt-3 border-t border-red-950/20 dark:border-red-950/40 flex items-center justify-center gap-1.5 text-xs select-none">
        <span className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
          Сделано с
        </span>

        {/* Heart button */}
        <button
          type="button"
          onClick={triggerHearts}
          title="Запустить дождь из сердечек"
          aria-label="Запустить дождь из сердечек"
          className="inline-flex items-center justify-center p-1 rounded-full text-red-500 hover:text-red-400 hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
        >
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 group-hover:fill-red-400 group-hover:text-red-400 transition-transform duration-200 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
        </button>

        <span className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
          и
        </span>

        {/* Blood droplet button */}
        <button
          type="button"
          onClick={triggerBlood}
          title="Запустить дождь из капелек крови"
          aria-label="Запустить дождь из капелек крови"
          className="inline-flex items-center justify-center p-1 rounded-full text-red-600 hover:text-red-500 hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-red-600"
        >
          <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600 group-hover:fill-red-500 group-hover:text-red-500 transition-transform duration-200 drop-shadow-[0_0_5px_rgba(220,38,38,0.6)]" />
        </button>
      </div>
    </>
  );
};
