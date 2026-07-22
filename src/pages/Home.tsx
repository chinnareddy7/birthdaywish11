import { useState } from 'react';
import { Music, Volume2, Heart, Gift, Cake, Mail, ArrowRight, Sparkles } from 'lucide-react';

function Diamond({ style }: { style?: React.CSSProperties }) {
  return <div style={{ width: 10, height: 10, transform: 'rotate(45deg)', ...style }} />;
}

function StarSvg({ size = 14, color = '#FFD700', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z" fill={color} />
    </svg>
  );
}

function BirthdayCake() {
  return (
    <svg
      viewBox="0 0 400 460"
      width="400"
      height="460"
      style={{
        filter: 'drop-shadow(0 0 40px rgba(255,31,140,0.45)) drop-shadow(0 0 80px rgba(139,92,246,0.25))',
        overflow: 'visible',
      }}
    >
      <defs>
        <radialGradient id="plateGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3a3050" />
          <stop offset="100%" stopColor="#1a1028" />
        </radialGradient>
        <linearGradient id="cakeBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8547a" />
          <stop offset="50%" stopColor="#c0204a" />
          <stop offset="100%" stopColor="#8b1035" />
        </linearGradient>
        <linearGradient id="cakeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e85070" />
          <stop offset="50%" stopColor="#bf1e48" />
          <stop offset="100%" stopColor="#8a1033" />
        </linearGradient>
        <linearGradient id="frostingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6eb0" />
          <stop offset="100%" stopColor="#f02080" />
        </linearGradient>
        <linearGradient id="frostingTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff82be" />
          <stop offset="100%" stopColor="#f52a90" />
        </linearGradient>
        <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f0b0c8" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e090b8" />
        </linearGradient>
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#fff9a0" />
          <stop offset="40%" stopColor="#ffcc00" />
          <stop offset="70%" stopColor="#ff8800" />
          <stop offset="100%" stopColor="#ff4400" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="flameGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="200" cy="420" rx="170" ry="22" fill="url(#plateGrad)" />
      <ellipse cx="200" cy="414" rx="168" ry="16" fill="#2e2044" />
      <ellipse cx="200" cy="408" rx="164" ry="12" fill="#3a2a55" />
      <ellipse cx="200" cy="407" rx="162" ry="10" fill="none" stroke="rgba(160,130,220,0.35)" strokeWidth="1.5" />
      <ellipse cx="200" cy="400" rx="148" ry="16" fill="rgba(0,0,0,0.4)" />
      <rect x="52" y="300" width="296" height="100" rx="4" fill="url(#cakeBottom)" />
      <rect x="52" y="300" width="296" height="100" rx="4" fill="url(#shineGrad)" />
      <ellipse cx="200" cy="300" rx="148" ry="16" fill="#d43060" />
      <ellipse cx="200" cy="299" rx="146" ry="14" fill="#e04070" />
      <ellipse cx="200" cy="299" rx="148" ry="16" fill="url(#frostingGrad)" />
      {[{ x: 75, w: 18, h: 32 },{ x: 110, w: 14, h: 24 },{ x: 148, w: 20, h: 38 },{ x: 190, w: 15, h: 28 },{ x: 225, w: 22, h: 42 },{ x: 262, w: 16, h: 30 },{ x: 298, w: 18, h: 34 },{ x: 328, w: 13, h: 22 }].map((d, i) => (
        <g key={i}>
          <rect x={d.x} y={299} width={d.w} height={d.h} rx={d.w / 2} fill="url(#frostingGrad)" />
          <ellipse cx={d.x + d.w / 2} cy={299 + d.h} rx={d.w / 2} ry={d.w / 2.5} fill="#f02080" />
        </g>
      ))}
      <ellipse cx="200" cy="238" rx="105" ry="12" fill="rgba(0,0,0,0.3)" />
      <rect x="95" y="186" width="210" height="114" rx="4" fill="url(#cakeTop)" />
      <rect x="95" y="186" width="210" height="114" rx="4" fill="url(#shineGrad)" />
      <ellipse cx="200" cy="186" rx="105" ry="12" fill="#d03060" />
      <ellipse cx="200" cy="185" rx="103" ry="11" fill="#e04070" />
      <ellipse cx="200" cy="185" rx="105" ry="12" fill="url(#frostingTop)" />
      {[{ x: 108, w: 14, h: 26 },{ x: 138, w: 18, h: 34 },{ x: 172, w: 13, h: 22 },{ x: 200, w: 16, h: 30 },{ x: 230, w: 20, h: 38 },{ x: 264, w: 14, h: 26 },{ x: 292, w: 12, h: 20 }].map((d, i) => (
        <g key={i}>
          <rect x={d.x} y={184} width={d.w} height={d.h} rx={d.w / 2} fill="url(#frostingTop)" />
          <ellipse cx={d.x + d.w / 2} cy={184 + d.h} rx={d.w / 2} ry={d.w / 2.5} fill="#f52a90" />
        </g>
      ))}
      {[{ x: 80, y: 330, color: '#60A5FA', r: 4 },{ x: 110, y: 355, color: '#FCD34D', r: 3.5 },{ x: 140, y: 340, color: '#34D399', r: 4 },{ x: 170, y: 370, color: '#F472B6', r: 3 },{ x: 200, y: 345, color: '#FCD34D', r: 4 },{ x: 230, y: 360, color: '#60A5FA', r: 3.5 },{ x: 260, y: 335, color: '#34D399', r: 4 },{ x: 290, y: 355, color: '#FCD34D', r: 3 },{ x: 315, y: 342, color: '#F472B6', r: 4 },{ x: 95, y: 385, color: '#FCD34D', r: 3 },{ x: 155, y: 390, color: '#60A5FA', r: 3.5 },{ x: 245, y: 382, color: '#34D399', r: 3 },{ x: 300, y: 378, color: '#F472B6', r: 3.5 }].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity={0.9} />
      ))}
      {[{ x: 120, y: 210, color: '#FCD34D', r: 3.5 },{ x: 150, y: 230, color: '#60A5FA', r: 3 },{ x: 178, y: 215, color: '#34D399', r: 3.5 },{ x: 210, y: 240, color: '#F472B6', r: 3 },{ x: 240, y: 222, color: '#FCD34D', r: 3.5 },{ x: 268, y: 238, color: '#60A5FA', r: 3 },{ x: 285, y: 260, color: '#34D399', r: 3.5 },{ x: 130, y: 260, color: '#F472B6', r: 3 },{ x: 165, y: 272, color: '#FCD34D', r: 3.5 },{ x: 230, y: 278, color: '#60A5FA', r: 3 },{ x: 270, y: 270, color: '#F472B6', r: 3.5 }].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity={0.9} />
      ))}
      <rect x="190" y="118" width="20" height="68" rx="4" fill="url(#candleGrad)" />
      {[130, 148, 166].map((y, i) => (
        <rect key={i} x="190" y={y} width="20" height="6" rx="2" fill="#FF80B4" opacity={0.55} />
      ))}
      <rect x="193" y="120" width="6" height="60" rx="3" fill="rgba(255,255,255,0.25)" />
      <line x1="200" y1="118" x2="200" y2="106" stroke="#444" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="200" cy="92" rx="22" ry="28" fill="#FF880033" filter="url(#flameGlow)" />
      <path d="M200 60 C192 72 184 82 186 96 C188 108 196 116 200 116 C204 116 212 108 214 96 C216 82 208 72 200 60Z" fill="url(#flameGrad)" filter="url(#glow)" />
      <path d="M200 76 C197 82 195 90 196 98 C197 104 199 110 200 110 C201 110 203 104 204 98 C205 90 203 82 200 76Z" fill="#fff9c0" opacity={0.85} />
      {[75, 110, 148, 188, 225, 262, 296, 326].map((x, i) => (
        <circle key={i} cx={x + 9} cy={296} r={5} fill="rgba(255,200,230,0.9)" stroke="#fff" strokeWidth={0.5} />
      ))}
      {[102, 135, 168, 200, 232, 265, 295].map((x, i) => (
        <circle key={i} cx={x + 7} cy={182} r={4} fill="rgba(255,210,235,0.9)" stroke="#fff" strokeWidth={0.5} />
      ))}
      <ellipse cx="200" cy="425" rx="140" ry="10" fill="rgba(255,31,140,0.12)" />
    </svg>
  );
}

