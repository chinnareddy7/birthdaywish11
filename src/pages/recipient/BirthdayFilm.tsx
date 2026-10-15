import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import './BirthdayFilm.css';

interface Props {
  recipientName: string;
  onComplete: () => void;
}

/* Pen-stroke plugin for underline */
try {
  gsap.registerPlugin({
    name: 'drawn',
    init(target: SVGPathElement, value: number) {
      const len = target.getTotalLength ? target.getTotalLength() : 300;
      target.style.strokeDasharray = `${len}`;
      (this as any).target = target;
      (this as any).len = len;
      (this as any).value = value;
    },
    render(ratio: number, data: any) {
      data.target.style.strokeDashoffset = `${data.len * (1 - data.value * ratio)}`;
    },
  });
} catch {
  // Ignore if already registered
}

const BLOSSOM = [
  { c0: '#ffe1ec', c1: '#ff80aa' },
  { c0: '#ffd0e0', c1: '#f4577f' },
  { c0: '#ffc4d2', c1: '#e23b67' },
  { c0: '#ffd9c4', c1: '#ff8a5b' },
  { c0: '#ffeec2', c1: '#f6b13e' },
  { c0: '#ffd2e6', c1: '#e84d9a' },
];

const T_TIMELINE = {
  trunkStart: 0.10,
  branchSpan: 1.80,
  bloomT0: 1.25,
  bloomSpan: 2.00,
  petalT0: 2.45,
  noteStart: 0.45,
  done: 4.60,
};

const SS = 168;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function heartShape(c: CanvasRenderingContext2D, x: number, top: number, w: number, h: number) {
  c.beginPath();
  c.moveTo(x, top + h * 0.28);
  c.bezierCurveTo(x, top, x - w * 0.5, top, x - w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x - w * 0.5, top + h * 0.6, x - w * 0.16, top + h * 0.8, x, top + h);
  c.bezierCurveTo(x + w * 0.16, top + h * 0.8, x + w * 0.5, top + h * 0.6, x + w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x + w * 0.5, top, x, top, x, top + h * 0.28);
  c.closePath();
}

function makeBlossom({ c0, c1 }: { c0: string; c1: string }, soft: boolean) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = SS;
  const c = cv.getContext('2d')!;
  const w = SS * 0.62;
  const h = SS * 0.58;
  const x = SS / 2;
  const top = SS * 0.17;

  c.save();
  c.shadowColor = 'rgba(150,38,72,0.32)';
  c.shadowBlur = SS * 0.085;
  c.shadowOffsetY = SS * 0.05;
  c.fillStyle = c1;
  heartShape(c, x, top, w, h);
  c.fill();
  c.restore();

  const g = c.createRadialGradient(x - w * 0.2, top + h * 0.2, h * 0.04, x, top + h * 0.42, h * 0.92);
  g.addColorStop(0, c0);
  g.addColorStop(0.55, c1);
  g.addColorStop(1, shade(c1, -26));
  heartShape(c, x, top, w, h);
  c.fillStyle = g;
  c.fill();

  c.save();
  heartShape(c, x, top, w, h);
  c.clip();
  const g2 = c.createLinearGradient(0, top, 0, top + h);
  g2.addColorStop(0, 'rgba(255,255,255,0)');
  g2.addColorStop(0.65, 'rgba(110,16,46,0)');
  g2.addColorStop(1, 'rgba(110,16,46,0.26)');
  c.fillStyle = g2;
  c.fillRect(0, 0, SS, SS);
  c.globalAlpha = 0.55;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.ellipse(x - w * 0.15, top + h * 0.24, w * 0.17, h * 0.11, -0.5, 0, Math.PI * 2);
  c.fill();
  c.restore();

  if (!soft) return cv;

  const cv2 = document.createElement('canvas');
  cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d')!;
  c2.filter = 'blur(2.6px)';
  c2.drawImage(cv, 0, 0);
  c2.filter = 'none';
  c2.globalCompositeOperation = 'source-atop';
  c2.globalAlpha = 0.42;
  c2.fillStyle = '#fff3ea';
  c2.fillRect(0, 0, SS, SS);
  return cv2;
}

function makeBokeh(rgb: string) {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},0.9)`);
  g.addColorStop(0.45, `rgba(${rgb},0.22)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  return cv;
}

function makeSparkle() {
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d')!;
  const m = S / 2;
  const g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.25, 'rgba(255,236,200,0.5)');
  g.addColorStop(1, 'rgba(255,236,200,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(m, m, m, 0, 6.2832);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.translate(m, m);
  for (let k = 0; k < 2; k++) {
    c.beginPath();
    c.moveTo(0, -m);
    c.quadraticCurveTo(0, 0, m, 0);
    c.quadraticCurveTo(0, 0, 0, m);
    c.quadraticCurveTo(0, 0, -m, 0);
    c.quadraticCurveTo(0, 0, 0, -m);
    c.fill();
    c.rotate(Math.PI / 4);
    c.scale(0.5, 0.5);
  }
  return cv;
}

