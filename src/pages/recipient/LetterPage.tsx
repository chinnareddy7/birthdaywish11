import { useEffect, useState } from 'react';
import { Heart, Mail } from 'lucide-react';
import type { Surprise } from '../../lib/supabase';
import type { Theme, LightHearts } from '../../lib/effects';

interface Props {
  s: Surprise;
  theme: Theme;
  onNext: () => void;
  isLast: boolean;
}

export default function LetterPage({ s, theme, onNext, isLast }: Props) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpened(true), 1400);
    return () => clearTimeout(id);
  }, []);

  const accent = theme.accent;
  const displayName = s.nickname || s.recipient_name;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 40%, ${accent}18, transparent 60%), ${theme.bg}`, fontFamily: "'Inter', sans-serif", padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* decorative hearts */}
      <LightHearts accent={accent} count={8} />

      <div className="animate-page-in" style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Heart size={16} color={accent} fill={accent} className="animate-heart-soft" />
          <span style={{ color: accent, letterSpacing: '0.2em', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>A Letter From The Heart</span>
          <Heart size={16} color={accent} fill={accent} className="animate-heart-soft" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Envelope / Letter */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 520, perspective: 1000 }}>
          {/* Envelope body */}
          <div style={{
            position: 'relative', width: '100%', height: opened ? 0 : 320,
            transition: 'height 0.8s ease',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
              background: `linear-gradient(135deg, ${accent}22, ${theme.accent2}22)`,
              border: `1px solid ${accent}44`, boxShadow: `0 0 50px ${accent}22`,
              backdropFilter: 'blur(10px)',
            }}>
              {/* envelope flap */}
              <div className={opened ? 'animate-flap-open' : ''} style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: `linear-gradient(135deg, ${accent}33, ${theme.accent2}33)`,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                transformOrigin: 'top',
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <Mail size={48} color={accent} style={{ opacity: opened ? 0 : 1, transition: 'opacity 0.4s' }} />
                <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28, color: '#fff', opacity: opened ? 0 : 1, transition: 'opacity 0.4s' }}>{displayName}</span>
              </div>
            </div>
          </div>

          {/* Letter content */}
          {opened && (
            <div className="animate-letter-slide" style={{
              width: '100%', borderRadius: 18, padding: '36px 32px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: `1px solid ${accent}44`, boxShadow: `0 0 60px ${accent}33`,
              backdropFilter: 'blur(14px)',
            }}>
              {s.letter_photo_url && (
                <div style={{ marginBottom: 24, borderRadius: 14, overflow: 'hidden', maxWidth: 280, margin: '0 auto 24px' }}>
                  <img src={s.letter_photo_url} alt="With love" loading="lazy" style={{ width: '100%', display: 'block' }} />
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Heart size={22} color={accent} fill={accent} className="animate-heart-soft" />
                <h2 style={{ margin: '10px 0 4px', fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#fff', fontWeight: 700 }}>
                  Dear {displayName}
                </h2>
              </div>

              <div style={{
                whiteSpace: 'pre-wrap', fontFamily: "'Dancing Script', cursive",
                fontSize: '1.3rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.92)',
                textAlign: 'center', padding: '0 8px',
              }}>
                {s.letter || 'Happy Birthday! You are loved more than words can say.'}
              </div>

              <div style={{ marginTop: 28, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accent})` }} />
                  <Heart size={14} color={accent} fill={accent} />
                  <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                </div>
                <div style={{ marginTop: 12, fontFamily: "'Dancing Script', cursive", fontSize: 22, color: accent }}>
                  With all my love,
                </div>
                <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 26, color: '#fff', fontWeight: 700, marginTop: 4 }}>
                  {s.creator_name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        {opened && (
          <button onClick={onNext} className="btn-surprise animate-fade-up" style={{ marginTop: 36, padding: '16px 40px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, animationDelay: '0.3s' }}>
            <Heart size={18} fill="#fff" />
            {isLast ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}