function Balloon({ color, size = 80, style }: { color: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      <div style={{ width: size, height: size * 1.2, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: `radial-gradient(circle at 33% 28%, ${color}dd, ${color}88)`, boxShadow: `inset -6px -8px 16px rgba(0,0,0,0.3), 0 0 20px ${color}44`, position: 'relative' }}>
        <div style={{ position: 'absolute', width: size * 0.22, height: size * 0.14, borderRadius: '50%', background: 'rgba(255,255,255,0.38)', top: '20%', left: '20%' }} />
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `8px solid ${color}aa` }} />
      </div>
      <div style={{ width: 1.5, height: 38, background: `${color}66` }} />
    </div>
  );
}

const NAV_LINKS = ['Home', 'Memories', 'Gallery', 'Surprises', 'Timeline', 'Wishes'];
const FEATURE_CARDS = [
  { icon: <Heart size={28} style={{ color: '#FF4DA6' }} />, title: 'Beautiful Memories', desc: 'Relive our best moments together.', color: '#FF4DA6' },
  { icon: (<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>), title: 'Photo Gallery', desc: 'A collection of our favorite photos.', color: '#A78BFA' },
  { icon: <Gift size={28} style={{ color: '#FF4DA6' }} />, title: 'Surprise Gifts', desc: "Open special gifts I've prepared.", color: '#FF4DA6' },
  { icon: <Cake size={28} style={{ color: '#A78BFA' }} />, title: 'Birthday Cake', desc: 'Blow the candles and make a wish!', color: '#A78BFA' },
  { icon: <Mail size={28} style={{ color: '#A78BFA' }} />, title: 'Sweet Messages', desc: 'Heartfelt messages just for you.', color: '#A78BFA' },
];
const DIAMONDS = [
  { top: '7%', left: '10%', color: '#FF4DA6', size: 10, delay: '0s' },
  { top: '13%', left: '42%', color: '#A78BFA', size: 8, delay: '0.6s' },
  { top: '5%', left: '60%', color: '#60A5FA', size: 10, delay: '1.1s' },
  { top: '10%', left: '78%', color: '#FF4DA6', size: 8, delay: '1.6s' },
  { top: '28%', left: '4%', color: '#A78BFA', size: 7, delay: '0.9s' },
  { top: '38%', left: '91%', color: '#FFD700', size: 9, delay: '0.3s' },
  { top: '56%', left: '7%', color: '#60A5FA', size: 7, delay: '1.3s' },
  { top: '72%', left: '86%', color: '#FF4DA6', size: 10, delay: '0.7s' },
  { top: '82%', left: '14%', color: '#FFD700', size: 8, delay: '1.9s' },
  { top: '20%', left: '30%', color: '#FFD700', size: 6, delay: '1.5s' },
  { top: '50%', left: '50%', color: '#A78BFA', size: 7, delay: '2.1s' },
  { top: '90%', left: '48%', color: '#FF4DA6', size: 6, delay: '0.4s' },
];

