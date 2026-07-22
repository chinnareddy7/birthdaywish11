import { useEffect, useMemo, useState } from 'react';
import { Gift, Music, Lock, Cake } from 'lucide-react';
import { supabase, type Surprise, verifyPassword } from '../lib/supabase';
import { getTheme } from '../lib/effects';
import { stopBirthdayMusic } from '../lib/audio';
import BirthdayVerify from './recipient/BirthdayVerify';
import Countdown from './recipient/Countdown';
import Celebration from './recipient/Celebration';
import LetterPage from './recipient/LetterPage';
import MemoriesPage from './recipient/MemoriesPage';
import VideoPage from './recipient/VideoPage';
import FinalePage from './recipient/FinalePage';
import PageNav, { type NavPage } from './recipient/PageNav';

interface Props {
  slug: string;
}

type Phase = 'loading' | 'not-found' | 'password' | 'verify' | 'countdown' | 'celebration' | 'pages' | 'finale';

const PAGES: NavPage[] = [
  { id: 'letter', label: 'Letter' },
  { id: 'memories', label: 'Memories' },
  { id: 'video', label: 'Video' },
];

export default function SurpriseView({ slug }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.from('surprises').select('*').eq('slug', slug).maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (error) { setError(error.message); setPhase('not-found'); return; }
      if (!data) { setPhase('not-found'); return; }
      setSurprise(data as Surprise);
      setPhase((data as Surprise).password_hash ? 'password' : 'verify');
    });
    return () => { alive = false; };
  }, [slug]);

  // Stop music when leaving the experience entirely.
  useEffect(() => () => stopBirthdayMusic(), []);

  const theme = useMemo(() => surprise ? getTheme(surprise.theme) : getTheme('pink'), [surprise]);

  const goPage = (delta: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setPageIndex((i) => {
        const next = i + delta;
        if (next >= PAGES.length) { setPhase('finale'); return i; }
        if (next < 0) return i;
        return next;
      });
      setTransitioning(false);
    }, 300);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07050F', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-cake" style={{ marginBottom: 16 }}><Cake size={48} color="#FF4DA6" /></div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading your surprise...</p>
        </div>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────
  if (phase === 'not-found' || !surprise) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#07050F', color: '#fff', fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: 24 }}>
        <Gift size={48} color="#FF4DA6" />
        <h2 style={{ marginTop: 16 }}>Surprise not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{error || "This link doesn't lead to a surprise. Check the URL and try again."}</p>
        <a href="/" className="btn-surprise" style={{ marginTop: 20, padding: '12px 24px', borderRadius: 9999, color: '#fff', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Music size={16} /> Back to Home
        </a>
      </div>
    );
  }

  // ── Password gate (optional) ────────────────────────────────────────────
  if (phase === 'password') {
    return <PasswordGate onVerify={async (pw: string) => {
      const ok = await verifyPassword(pw, surprise.password_hash!);
      if (ok) setPhase('verify');
      return ok;
    }} />;
  }

  // ── Birthday verification ───────────────────────────────────────────────
  if (phase === 'verify') {
    return <BirthdayVerify
      recipientName={surprise.nickname || surprise.recipient_name}
      birthdayDate={surprise.birthday_date}
      theme={theme}
      onVerified={() => setPhase('countdown')}
    />;
  }

  // ── Countdown ───────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return <Countdown theme={theme} onComplete={() => setPhase('celebration')} />;
  }

  // ── Celebration ─────────────────────────────────────────────────────────
  if (phase === 'celebration') {
    return <Celebration theme={theme} onComplete={() => setPhase('pages')} />;
  }

  // ── Finale ──────────────────────────────────────────────────────────────
  if (phase === 'finale') {
    return <FinalePage s={surprise} theme={theme} onRestart={() => { stopBirthdayMusic(); setPhase('verify'); setPageIndex(0); }} />;
  }

  // ── Multi-page surprise ─────────────────────────────────────────────────
  const isLast = pageIndex === PAGES.length - 1;
  const pageProps = { s: surprise, theme, onNext: () => goPage(1), onPrev: () => goPage(-1), isLast };
  const pageKey = `page-${pageIndex}`;

  return (
    <div style={{ background: theme.bg, color: '#fff', fontFamily: "'Inter', sans-serif", minHeight: '100vh', position: 'relative' }}>
      <div key={pageKey} className={transitioning ? 'animate-page-out' : 'animate-page-in'} style={{ paddingBottom: 90 }}>
        {pageIndex === 0 && <LetterPage {...pageProps} onNext={() => goPage(1)} />}
        {pageIndex === 1 && <MemoriesPage {...pageProps} onPrev={() => goPage(-1)} onNext={() => goPage(1)} />}
        {pageIndex === 2 && <VideoPage {...pageProps} onPrev={() => goPage(-1)} onNext={() => goPage(1)} />}
      </div>

      <PageNav
        pages={PAGES}
        current={pageIndex}
        onPrev={() => goPage(-1)}
        onNext={() => goPage(1)}
        isLast={isLast}
        accent={theme.accent}
      />
    </div>
  );
}

// ── Password gate (kept inline, unchanged behavior) ─────────────────────────
function PasswordGate({ onVerify }: { onVerify: (pw: string) => Promise<boolean> }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(false);
  const submit = async () => {
    setChecking(true); setErr('');
    const ok = await onVerify(pw);
    if (!ok) setErr('Incorrect password. Try again.');
    setChecking(false);
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 40%, rgba(123,63,228,0.25), transparent 60%), #07050F', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #FF1F8C, #C026D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Lock size={28} color="#fff" />
      </div>
      <h2 style={{ color: '#fff', margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>This surprise is locked</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 24px', fontSize: 14 }}>Enter the password the creator shared with you.</p>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Password"
        style={{ width: 280, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.3)', color: '#fff', fontSize: 14, outline: 'none', textAlign: 'center' }} />
      {err && <p style={{ color: '#FF4DA6', fontSize: 13, marginTop: 10 }}>{err}</p>}
      <button onClick={submit} disabled={checking || !pw} className="btn-surprise" style={{ marginTop: 16, padding: '12px 28px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: pw ? 'pointer' : 'not-allowed', opacity: pw ? 1 : 0.5 }}>
        {checking ? 'Checking...' : 'Unlock'}
      </button>
    </div>
  );
}
