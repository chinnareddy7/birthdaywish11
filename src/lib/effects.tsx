import { useMemo } from 'react';

export interface Theme {
  bg: string;
  accent: string;
  accent2: string;
  gradient: string;
}

export const THEMES: Record<string, Theme> = {
  pink: { bg: '#07050F', accent: '#FF4DA6', accent2: '#C026D3', gradient: 'linear-gradient(135deg, #ff6eb0 0%, #c026d3 50%, #7c3aed 100%)' },
  purple: { bg: '#0a0618', accent: '#A78BFA', accent2: '#7C3AED', gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2e1065 100%)' },
  blue: { bg: '#050b18', accent: '#60A5FA', accent2: '#2563EB', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)' },
  gold: { bg: '#0f0a05', accent: '#F59E0B', accent2: '#D97706', gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)' },
  neon: { bg: '#050f0a', accent: '#34D399', accent2: '#059669', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)' },
};

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES.pink;
}

// Deterministic-ish RNG so memoized arrays stay stable across re-renders.
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Confetti burst from the top-center, raining down with horizontal spread.
export function CelebrationConfetti() {
  const pieces = useMemo(() => Array.from({ length: 80 }).map((_, i) => {
    const colors = ['#FF4DA6', '#A78BFA', '#FCD34D', '#60A5FA', '#34D399', '#FF8FB3', '#C026D3'];
    const r = rand(i + 1);
    return {
      id: i,
      left: rand(i + 2) * 100,
      delay: rand(i + 3) * 0.5,
      duration: 3 + rand(i + 4) * 3,
      color: colors[i % colors.length],
      size: 6 + rand(i + 5) * 10,
      rotate: rand(i + 6) * 360,
    };
  }), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-fall-loop"
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: 2,
            boxShadow: `0 0 6px ${p.color}66`,
          }}
        />
      ))}
    </div>
  );
}

// Explosion confetti radiating from a center point.
export function ConfettiExplosion() {
  const pieces = useMemo(() => Array.from({ length: 70 }).map((_, i) => {
    const colors = ['#FF4DA6', '#A78BFA', '#FCD34D', '#60A5FA', '#34D399', '#FF8FB3'];
    const angle = (i / 70) * Math.PI * 2 + rand(i) * 0.4;
    const dist = 120 + rand(i + 7) * 260;
    return {
      id: i,
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist + 80}px`,
      delay: rand(i + 3) * 0.2,
      duration: 1.6 + rand(i + 4) * 1.4,
      color: colors[i % colors.length],
      size: 6 + rand(i + 5) * 9,
    };
  }), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="animate-confetti-burst-loop"
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: 2,
            ['--dx' as any]: p.dx,
            ['--dy' as any]: p.dy,
            ['--dur' as any]: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 8px ${p.color}88`,
          }}
        />
      ))}
    </div>
  );
}

// Balloons rising from the bottom of the screen.
export function RisingBalloons({ accent, accent2 }: { accent: string; accent2: string }) {
  const balloons = useMemo(() => Array.from({ length: 14 }).map((_, i) => {
    const palette = [accent, accent2, '#FCD34D', '#FF8FB3', '#A78BFA'];
    const color = palette[i % palette.length];
    const size = 44 + Math.round(rand(i + 1) * 36);
    const left = `${Math.round(rand(i + 2) * 92 + 4)}%`;
    const drift = `${(rand(i + 3) - 0.5) * 120}px`;
    const dur = `${4 + rand(i + 4) * 4}s`;
    const delay = `${rand(i + 5) * 2.5}s`;
    return { id: i, color, size, left, drift, dur, delay };
  }), [accent, accent2]);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {balloons.map((b) => (
        <div
          key={b.id}
          className="animate-balloon-rise"
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: b.left,
            ['--drift' as any]: b.drift,
            ['--dur' as any]: b.dur,
            animationDelay: b.delay,
          }}
        >
          <div style={{ width: b.size, height: b.size * 1.2, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: `radial-gradient(circle at 33% 28%, ${b.color}dd, ${b.color}77)`, boxShadow: `0 0 16px ${b.color}55` }}>
            <div style={{ width: b.size * 0.22, height: b.size * 0.12, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', margin: '18% 0 0 18%' }} />
          </div>
          <div style={{ width: 1, height: 50, background: `${b.color}55`, margin: '0 auto' }} />
        </div>
      ))}
    </div>
  );
}