export default function BirthdayFilm({ recipientName, onComplete }: Props) {
  const [showDoneActions, setShowDoneActions] = useState(false);
  const [isWishIn, setIsWishIn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const motesRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const targetHeartRef = useRef<HTMLSpanElement>(null);
  const heartGlowRef = useRef<HTMLSpanElement>(null);
  const aimRef = useRef<HTMLDivElement>(null);
  const archeryRef = useRef<HTMLDivElement>(null);
  const bowRef = useRef<SVGSVGElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const strLRef = useRef<SVGLineElement>(null);
  const strRRef = useRef<SVGLineElement>(null);
  const servingRef = useRef<SVGCircleElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const fgridRef = useRef<HTMLDivElement>(null);
  const kEyebrowRef = useRef<HTMLParagraphElement>(null);
  const kSubRef = useRef<HTMLParagraphElement>(null);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBotRef = useRef<HTMLDivElement>(null);
  const ulinePathRef = useRef<SVGPathElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>();

  const line1CharsRef = useRef<HTMLSpanElement[]>([]);
  const line2CharsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    let alive = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let rx = 0;
    let ry = 0;
    let groundY = 0;

    let branches: any[] = [];
    let hearts: any[] = [];
    let petals: any[] = [];
    let rested: any[] = [];
    let orbs: any[] = [];
    let floaters: any[] = [];
    let twinkles: any[] = [];
    let bgGrad: CanvasGradient | null = null;
    let glowGrad: CanvasGradient | null = null;
    let groundGrad: CanvasGradient | null = null;

    let SPR = { crisp: [] as HTMLCanvasElement[], soft: [] as HTMLCanvasElement[] };
    let BOKEH: HTMLCanvasElement[] = [];
    let SPARKLE: HTMLCanvasElement | null = null;
    let heartPoly: number[][] | null = null;

    function buildSprites() {
      SPR = {
        crisp: BLOSSOM.map((b) => makeBlossom(b, false)),
        soft: BLOSSOM.map((b) => makeBlossom(b, true)),
      };
      BOKEH = [makeBokeh('255,224,188'), makeBokeh('255,196,214'), makeBokeh('255,238,210')];
      SPARKLE = makeSparkle();
    }

    function buildHeartPoly() {
      const raw: number[][] = [];
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (let i = 0; i <= 160; i++) {
        const t = (i / 160) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        raw.push([x, y]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;
      const hw = (maxX - minX) / 2;
      const hh = (maxY - minY) / 2;
      heartPoly = raw.map(([x, y]) => [(x - midX) / hw, (y - midY) / hh]);
    }

    function pointInPoly(x: number, y: number) {
      if (!heartPoly) return false;
      let inside = false;
      const p = heartPoly;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
        if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
      }
      return inside;
    }

    const quad = (b: any, t: number) => {
      const m = 1 - t, a = m * m, k = 2 * m * t, d = t * t;
      return { x: a * b.x1 + k * b.cx + d * b.x2, y: a * b.y1 + k * b.cy + d * b.y2 };
    };

    function barkGrad(x1: number, y1: number, x2: number, y2: number, depth: number) {
      const g = ctx!.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, `hsl(348 26% ${26 + depth * 3}%)`);
      g.addColorStop(1, `hsl(346 24% ${40 + depth * 5}%)`);
      return g;
    }

    function buildScene() {
      branches = [];
      hearts = [];
      petals = [];
      rested = [];
      twinkles = [];
      orbs = [];
      floaters = [];
      buildHeartPoly();

      const wide = W / H > 1.2;
      cx = W * (wide ? 0.57 : 0.5);
      cy = H * (wide ? 0.37 : 0.38);
      ry = Math.min(H * (wide ? 0.33 : 0.33), W * 0.34);
      rx = ry * 1.16;
      groundY = H * 0.93;

      bgGrad = ctx!.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#fff3e9');
      bgGrad.addColorStop(0.46, '#ffe7d6');
      bgGrad.addColorStop(0.78, '#fcd9c4');
      bgGrad.addColorStop(1, '#f3c4b5');

      glowGrad = ctx!.createRadialGradient(cx, cy, ry * 0.1, cx, cy, ry * 1.55);
      glowGrad.addColorStop(0, 'rgba(255,219,170,0.6)');
      glowGrad.addColorStop(0.5, 'rgba(255,170,150,0.2)');
      glowGrad.addColorStop(1, 'rgba(255,170,150,0)');

      groundGrad = ctx!.createRadialGradient(cx, H * 1.02, ry * 0.2, cx, H * 1.02, ry * 1.6);
      groundGrad.addColorStop(0, 'rgba(255,205,165,0.5)');
      groundGrad.addColorStop(1, 'rgba(255,205,165,0)');

      for (let i = 0; i < 11; i++) {
        orbs.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(W * 0.05, W * 0.17),
          vy: rand(-6, -16),
          drift: rand(-0.3, 0.3),
          phase: rand(0, 6.28),
          alpha: rand(0.05, 0.13),
          sprite: pick(BOKEH),
        });
      }

      const FN = wide ? 18 : 15;
      for (let i = 0; i < FN; i++) {
        const depth = Math.random();
        floaters.push({
          x: rand(0, W),
          y: rand(-H * 0.1, H * 1.1),
          depth,
          idx: (Math.random() * BLOSSOM.length) | 0,
          box: lerp(Math.min(W, H) * 0.025, Math.min(W, H) * 0.075, depth),
          vy: lerp(7, 20, depth),
          sway: rand(8, 22),
          phase: rand(0, 6.28),
          rot: rand(-0.4, 0.4),
          vrot: rand(-0.5, 0.5),
          baseA: lerp(0.16, 0.5, depth),
          soft: depth < 0.45,
        });
      }

      const baseX = cx;
      const baseY = H * 1.0;
      const trunkTopY = cy + ry * 0.62;
      const trunkW = Math.max(9, W * 0.024);
      const limbLen = ry * 0.6;
      const insidePx = (x: number, y: number, m = 0.9) => pointInPoly((x - cx) / (rx * m), (cy - y) / (ry * m));

      function addBranch(x: number, y: number, ang: number, len: number, w0: number, depth: number, t0: number) {
        let ex = x + Math.cos(ang) * len;
        let ey = y + Math.sin(ang) * len;
        let clipped = false;
        if (!insidePx(ex, ey)) {
          let lo = 0, hi = 1;
          for (let k = 0; k < 12; k++) {
            const mid = (lo + hi) / 2;
            insidePx(x + Math.cos(ang) * len * mid, y + Math.sin(ang) * len * mid) ? (lo = mid) : (hi = mid);
          }
          ex = x + Math.cos(ang) * len * lo;
          ey = y + Math.sin(ang) * len * lo;
          clipped = true;
        }
        const mx = (x + ex) / 2;
        const my = (y + ey) / 2;
        const perp = ang + Math.PI / 2;
        const bend = rand(-1, 1) * len * 0.12;
        const w1 = w0 * 0.66;
        branches.push({
          x1: x, y1: y,
          cx: mx + Math.cos(perp) * bend, cy: my + Math.sin(perp) * bend,
          x2: ex, y2: ey,
          w0, w1, t0,
          dur: Math.max(0.14, 0.32 - depth * 0.03),
          depth,
          grad: barkGrad(x, y, ex, ey, depth),
        });
        return { ex, ey, w1, clipped };
      }

      function grow(x: number, y: number, ang: number, len: number, w: number, depth: number, t0: number) {
        const r = addBranch(x, y, ang, len, w, depth, t0);
        if (r.clipped || depth >= 6 || len < ry * 0.06) return;
        const childT0 = t0 + (0.32 - depth * 0.03) * 0.6;
        const n = Math.random() < 0.55 ? 2 : 3;
        for (let i = 0; i < n; i++) {
          const spread = 0.6 * (i - (n - 1) / 2) + rand(-0.22, 0.22);
          const lift = -0.06 + rand(-0.05, 0.05);
          grow(r.ex, r.ey, ang + spread + lift, len * rand(0.74, 0.84), r.w1, depth + 1, childT0 + i * 0.03);
        }
      }

      addBranch(baseX, baseY, -Math.PI / 2, baseY - trunkTopY, trunkW, 0, T_TIMELINE.trunkStart);
      branches[0].dur = 0.55;
      const limbT0 = T_TIMELINE.trunkStart + 0.36;
      const L = 3;
      for (let i = 0; i < L; i++) {
        const ang = -Math.PI / 2 + 0.62 * (i - (L - 1) / 2) + rand(-0.12, 0.12);
        grow(baseX, trunkTopY, ang, limbLen, trunkW * 0.7, 1, limbT0 + i * 0.05);
      }
      const maxT0 = branches.reduce((m, b) => Math.max(m, b.t0 + b.dur), 0);
      const sc = (T_TIMELINE.branchSpan - T_TIMELINE.trunkStart) / (maxT0 - T_TIMELINE.trunkStart);
      for (const b of branches) b.t0 = T_TIMELINE.trunkStart + (b.t0 - T_TIMELINE.trunkStart) * sc;

      const COUNT = Math.round(clamp((rx * ry) / 56, 250, 440));
      const baseBox = clamp(Math.min(W, H) * 0.115, 30, 74);
      let guard = 0;
      while (hearts.length < COUNT && guard < COUNT * 50) {
        guard++;
        const u = rand(-1.06, 1.06), v = rand(-1.06, 1.06);
        if (!pointInPoly(u, v)) continue;
        const x = cx + u * rx, y = cy - v * ry;
        const d = clamp01(Math.hypot(u, v + 1) / 2.4);
        const t0 = T_TIMELINE.bloomT0 + d * (T_TIMELINE.bloomSpan * 0.82) + rand(0, T_TIMELINE.bloomSpan * 0.18);
        const soft = Math.random() < 0.42;
        hearts.push({
          x, y,
          idx: (Math.random() * BLOSSOM.length) | 0,
          soft,
          box: baseBox * (soft ? rand(0.6, 0.85) : rand(0.78, 1.12)),
          rot: rand(-0.55, 0.55),
          sway: rand(0, 6.28),
          t0,
        });
      }
      hearts.sort((a, b) => (a.soft === b.soft ? a.y - b.y : a.soft ? -1 : 1));
    }

    function drawSprite(sprite: HTMLCanvasElement, x: number, y: number, size: number, rot: number, alpha: number) {
      if (!ctx || !sprite) return;
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, -size * 0.5, -size * 0.47, size, size);
      ctx.restore();
    }

    function drawBackground() {
      if (!ctx || !bgGrad || !groundGrad) return;
      ctx.globalAlpha = 1;
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    function drawGodRays(t: number, intensity: number) {
      if (!ctx || intensity <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const ox = cx, oy = cy - ry * 0.35, R = Math.hypot(W, H) * 1.1;
      const rays = 9, sweep = Math.sin(t * 0.07) * 0.18;
      for (let i = 0; i < rays; i++) {
        const a = -Math.PI / 2 + sweep + (i - (rays - 1) / 2) * 0.2;
        const hw = 0.035 + 0.02 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.7));
        const a1 = a - hw, a2 = a + hw;
        const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * R, oy + Math.sin(a) * R);
        g.addColorStop(0, `rgba(255,232,190,${0.10 * intensity})`);
        g.addColorStop(0.5, `rgba(255,214,170,${0.05 * intensity})`);
        g.addColorStop(1, 'rgba(255,214,170,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(a1) * R, oy + Math.sin(a1) * R);
        ctx.lineTo(ox + Math.cos(a2) * R, oy + Math.sin(a2) * R);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGlow(t: number) {
      if (!ctx || !glowGrad) return;
      const gi = clamp01((t - T_TIMELINE.bloomT0) / (T_TIMELINE.bloomSpan * 0.9));
      if (gi <= 0) return;
      ctx.save();
      ctx.globalAlpha = gi;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    function drawBokeh(t: number, dt: number) {
      if (!ctx) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        o.y += o.vy * dt;
        o.x += Math.sin(t * 0.3 + o.phase) * o.drift;
        if (o.y < -o.r) { o.y = H + o.r; o.x = rand(0, W); }
        ctx.globalAlpha = o.alpha;
        ctx.drawImage(o.sprite, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
      }
      ctx.restore();
    }

    function drawFloaters(t: number, dt: number, front: boolean) {
      const appear = clamp01((t - 0.2) / 1.4);
      if (appear <= 0) return;
      for (const f of floaters) {
        if ((f.depth >= 0.6) !== front) continue;
        f.y -= f.vy * dt;
        f.x += Math.sin(t * 0.5 + f.phase) * f.sway * dt;
        f.rot += f.vrot * dt;
        if (f.y < -f.box) { f.y = H + f.box; f.x = rand(0, W); }
        drawSprite((f.soft ? SPR.soft : SPR.crisp)[f.idx], f.x, f.y, f.box, f.rot, f.baseA * appear);
      }
    }

    function drawBranches(t: number) {
      if (!ctx) return;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const b of branches) {
        const f = clamp01((t - b.t0) / b.dur);
        if (f <= 0) continue;
        const e = easeOutCubic(f);
        ctx.strokeStyle = b.grad;
        const steps = 12, last = Math.max(1, Math.ceil(steps * e));
        let prev = quad(b, 0);
        for (let i = 1; i <= last; i++) {
          const tt = Math.min(e, i / steps), p = quad(b, tt);
          ctx.lineWidth = lerp(b.w0, b.w1, tt);
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          prev = p;
        }
      }
    }

    function drawHearts(t: number) {
      const breathe = 1 + Math.sin(t * 0.8) * 0.012;
      for (const h of hearts) {
        const p = clamp01((t - h.t0) / 0.6);
        if (p <= 0) continue;
        const scale = Math.max(0, easeOutBack(p));
        let alpha = clamp01(p * 1.7);
        if (h.soft) alpha *= 0.8;
        const settled = clamp01((t - h.t0 - 0.6) / 0.7);
        const sway = settled * Math.sin(t * 1.5 + h.sway) * (h.box * 0.05);
        const rise = (1 - easeOutCubic(p)) * h.box * 0.45;
        const hx = cx + (h.x - cx) * breathe + sway;
        const hy = cy + (h.y - cy) * breathe - rise;
        drawSprite((h.soft ? SPR.soft : SPR.crisp)[h.idx], hx, hy, h.box * scale, h.rot + sway * 0.012, alpha);
      }
    }

    function updateTwinkles(t: number, dt: number) {
      if (!ctx || !SPARKLE) return;
      const active = t > T_TIMELINE.bloomT0 + T_TIMELINE.bloomSpan * 0.45;
      if (active && twinkles.length < 9 && Math.random() < 0.5) {
        const h = hearts[(Math.random() * hearts.length) | 0];
        if (h) twinkles.push({ x: h.x, y: h.y, size: rand(0.6, 1.3) * (Math.min(W, H) * 0.05), age: 0, life: rand(0.7, 1.2), rot: rand(0, 6.28) });
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = twinkles.length - 1; i >= 0; i--) {
        const s = twinkles[i];
        s.age += dt;
        const k = s.age / s.life;
        if (k >= 1) { twinkles.splice(i, 1); continue; }
        const a = Math.sin(k * Math.PI);
        drawSprite(SPARKLE, s.x, s.y, s.size * (0.6 + 0.4 * a), s.rot + k * 1.2, a);
      }
      ctx.restore();
    }

    function spawnPetal() {
      const h = hearts[(Math.random() * hearts.length) | 0];
      if (!h) return;
      petals.push({
        x: h.x + rand(-8, 8), y: h.y + rand(-8, 8),
        vy: rand(14, 30), vx: rand(-8, 8),
        sway: rand(0.6, 1.4), phase: rand(0, 6.28),
        box: h.box * rand(0.34, 0.6), idx: h.idx,
        rot: rand(0, 6.28), vrot: rand(-1.4, 1.4), age: 0,
        land: groundY + rand(-6, H * 0.05),
      });
    }

    function drawPetals(t: number, dt: number) {
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.age += dt;
        p.vy += 8 * dt;
        p.x += (p.vx + Math.sin(t * p.sway + p.phase) * 16) * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        if (p.y >= p.land) {
          rested.push({ x: clamp(p.x, 6, W - 6), y: p.land, box: p.box, idx: p.idx, rot: p.rot, a: rand(0.7, 0.95) });
          if (rested.length > 90) rested.shift();
          petals.splice(i, 1);
          continue;
        }
        const a = p.age < 0.3 ? p.age / 0.3 : 1;
        drawSprite(SPR.crisp[p.idx], p.x, p.y, p.box, p.rot, a);
      }
    }

    function drawRested() {
      for (const r of rested) drawSprite(SPR.crisp[r.idx], r.x, r.y, r.box, r.rot, r.a);
    }

    let treeStartT = 0, treeLastT = 0, treeRAF = 0, lastPetal = 0;

    function treeFrame(now: number) {
      if (!alive) return;
      if (!treeStartT) { treeStartT = now; treeLastT = now; }
      const t = (now - treeStartT) / 1000;
      const dt = Math.min(0.05, (now - treeLastT) / 1000);
      treeLastT = now;

      const rays = clamp01((t - T_TIMELINE.bloomT0) / T_TIMELINE.bloomSpan);

      drawBackground();
      drawGodRays(t, rays);
      drawGlow(t);
      drawBokeh(t, dt);
      drawFloaters(t, dt, false);
      drawBranches(t);
      drawHearts(t);
      updateTwinkles(t, dt);
      if (t > T_TIMELINE.petalT0 && now - lastPetal > 150) {
        spawnPetal();
        spawnPetal();
        lastPetal = now;
      }
      drawPetals(t, dt);
      drawRested();
      drawFloaters(t, dt, true);

      if (t >= T_TIMELINE.noteStart) {
        setIsWishIn(true);
      }

      if (t >= T_TIMELINE.done && !showDoneActions) {
        setShowDoneActions(true);
      }

      treeRAF = requestAnimationFrame(treeFrame);
    }

    function treeStart() {
      treeStartT = 0;
      treeLastT = 0;
      lastPetal = 0;
      buildScene();
      if (!treeRAF) treeRAF = requestAnimationFrame(treeFrame);
    }

    function treeStop() {
      if (treeRAF) {
        cancelAnimationFrame(treeRAF);
        treeRAF = 0;
      }
      if (ctx) ctx.clearRect(0, 0, W, H);
    }

    // ── Motes ─────────────────────────────────────────────────────────────
    function buildMotes() {
      const motesEl = motesRef.current;
      if (!motesEl) return;
      motesEl.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const m = document.createElement('span');
        m.className = 'film-mote';
        const s = rand(4, 12);
        m.style.width = m.style.height = `${s}px`;
        m.style.left = `${rand(4, 96)}%`;
        m.style.top = `${rand(10, 96)}%`;
        motesEl.appendChild(m);
        gsap.set(m, { opacity: rand(0.25, 0.7) });
        gsap.to(m, {
          y: -rand(40, 140),
          x: rand(-30, 30),
          duration: rand(7, 14),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: -rand(0, 8),
        });
        gsap.to(m, {
          opacity: rand(0.1, 0.5),
          duration: rand(2.5, 5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }

    // ── Archery Bow & Arrow ───────────────────────────────────────────────
    let svgScale = 1, arrowBaseX = 0, arrowBaseY = 0, maxDraw = 120, curDraw = 0;
    let pullUX = 0, pullUY = 1;
    const REST_NOCK = 96;
    const nockProxy = { val: REST_NOCK };

    function applyNock() {
      const y = nockProxy.val;
      if (strLRef.current) strLRef.current.setAttribute('y2', `${y}`);
      if (strRRef.current) strRRef.current.setAttribute('y2', `${y}`);
      if (servingRef.current) servingRef.current.setAttribute('cy', `${y}`);
    }

    function refreshRig() {
      if (!archeryRef.current || !bowRef.current || !servingRef.current || !arrowRef.current) return;
      const gripX = W * 0.24, gripY = H * 0.76;
      const heartX = W * 0.5, heartY = H * 0.33;
      const aimRad = Math.atan2(heartX - gripX, gripY - heartY);
      pullUX = -Math.sin(aimRad);
      pullUY = Math.cos(aimRad);

      nockProxy.val = REST_NOCK;
      applyNock();
      gsap.set(archeryRef.current, { rotation: 0, scale: 1, x: 0, y: 0 });
      archeryRef.current.style.left = '0px';
      archeryRef.current.style.top = '0px';
      gsap.set(arrowRef.current, { x: 0, y: 0 });

      const aR = archeryRef.current.getBoundingClientRect();
      const bR = bowRef.current.getBoundingClientRect();
      const sR = servingRef.current.getBoundingClientRect();
      const rR = arrowRef.current.getBoundingClientRect();
      svgScale = bR.width / 460;
      const gripLX = bR.left - aR.left + 0.5 * bR.width;
      const gripLY = bR.top - aR.top + (240 / 300) * bR.height;
      const nockLX = sR.left - aR.left + 0.5 * sR.width;
      const nockLY = sR.top - aR.top + 0.5 * sR.height;
      arrowBaseX = nockLX - (rR.left - aR.left + 0.5 * rR.width);
      arrowBaseY = nockLY - (rR.top - aR.top + (205 / 220) * rR.height);

      archeryRef.current.style.left = `${gripX - gripLX}px`;
      archeryRef.current.style.top = `${gripY - gripLY}px`;
      gsap.set(archeryRef.current, {
        transformOrigin: `${gripLX}px ${gripLY}px`,
        rotation: (aimRad * 180) / Math.PI,
      });
      gsap.set(arrowRef.current, { x: arrowBaseX, y: arrowBaseY });
      maxDraw = Math.min(bR.height * 0.72, H * 0.16, 132);
      curDraw = 0;
    }

    function setDraw(d: number) {
      curDraw = clamp(d, 0, maxDraw);
      if (arrowRef.current) gsap.set(arrowRef.current, { x: arrowBaseX, y: arrowBaseY + curDraw });
      nockProxy.val = REST_NOCK + curDraw / svgScale;
      applyNock();
      if (aimRef.current) gsap.set(aimRef.current, { opacity: 0.55 * (curDraw / maxDraw) });
    }

    let beatTL: gsap.core.Timeline | null = null;
    function startBeat() {
      if (!targetHeartRef.current || !heartGlowRef.current) return;
      gsap.set(targetHeartRef.current, { scale: 1 });
      gsap.set(heartGlowRef.current, { scale: 1, opacity: 0.7 });
      beatTL = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      beatTL
        .to(targetHeartRef.current, { scale: 1.07, duration: 0.13, ease: 'power2.out' }, 0)
        .to(heartGlowRef.current, { scale: 1.15, opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
        .to(targetHeartRef.current, { scale: 1.0, duration: 0.2, ease: 'power2.in' }, 0.13)
        .to(targetHeartRef.current, { scale: 1.05, duration: 0.12, ease: 'power2.out' }, 0.3)
        .to(targetHeartRef.current, { scale: 1.0, duration: 0.5, ease: 'power2.inOut' }, 0.42)
        .to(heartGlowRef.current, { scale: 1.0, opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, 0.3);
    }

    function stopBeat() {
      if (beatTL) {
        beatTL.kill();
        beatTL = null;
      }
      if (targetHeartRef.current) gsap.set(targetHeartRef.current, { scale: 1 });
    }

    function burstHearts() {
      if (!targetRef.current || !heroRef.current) return;
      const r = targetRef.current.getBoundingClientRect();
      const hr = heroRef.current.getBoundingClientRect();
      const ox = r.left - hr.left + r.width / 2;
      const oy = r.top - hr.top + r.height * 0.42;
      const cols = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#e23b67'];
      const frag = document.createDocumentFragment();
      const nodes: any[] = [];

      for (let i = 0; i < 12; i++) {
        const heart = i < 8;
        const el = document.createElement('span');
        el.className = 'burst';
        const s = heart ? rand(12, 22) : rand(4, 8);
        el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;z-index:4;`;
        if (heart) {
          el.innerHTML = `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${pick(cols)}"/></svg>`;
        } else {
          el.style.borderRadius = '50%';
          el.style.background = 'radial-gradient(circle,#fff,rgba(255,210,150,0) 70%)';
        }
        frag.appendChild(el);
        nodes.push({ el, heart });
      }
      heroRef.current.appendChild(frag);
      nodes.forEach(({ el, heart }) => {
        const ang = rand(-Math.PI, 0);
        const dist = rand(heart ? 70 : 40, heart ? 190 : 120);
        gsap.to(el, {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist - rand(10, 50),
          rotation: rand(-120, 120),
          scale: heart ? rand(0.7, 1.2) : rand(0.4, 1),
          duration: rand(0.7, 1.15),
          ease: 'power2.out',
        });
        gsap.to(el, {
          opacity: 0,
          duration: 0.5,
          delay: rand(0.35, 0.6),
          ease: 'power1.in',
          onComplete: () => el.remove(),
        });
      });
    }

    function shotGeom() {
      if (!tipRef.current || !targetRef.current) {
        return {
          arrowStartY: arrowBaseY,
          arrowFlyY: arrowBaseY - 400,
          drawnNock: REST_NOCK,
          fallPx: 120,
          fx: 0,
          fy: 0,
          floodScale: 15,
          bloomScale: 30,
        };
      }
      const tipR = tipRef.current.getBoundingClientRect();
      const tRect = targetRef.current.getBoundingClientRect();
      const tipX = tipR.left + tipR.width / 2, tipY = tipR.top + tipR.height / 2;
      const tcx = tRect.left + tRect.width / 2, tcy = tRect.top + tRect.height / 2;
      const flightDist = Math.hypot(tcx - tipX, tcy - tipY);
      const fallPx = Math.min(H * 0.26, H - tcy - tRect.height * 0.4);
      const impactX = tcx, impactY = tcy + fallPx;
      const distC = Math.hypot(Math.max(impactX, W - impactX), Math.max(impactY, H - impactY));
      const reach = Math.hypot(W / 2, H / 2);
      return {
        arrowStartY: arrowBaseY + curDraw,
        arrowFlyY: arrowBaseY + curDraw - flightDist,
        drawnNock: REST_NOCK + curDraw / svgScale,
        fallPx,
        fx: impactX - W / 2,
        fy: impactY - H / 2,
        floodScale: (distC * 1.12) / 70,
        bloomScale: (reach * 1.2) / 30,
      };
    }

    let filmTL: gsap.core.Timeline | null = null;

    function buildFilm(m: ReturnType<typeof shotGeom>) {
      const kChars = [...line1CharsRef.current, ...line2CharsRef.current];

      const t = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (!alive) return;
          gsap.set(fieldRef.current, { autoAlpha: 0 });
          treeStart();
          gsap.to(bloomRef.current, { autoAlpha: 0, duration: 1.15, ease: 'power2.out' });
        },
      });

      // reset
      t.set(targetRef.current, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 })
        .set(arrowRef.current, { opacity: 1, x: arrowBaseX, y: m.arrowStartY, scaleY: 1 })
        .set([floodRef.current, bloomRef.current], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 })
        .set(floodRef.current, { x: m.fx, y: m.fy })
        .set(fieldRef.current, { autoAlpha: 0 })
        .set('.film-blob', { opacity: 0 })
        .set(cameraRef.current, { scale: 1, yPercent: 0 })
        .set(fgridRef.current, { xPercent: 0, yPercent: 0 })
        .set(barTopRef.current, { yPercent: -100 })
        .set(barBotRef.current, { yPercent: 100 })
        .set(kEyebrowRef.current, { opacity: 0, y: 12 })
        .set(kSubRef.current, { opacity: 0, y: 12 })
        .set(kChars, { transformPerspective: 620, transformOrigin: '50% 100%', yPercent: 135, rotationX: -82 })
        .set(ulinePathRef.current, { drawn: 0 });

      // Shot
      t.fromTo(nockProxy, { val: m.drawnNock }, { val: REST_NOCK, duration: 0.5, ease: 'elastic.out(1,0.34)', onUpdate: applyNock }, 0)
        .to(arrowRef.current, { y: m.arrowFlyY, duration: 0.26, ease: 'power2.in' }, 0)
        .to(arrowRef.current, { scaleY: 1.16, duration: 0.14, ease: 'power2.in' }, 0)
        .to(arrowRef.current, { scaleY: 1.0, duration: 0.1, ease: 'power1.out' }, 0.16)
        .to(aimRef.current, { opacity: 0, duration: 0.18 }, 0)
        .to([eyebrowRef.current, hintRef.current], { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

      // Strike
      t.add(burstHearts, 0.26)
        .to(targetRef.current, { x: 7, y: -9, duration: 0.06, ease: 'power2.out' }, 0.26)
        .to(targetRef.current, { x: 0, y: 0, duration: 0.32, ease: 'power2.out' }, 0.32)
        .to(targetRef.current, { scale: 1.14, duration: 0.06, ease: 'power2.out' }, 0.26)
        .to(targetRef.current, { scale: 1.0, duration: 0.26, ease: 'power2.inOut' }, 0.32)
        .to(arrowRef.current, { rotation: '+=4', duration: 0.05, yoyo: true, repeat: 4, ease: 'sine.inOut' }, 0.27)
        .set(arrowRef.current, { rotation: 0 }, 0.52)
        .to(arrowRef.current, { opacity: 0, duration: 0.16, ease: 'power1.out' }, 0.56);

      // Fall + Flood
      t.to(targetRef.current, { y: m.fallPx, scaleX: 0.84, scaleY: 1.3, duration: 0.34, ease: 'power1.in' }, 0.64)
        .to(targetRef.current, { scaleX: 1.4, scaleY: 0.6, duration: 0.07, ease: 'power2.out' }, 0.98)
        .set(floodRef.current, { autoAlpha: 1 }, 1.0)
        .fromTo(floodRef.current, { scale: 0.02 }, { scale: m.floodScale, duration: 0.34, ease: 'power2.in' }, 1.0)
        .to(targetRef.current, { opacity: 0, duration: 0.12, ease: 'power1.out' }, 1.06);

      // Wish Field
      t.set(fieldRef.current, { autoAlpha: 1 }, 1.32)
        .set(heroRef.current, { autoAlpha: 0 }, 1.33)
        .to('.film-blob', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.34)
        .set(floodRef.current, { autoAlpha: 0 }, 1.36);

      // Camera push
      t.fromTo(cameraRef.current, { scale: 1.0, yPercent: 0 }, { scale: 1.07, yPercent: -1.3, duration: 2.6, ease: 'none' }, 1.38)
        .fromTo(fgridRef.current, { xPercent: 0, yPercent: 0 }, { xPercent: -1.5, yPercent: -1.0, duration: 2.6, ease: 'none' }, 1.38);

      // Letterbox bars
      t.to(barTopRef.current, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
        .to(barBotRef.current, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5);

      // Kinetic wish words
      t.to(kEyebrowRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.54)
        .to(line1CharsRef.current, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 1.68)
        .to(line2CharsRef.current, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 2.06)
        .to(ulinePathRef.current, { drawn: 1, duration: 0.45, ease: 'power2.inOut' }, 2.54)
        .to(kSubRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 2.74);

      // Bloom handoff
      t.to(barTopRef.current, { yPercent: -100, duration: 0.5, ease: 'power2.in' }, 3.32)
        .to(barBotRef.current, { yPercent: 100, duration: 0.5, ease: 'power2.in' }, 3.32)
        .set(bloomRef.current, { autoAlpha: 1 }, 3.42)
        .fromTo(bloomRef.current, { scale: 0.02 }, { scale: m.bloomScale, duration: 0.58, ease: 'power2.in' }, 3.42);

      return t;
    }

    let played = false, drawing = false, startPX = 0, startPY = 0, startDraw = 0;

    function fire() {
      if (played) return;
      played = true;
      drawing = false;
      stopBeat();
      filmTL = buildFilm(shotGeom());
      filmTL.play(0);
    }

    function springBack() {
      const from = curDraw;
      gsap.to({ d: from }, {
        d: 0,
        duration: 0.55,
        ease: 'elastic.out(1,0.4)',
        onUpdate() {
          setDraw((this.targets()[0] as any).d);
        },
      });
    }

    function autoFire() {
      if (played) return;
      gsap.to({ d: curDraw }, {
        d: maxDraw * 0.94,
        duration: 0.62,
        ease: 'power2.inOut',
        onUpdate() {
          setDraw((this.targets()[0] as any).d);
        },
        onComplete: () => gsap.delayedCall(0.16, fire),
      });
    }

    const archeryEl = archeryRef.current;
    if (archeryEl) {
      const onPointerDown = (e: PointerEvent) => {
        if (played) return;
        drawing = true;
        try { archeryEl.setPointerCapture(e.pointerId); } catch (_) {}
        startPX = e.clientX;
        startPY = e.clientY;
        startDraw = curDraw;
        e.preventDefault();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!drawing) return;
        const proj = (e.clientX - startPX) * pullUX + (e.clientY - startPY) * pullUY;
        setDraw(startDraw + proj);
      };

      const endDraw = () => {
        if (!drawing) return;
        drawing = false;
        if (curDraw > maxDraw * 0.24) fire();
        else springBack();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (played) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          autoFire();
        }
      };

      archeryEl.addEventListener('pointerdown', onPointerDown);
      archeryEl.addEventListener('pointermove', onPointerMove);
      archeryEl.addEventListener('pointerup', endDraw);
      archeryEl.addEventListener('pointercancel', endDraw);
      archeryEl.addEventListener('keydown', onKeyDown);
    }

    function enter() {
      if (!heroRef.current) return;
      gsap.set(heroRef.current, { autoAlpha: 1 });
      refreshRig();
      setDraw(0);
      gsap.set([eyebrowRef.current, hintRef.current], { opacity: 0, y: 14 });
      gsap.set(targetRef.current, { opacity: 0, y: 10, scaleX: 0.9, scaleY: 0.9 });
      gsap.set(archeryRef.current, { opacity: 0, scale: 0.85 });
      gsap.set(heartGlowRef.current, { opacity: 0, scale: 1 });
      gsap.set(arrowRef.current, { opacity: 1 });

      const tl = gsap.timeline({ onComplete: startBeat });
      tl.to(targetRef.current, { opacity: 1, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
        .to(heartGlowRef.current, { opacity: 0.7, duration: 0.8, ease: 'power2.out' }, 0.2)
        .to(archeryRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.28)
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
        .to(hintRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildSprites();
      buildScene();
      refreshRig();
      setDraw(0);
    }

    function resetAll() {
      if (!alive) return;
      if (filmTL) {
        filmTL.kill();
        filmTL = null;
      }
      treeStop();
      stopBeat();
      played = false;
      drawing = false;
      startPX = 0;
      startPY = 0;
      startDraw = 0;
      
      gsap.set([floodRef.current, bloomRef.current], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 });
      gsap.set(fieldRef.current, { autoAlpha: 0 });
      gsap.set('.film-blob', { opacity: 0 });
      gsap.set(cameraRef.current, { scale: 1, yPercent: 0 });
      
      // Cleanup lingering burst particles if replay clicked early
      if (heroRef.current) {
        const bursts = heroRef.current.querySelectorAll('.burst');
        bursts.forEach(el => el.remove());
      }
      gsap.set(fgridRef.current, { xPercent: 0, yPercent: 0 });
      gsap.set(barTopRef.current, { yPercent: -100 });
      gsap.set(barBotRef.current, { yPercent: 100 });
      gsap.set(kEyebrowRef.current, { opacity: 0, y: 12 });
      gsap.set(kSubRef.current, { opacity: 0, y: 12 });
      gsap.set([...line1CharsRef.current, ...line2CharsRef.current], { transformPerspective: 620, transformOrigin: '50% 100%', yPercent: 135, rotationX: -82 });
      if (ulinePathRef.current) gsap.set(ulinePathRef.current, { drawn: 0 });
      if (arrowRef.current) gsap.set(arrowRef.current, { rotation: 0, scaleY: 1 });
      
      enter();
    }

    resetRef.current = resetAll;

    resize();
    buildMotes();
    enter();

    window.addEventListener('resize', resize);

    return () => {
      alive = false;
      treeStop();
      stopBeat();
      if (filmTL) filmTL.kill();
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleReplay = () => {
    setShowDoneActions(false);
    setIsWishIn(false);
    if (resetRef.current) {
      resetRef.current();
    }
  };

  return (
    <div className="film-container">
      <main className="film-scene">
        {/* Act 4 Blossom Tree Canvas */}
        <canvas ref={canvasRef} className="film-tree" aria-label="A blossom tree blooms into a heart" />

        {/* Act 1 — The Invitation & Bow */}
        <section className="film-hero" ref={heroRef}>
          <div className="film-hero__bg" aria-hidden="true" />
          <div className="film-hero__motes" ref={motesRef} aria-hidden="true" />

          <p className="film-hero__eyebrow" ref={eyebrowRef}>
            a little something, for you
          </p>

          {/* Beating Target Heart */}
          <div className="film-targetWrap" aria-hidden="true">
            <div className="film-target" ref={targetRef}>
              <span className="film-heart__glow" ref={heartGlowRef} />
              <span className="film-target__heart" ref={targetHeartRef}>
                <svg className="film-heart__svg" viewBox="0 0 100 92">
                  <defs>
                    <radialGradient id="film-hg" cx="38%" cy="30%" r="80%">
                      <stop offset="0%" stopColor="#ffd9e4" />
                      <stop offset="42%" stopColor="#ff6f97" />
                      <stop offset="82%" stopColor="#d81e57" />
                      <stop offset="100%" stopColor="#9d0f3e" />
                    </radialGradient>
                    <linearGradient id="film-hsheen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,.85)" />
                      <stop offset="34%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <path d="M50 86.5C26 68 10.5 53.6 10.5 34.6 10.5 20.4 21 11 33.2 11c8.6 0 14.2 4.7 16.8 11.4C52.6 15.7 58.2 11 66.8 11 79 11 89.5 20.4 89.5 34.6 89.5 53.6 74 68 50 86.5Z" fill="url(#film-hg)" />
                  <path d="M50 86.5C26 68 10.5 53.6 10.5 34.6 10.5 20.4 21 11 33.2 11c8.6 0 14.2 4.7 16.8 11.4C52.6 15.7 58.2 11 66.8 11 79 11 89.5 20.4 89.5 34.6 89.5 53.6 74 68 50 86.5Z" fill="url(#film-hsheen)" opacity=".7" />
                  <ellipse cx="34" cy="30" rx="8.5" ry="5.4" fill="#fff" opacity=".72" style={{ mixBlendMode: 'screen' }} />
                </svg>
              </span>
            </div>
          </div>

          {/* Bow & Arrow */}
          <div
            className="film-archery"
            ref={archeryRef}
            role="button"
            tabIndex={0}
            aria-label="Draw the bow and release to send the arrow to the heart"
          >
            <div className="film-aim" ref={aimRef} />

            <svg className="film-bow" ref={bowRef} viewBox="0 0 460 300">
              <defs>
                <linearGradient id="film-limb" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#4a2a1a" />
                  <stop offset=".18" stopColor="#6b3f24" />
                  <stop offset=".5" stopColor="#8a5127" />
                  <stop offset=".82" stopColor="#6b3f24" />
                  <stop offset="1" stopColor="#4a2a1a" />
                </linearGradient>
                <linearGradient id="film-limbHi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(255,214,160,.8)" />
                  <stop offset="1" stopColor="rgba(255,214,160,0)" />
                </linearGradient>
                <linearGradient id="film-grip" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#2a1a10" />
                  <stop offset=".5" stopColor="#5a3822" />
                  <stop offset="1" stopColor="#2a1a10" />
                </linearGradient>
              </defs>
              <path
                d="M34 96 C 118 168, 168 240, 230 252 C 292 240, 342 168, 426 96"
                fill="none"
                stroke="url(#film-limb)"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <path
                d="M34 96 C 118 168, 168 240, 230 252 C 292 240, 342 168, 426 96"
                fill="none"
                stroke="url(#film-limbHi)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity=".7"
              />
              <path d="M34 96 C 22 82, 26 70, 40 66" fill="none" stroke="url(#film-limb)" strokeWidth="8" strokeLinecap="round" />
              <path d="M426 96 C 438 82, 434 70, 420 66" fill="none" stroke="url(#film-limb)" strokeWidth="8" strokeLinecap="round" />
              <rect x="216" y="206" width="28" height="70" rx="9" fill="url(#film-grip)" />
              <path d="M219 220h22 M219 236h22 M219 252h22" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
              <line ref={strLRef} x1="40" y1="70" x2="230" y2="96" stroke="#9a8068" strokeWidth="2.2" strokeLinecap="round" />
              <line ref={strRRef} x1="420" y1="70" x2="230" y2="96" stroke="#9a8068" strokeWidth="2.2" strokeLinecap="round" />
              <circle ref={servingRef} cx="230" cy="96" r="4.5" fill="#6f5137" />
            </svg>

            <svg className="film-arrow" ref={arrowRef} viewBox="0 0 64 220">
              <defs>
                <linearGradient id="film-shaft" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#4a2c14" />
                  <stop offset=".5" stopColor="#8a5a2c" />
                  <stop offset="1" stopColor="#3e2410" />
                </linearGradient>
                <linearGradient id="film-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffe38c" />
                  <stop offset=".45" stopColor="#f4a626" />
                  <stop offset="1" stopColor="#a85f0e" />
                </linearGradient>
                <linearGradient id="film-feath" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ff7f9c" />
                  <stop offset=".5" stopColor="#e6396a" />
                  <stop offset="1" stopColor="#a8154a" />
                </linearGradient>
                <linearGradient id="film-wing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#ffe0c4" />
                </linearGradient>
              </defs>
              <rect x="29.4" y="30" width="5.2" height="168" rx="2.6" fill="url(#film-shaft)" />
              <g className="film-arrow__wings">
                <path className="wingL" d="M31 30 C 10 16, 2 20, 4 34 C 12 30, 20 32, 31 40 Z" fill="url(#film-wing)" stroke="rgba(196,132,58,.72)" strokeWidth="1.2" />
                <path className="wingR" d="M33 30 C 54 16, 62 20, 60 34 C 52 30, 44 32, 33 40 Z" fill="url(#film-wing)" stroke="rgba(196,132,58,.72)" strokeWidth="1.2" />
              </g>
              <path className="film-arrow__head" d="M32 12 C 30 7, 22 6.5, 21.5 13 C 21 18, 27 22, 32 27 C 37 22, 43 18, 42.5 13 C 42 6.5, 34 7, 32 12 Z" fill="url(#film-gold)" stroke="#a5701a" strokeWidth=".8" />
              <ellipse cx="27" cy="13" rx="2.6" ry="1.7" fill="#fff" opacity=".8" style={{ mixBlendMode: 'screen' }} />
              <g className="film-arrow__fletch">
                <path d="M32 150 C 16 156, 10 178, 15 200 C 24 194, 30 184, 32 176 Z" fill="url(#film-feath)" />
                <path d="M32 150 C 48 156, 54 178, 49 200 C 40 194, 34 184, 32 176 Z" fill="url(#film-feath)" opacity=".92" />
              </g>
              <path d="M29 200 L32 205 L35 200" fill="none" stroke="#c9a25a" strokeWidth="2" strokeLinecap="round" />
              <circle ref={tipRef} cx="32" cy="9" r="0.6" fill="none" />
            </svg>
          </div>

          <p className="film-hero__hint" ref={hintRef}>
            pull &amp; release to shoot 🏹
          </p>
        </section>

        {/* Act 2 — The Rose Flood */}
        <div className="film-flood" ref={floodRef} aria-hidden="true" />

        {/* Act 3 — The Wish Field */}
        <div className="film-field" ref={fieldRef} aria-hidden="true">
          <div className="film-blob film-blob--1" />
          <div className="film-blob film-blob--2" />
          <div className="film-blob film-blob--3" />
          <div className="film-fgrid" ref={fgridRef} />
          <div className="film-fvignette" />

          <div className="film-camera" ref={cameraRef}>
            <p className="film-kEyebrow" ref={kEyebrowRef}>
              make a wish&hellip;
            </p>
            <h2 className="film-headline">
              <span className="film-hl__line">
                <span className="film-mask">
                  <span className="film-hl__word">
                    {'Happy'.split('').map((char, i) => (
                      <span
                        key={i}
                        className="film-hl__ch"
                        ref={(el) => {
                          if (el) line1CharsRef.current[i] = el;
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
              <span className="film-hl__line">
                <span className="film-mask">
                  <span className="film-hl__word">
                    {'Birthday'.split('').map((char, i) => (
                      <span
                        key={i}
                        className="film-hl__ch"
                        ref={(el) => {
                          if (el) line2CharsRef.current[i] = el;
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </h2>
            <svg className="film-uline" viewBox="0 0 300 26" fill="none">
              <path
                ref={ulinePathRef}
                className="film-uline__path"
                d="M8 16C56 7 132 4 178 6c30 1 78 5 114 12-40 3-108 4-176 3"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="film-kSub" ref={kSubRef}>
              to someone truly special &amp; loved ✨
            </p>
          </div>

          <div className="film-bar film-bar--top" ref={barTopRef} />
          <div className="film-bar film-bar--bot" ref={barBotRef} />
        </div>

        {/* Bloom transition */}
        <div className="film-bloom" ref={bloomRef} aria-hidden="true" />

        {/* Act 4 — Hand-lettered Wish over Blossom Tree */}
        <div className={`film-wish ${isWishIn ? 'is-in' : ''}`} aria-hidden="true">
          <p className="film-wish__eyebrow">and&hellip; make it count 💕</p>
          <div className="film-wish__heroWrap">
            <h1 className="film-wish__hero">Happy Birthday</h1>
          </div>
          <span className="film-wish__rule" />
          <p className="film-wish__sub">
            Dearest {recipientName} &mdash; here&rsquo;s to a year that blooms with endless joy!
          </p>
        </div>

        {/* Navigation / Actions */}
        {showDoneActions && (
          <div className="film-actions">
            <button className="film-replay-btn" onClick={handleReplay}>
              <RotateCcw size={14} />
              <span>Replay</span>
            </button>
            <button className="film-continue-btn" onClick={onComplete}>
              <Sparkles size={16} />
              <span>Open Birthday Surprise Gift ✨</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="film-grade" aria-hidden="true">
          <div className="film-grade__vignette" />
        </div>
      </main>
    </div>
  );
}
