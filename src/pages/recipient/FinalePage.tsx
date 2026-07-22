import { PartyPopper, Heart, Star, Gift } from 'lucide-react';
import type { Surprise } from '../../lib/supabase';
import type { Theme } from '../../lib/effects';
import { CelebrationConfetti, FloatingHearts, SparkleField } from '../../lib/effects';
import { useEffect, useState } from 'react';

interface Props {
  s: Surprise;
  theme: Theme;
  onRestart: () => void;
}

export default function FinalePage({ s, theme, onRestart }: Props) {
  const [celebrate, setCelebrate] = useState(true);
  const accent = theme.accent;

  useEffect(() => {
    const id = setTimeout(() => setCelebrate(false), 6000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 40%, ${accent}22, ${theme.accent2}14 40%, ${theme.bg} 80%)`, fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: 32, position: 'relative', overflow: 'hidden' }}>
      <SparkleField count={36} />
      {celebrate && <CelebrationConfetti />}
      <FloatingHearts accent={accent} />

      <div className="animate-page-in" style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 50px ${accent}66` }}>
          <PartyPopper size={44} color="#fff" />
        </div>

        <h1 style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: '3rem', color: '#fff', fontWeight: 700 }}>
          Thank You
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
          I hope this surprise<br />made you smile.
        </p>

        <div style={{ margin: '28px 0', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${accent})` }} />
          <Heart size={18} color={accent} fill={accent} className="animate-heart-soft" />
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        </div>

        <h2 style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: '2.6rem', color: accent }}>
          Happy Birthday!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 20, lineHeight: 1.8 }}>
          With all my love,<br />
          <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28, color: '#fff', fontWeight: 700 }}>{s.creator_name}</span>
        </p>

        <div style={{ marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          <Star size={12} fill={accent} color={accent} />
          <span>Made with Birthday Surprise</span>
          <Star size={12} fill={accent} color={accent} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Gift size={28} color={accent} className="animate-heart-soft" />
        </div>

        <button onClick={onRestart} style={{ marginTop: 32, padding: '10px 22px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: `1px solid ${accent}44`, color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Gift size={14} /> Replay the Surprise
        </button>
      </div>
    </div>
  );
}
