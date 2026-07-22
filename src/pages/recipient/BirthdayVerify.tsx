import { useState } from 'react';
import { Cake, Lock, Sparkles, Calendar, Heart } from 'lucide-react';
import { type Theme, SparkleField } from '../../lib/effects';
import { resumeAudio } from '../../lib/audio';

interface Props {
  recipientName: string;
  birthdayDate: string | null;
  theme: Theme;
  onVerified: () => void;
}

// Compare only month + day (year irrelevant for birthday verification).
function birthdayMatches(entered: string, stored: string): boolean {
  if (!entered || !stored) return false;
  const e = entered.split('-');
  const s = stored.split('-');
  if (e.length < 2 || s.length < 2) return false;
  return e[1] === s[1] && e[2] === s[2];
}

export default function BirthdayVerify({ recipientName, birthdayDate, theme, onVerified }: Props) {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = () => {
    if (!date) {
      setError('Please enter a birthday.');
      triggerShake();
      return;
    }
    setChecking(true);
    setError('');
    // brief delay for the "unlock" feel
    setTimeout(() => {
      if (birthdayDate && birthdayMatches(date, birthdayDate)) {
        resumeAudio();
        onVerified();
      } else {
        setError("Oops! That's not the correct birthday. Please try again.");
        triggerShake();
      }
      setChecking(false);
    }, 650);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 35%, ${theme.accent}22, transparent 60%), ${theme.bg}`,
      textAlign: 'center', padding: 24, fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <SparkleField count={30} />
      {/* soft glowing orbs */}
      <div style={{ position: 'absolute', top: '12%', left: '15%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}33, transparent 70%)`, filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', bottom: '8%', right: '12%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent2}33, transparent 70%)`, filter: 'blur(24px)' }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Icon */}
        <div className="animate-fade-up" style={{
          width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, boxShadow: `0 0 40px ${theme.accent}66`,
        }}>
          <Cake size={40} color="#fff" />
        </div>

        {/* Title */}
        <h1 className="animate-fade-up" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, animationDelay: '0.1s' }}>
          Before We Begin...
        </h1>
        <p className="animate-fade-up" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, marginBottom: 28, fontSize: 15, lineHeight: 1.6, maxWidth: 340, animationDelay: '0.2s' }}>
          Please enter your birthday to unlock your special surprise.
        </p>

        {recipientName && (
          <div className="animate-fade-up" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9999, background: `${theme.accent}1a`, border: `1px solid ${theme.accent}44`, animationDelay: '0.25s' }}>
            <Heart size={14} color={theme.accent} fill={theme.accent} />
            <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: theme.accent }}>{recipientName}</span>
          </div>
        )}

        {/* Date picker */}
        <div className={shake ? 'animate-shake' : ''} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.accent, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <Calendar size={18} />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              style={{
                width: '100%', padding: '16px 16px 16px 46px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: `1px solid ${shake ? '#FF4DA6' : `${theme.accent}40`}`,
                color: '#fff', fontSize: 16, outline: 'none', fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)', transition: 'border 0.3s, box-shadow 0.3s',
                boxShadow: shake ? '0 0 24px rgba(255,77,166,0.4)' : 'none',
                colorScheme: 'dark',
              }}
            />
          </div>

          {error && (
            <div className="animate-err-pulse" style={{
              marginTop: 16, padding: '12px 18px', borderRadius: 12,
              background: 'rgba(255,77,166,0.12)', border: '1px solid rgba(255,77,166,0.35)',
              color: '#FF8FB3', fontSize: 14, fontWeight: 600, maxWidth: 340, lineHeight: 1.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Unlock button */}
          <button
            onClick={submit}
            disabled={checking}
            className="btn-surprise animate-pulse-glow"
            style={{
              ['--glow' as any]: `${theme.accent}88`,
              marginTop: 24, padding: '18px 44px', borderRadius: 9999, color: '#fff',
              fontWeight: 700, fontSize: 17, border: 'none', cursor: checking ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 12, opacity: checking ? 0.8 : 1,
            }}
          >
            <Lock size={20} />
            {checking ? 'Unlocking...' : 'Unlock Surprise'}
            <Sparkles size={20} />
          </button>
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Enter the month and day that match the birthday on file.
        </p>
      </div>
    </div>
  );
}