interface HomeProps {
  onGenerate: () => void;
}

export default function Home({ onGenerate }: HomeProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#07050F', fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', background: 'rgba(7,5,15,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(139,92,246,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cake size={34} style={{ color: '#FF4DA6' }} />
          <div>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 24, fontWeight: 700, color: '#FF4DA6', lineHeight: 1 }}>Birthday</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', lineHeight: 1.3 }}>Surprise</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map((link) => (
            <button key={link} style={{ padding: '7px 20px', borderRadius: 9999, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: link === 'Home' ? 'rgba(255,31,140,0.15)' : 'transparent', border: link === 'Home' ? '1px solid rgba(255,31,140,0.4)' : '1px solid transparent', color: link === 'Home' ? '#FF4DA6' : 'rgba(255,255,255,0.72)' }}>{link}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setPlaying(!playing)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, background: 'rgba(255,31,140,0.12)', border: '1px solid rgba(255,31,140,0.4)', color: '#FF4DA6', cursor: 'pointer' }}>
            <Music size={15} /> Play Music
          </button>
          <button style={{ padding: '8px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
            <Volume2 size={18} />
          </button>
        </div>
      </nav>

      <section style={{ position: 'relative', minHeight: 'calc(100vh - 73px)', overflow: 'hidden', background: 'radial-gradient(ellipse at 28% 38%, rgba(123,63,228,0.22) 0%, transparent 52%), radial-gradient(ellipse at 72% 62%, rgba(255,31,140,0.14) 0%, transparent 52%), #07050F' }}>
        {DIAMONDS.map((d, i) => (
          <div key={i} className="animate-twinkle" style={{ position: 'absolute', top: d.top, left: d.left, animationDelay: d.delay }}>
            <Diamond style={{ width: d.size, height: d.size, background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
          </div>
        ))}
        {[{ top: '32%', left: '36%', color: '#FF4DA6', delay: '0.6s' },{ top: '64%', left: '70%', color: '#A78BFA', delay: '1.4s' },{ top: '17%', left: '68%', color: '#FFD700', delay: '0.9s' }].map((s, i) => (
          <div key={i} className="animate-sparkle" style={{ position: 'absolute', top: s.top, left: s.left, animationDelay: s.delay }}>
            <StarSvg size={18} color={s.color} />
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, bottom: 80 }}>
          <Balloon color="#FF1F8C" size={76} className="animate-float" style={{ position: 'absolute', left: 18, bottom: 55 }} />
          <Balloon color="#C026D3" size={62} className="animate-float-alt" style={{ position: 'absolute', left: 72, bottom: 115, animationDelay: '0.9s' }} />
          <Balloon color="#F59E0B" size={58} className="animate-float-slow" style={{ position: 'absolute', left: -8, bottom: 148, animationDelay: '1.6s' }} />
          <Balloon color="#FF4DA6" size={46} className="animate-float-slow-alt" style={{ position: 'absolute', left: 96, bottom: 52, animationDelay: '2.1s' }} />
        </div>
        <div style={{ position: 'absolute', right: 0, bottom: 80 }}>
          <Balloon color="#FF1F8C" size={76} className="animate-float-alt" style={{ position: 'absolute', right: 18, bottom: 35 }} />
          <Balloon color="#C026D3" size={60} className="animate-float-slow" style={{ position: 'absolute', right: 82, bottom: 95, animationDelay: '0.5s' }} />
          <Balloon color="#F59E0B" size={66} className="animate-float" style={{ position: 'absolute', right: -4, bottom: 128, animationDelay: '1.3s' }} />
          <Balloon color="#A78BFA" size={50} className="animate-float-slow-alt" style={{ position: 'absolute', right: 104, bottom: 35, animationDelay: '1.9s' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 80px', minHeight: 'calc(100vh - 73px)' }}>
          <div style={{ flex: 1, maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <Heart size={13} className="animate-heart" style={{ color: '#FF4DA6', fill: '#FF4DA6' }} />
              <span style={{ color: '#FF4DA6', letterSpacing: '0.22em', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>A Special Day For A Special Person</span>
              <Heart size={13} className="animate-heart" style={{ color: '#FF4DA6', fill: '#FF4DA6', animationDelay: '0.5s' }} />
            </div>
            <h1 style={{ fontSize: '3.8rem', fontWeight: 900, color: '#fff', lineHeight: 1.08, margin: '0 0 4px' }}>Happy Birthday</h1>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '3.2rem', fontWeight: 700, color: '#FF4DA6', textShadow: '0 0 30px rgba(255,31,140,0.5)', lineHeight: 1.25, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              To My Special Person
              <Heart size={26} style={{ color: '#FF4DA6', fill: '#FF4DA6', flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #FF4DA6)' }} />
              <Heart size={14} style={{ color: '#FF4DA6', fill: '#FF4DA6' }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #FF4DA6, transparent)' }} />
            </div>
            <p style={{ fontSize: '1.08rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 36, maxWidth: 430 }}>
              You mean the world to me! On your special day,<br />I've prepared something very special for you. 💌
            </p>
            <button onClick={onGenerate} className="btn-surprise" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 36px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer', marginBottom: 18 }}>
              <Gift size={22} />
              Click to Generate Surprise
              <Sparkles size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarSvg size={13} color="#FFD700" />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Get ready for something amazing!</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,31,140,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="animate-cake"><BirthdayCake /></div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 40px 40px', background: '#07050F' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, maxWidth: 1280, margin: '0 auto' }}>
          {FEATURE_CARDS.map((card, i) => (
            <div key={i} className="feature-card" style={{ borderRadius: 18, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `${card.color}18`, border: `1px solid ${card.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{card.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, color: card.color, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 'auto' }}>
                Explore <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '20px 0 28px', background: '#07050F', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <StarSvg size={13} color="#FFD700" />
          <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>Made with <Heart size={13} style={{ display: 'inline', color: '#FF4DA6', fill: '#FF4DA6', verticalAlign: 'middle' }} /> just for you</span>
          <StarSvg size={13} color="#FFD700" />
        </div>
      </footer>
    </div>
  );
}