// Floating hearts drifting upward.
export function FloatingHearts({ accent }: { accent: string }) {
  const hearts = useMemo(() => Array.from({ length: 16 }).map((_, i) => {
    const palette = [accent, '#FF8FB3', '#FCD34D', '#A78BFA'];
    return {
      id: i,
      left: `${Math.round(rand(i + 1) * 94 + 3)}%`,
      size: 14 + Math.round(rand(i + 2) * 18),
      delay: `${rand(i + 3) * 3}s`,
      dur: `${3.5 + rand(i + 4) * 3}s`,
      rot: `${(rand(i + 5) - 0.5) * 40}deg`,
      color: palette[i % palette.length],
    };
  }), [accent]);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997, overflow: 'hidden' }}>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="animate-heart-up"
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: h.left,
            ['--dur' as any]: h.dur,
            ['--rot' as any]: h.rot,
            animationDelay: h.delay,
            color: h.color,
            fontSize: h.size,
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 9 3C10.5 3 12 4 12 4C12 4 13.5 3 15 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// Twinkling sparkle stars scattered across the viewport.
export function SparkleField({ count = 26 }: { count?: number }) {
  const dots = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const colors = ['#FF4DA6', '#A78BFA', '#FCD34D', '#60A5FA', '#34D399'];
    return {
      id: i,
      top: `${Math.round(rand(i + 1) * 100)}%`,
      left: `${Math.round(rand(i + 2) * 100)}%`,
      color: colors[i % colors.length],
      size: 4 + Math.round(rand(i + 3) * 7),
      delay: `${rand(i + 4) * 3}s`,
    };
  }), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {dots.map((d) => (
        <div key={d.id} className="animate-sparkle-twinkle" style={{ position: 'absolute', top: d.top, left: d.left, animationDelay: d.delay }}>
          <div style={{ width: d.size, height: d.size, transform: 'rotate(45deg)', background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
        </div>
      ))}
    </div>
  );
}

// Floating sparkles rising upward (used during the countdown).
export function RisingSparkles({ count = 20 }: { count?: number }) {
  const sparkles = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const colors = ['#FFD700', '#FF4DA6', '#A78BFA', '#60A5FA'];
    return {
      id: i,
      left: `${Math.round(rand(i + 1) * 96 + 2)}%`,
      size: 6 + Math.round(rand(i + 2) * 10),
      delay: `${rand(i + 3) * 2}s`,
      color: colors[i % colors.length],
    };
  }), [count]);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
      {sparkles.map((s) => (
        <div key={s.id} className="animate-sparkle-up" style={{ position: 'absolute', bottom: '10%', left: s.left, animationDelay: s.delay }}>
          <div style={{ width: s.size, height: s.size, transform: 'rotate(45deg)', background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
        </div>
      ))}
    </div>
  );
}

// Sparse floating hearts for page backgrounds (lighter than FloatingHearts).
export function LightHearts({ accent, count = 8 }: { accent: string; count?: number }) {
  const hearts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.round(rand(i + 11) * 90 + 5)}%`,
    size: 14 + Math.round(rand(i + 12) * 14),
    delay: `${rand(i + 13) * 4}s`,
    dur: `${5 + rand(i + 14) * 4}s`,
    rot: `${(rand(i + 15) - 0.5) * 30}deg`,
  })), [accent, count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {hearts.map((h) => (
        <div key={h.id} className="animate-heart-up" style={{ position: 'absolute', bottom: '-20px', left: h.left, ['--dur' as any]: h.dur, ['--rot' as any]: h.rot, animationDelay: h.delay, color: `${accent}55`, opacity: 0.5 }}>
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 9 3C10.5 3 12 4 12 4C12 4 13.5 3 15 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z" /></svg>
        </div>
      ))}
    </div>
  );
}
