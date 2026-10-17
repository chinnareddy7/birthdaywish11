import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Gift, Music, Cake, ChevronLeft } from 'lucide-react';
import { supabase, type Surprise } from '../lib/supabase';
import { getSurpriseLocally, saveSurpriseLocally } from '../lib/storage';
import { getTheme } from '../lib/effects';
import { stopBirthdayMusic } from '../lib/audio';
import BirthdayVerify from './recipient/BirthdayVerify';
import HeartIntro from './recipient/HeartIntro';
import Countdown from './recipient/Countdown';
import AnimatedBirthdayGiftPage from './recipient/AnimatedBirthdayGiftPage';
import BirthdayFilm from './recipient/BirthdayFilm';
import CakeAnimationPage from './recipient/CakeAnimationPage';
import BalloonReasonsPage from './recipient/BalloonReasonsPage';
import LetterPage from './recipient/LetterPage';
import MemoriesPage from './recipient/MemoriesPage';
import VideoPage from './recipient/VideoPage';
import FinalePage from './recipient/FinalePage';
import PageNav, { type NavPage } from './recipient/PageNav';

interface Props {
  slug: string;
  previewMode?: string;
  onBackFromPreview?: () => void;
}

type Phase =
  | 'loading'
  | 'not-found'
  | 'heart'
  | 'verify'
  | 'countdown'
  | 'celebration'
  | 'birthday-film'
  | 'cake-animation'
  | 'balloon-reasons'
  | 'birthday-gift'
  | 'pages'
  | 'finale';

const PAGES: NavPage[] = [
  { id: 'letter', label: 'Letter' },
  { id: 'memories', label: 'Memories' },
  { id: 'video', label: 'Video' },
];

export default function SurpriseView({ slug, previewMode, onBackFromPreview }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchSurprise = async () => {
      let localSurprise: Surprise | null = null;
      try {
        localSurprise = await getSurpriseLocally(slug);
        if (!localSurprise) {
          localSurprise = await getSurpriseLocally(`surprise_${slug}`);
        }
      } catch (e) {
        console.warn('Could not read cached surprise:', e);
      }

      const applyPhase = () => {
        if (previewMode) {
          if (previewMode === 'letter') { setPageIndex(0); setPhase('pages'); }
          else if (previewMode === 'memories') { setPageIndex(1); setPhase('pages'); }
          else if (previewMode === 'video') { setPageIndex(2); setPhase('pages'); }
          else setPhase(previewMode as Phase);
        } else {
          setPhase('heart');
        }
      };

      try {
        const { data: initialData, error: fetchError } = await supabase
          .from('surprises')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        let data = initialData;

        if (!data) {
          const { data: byId } = await supabase
            .from('surprises')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
          if (byId) data = byId;
        }

        if (!alive) return;

        if (data) {
          saveSurpriseLocally(slug, data);
          setSurprise(data as Surprise);
          applyPhase();
          return;
        }

        if (localSurprise) {
          setSurprise(localSurprise);
          applyPhase();
          return;
        }

        if (fetchError) {
          console.warn('Supabase fetch notice:', fetchError.message);
          setError(fetchError.message);
          setPhase('not-found');
          return;
        }

        setPhase('not-found');
      } catch (err: unknown) {
        if (!alive) return;
        if (localSurprise) {
          setSurprise(localSurprise);
          applyPhase();
        } else {
          const message = err instanceof Error ? err.message : 'Failed to load surprise';
          setError(message);
          setPhase('not-found');
        }
      }
    };

    fetchSurprise();

    return () => {
      alive = false;
    };
  }, [slug, previewMode]);

  // Stop music when leaving the experience entirely.
  useEffect(() => () => stopBirthdayMusic(), []);

  const theme = useMemo(
    () => (surprise ? getTheme(surprise.theme) : getTheme('pink')),
    [surprise]
  );

  const goPage = (delta: number) => {
    if (previewMode) return;
    setTransitioning(true);

    setTimeout(() => {
      setPageIndex((i) => {
        const next = i + delta;

        if (next >= PAGES.length) {
          setPhase('finale');
          return i;
        }

        if (next < 0) {
          setPhase('balloon-reasons');
          return 0;
        }

        return next;
      });

      setTransitioning(false);
    }, 300);
  };

  const handleNextPhase = (next: Phase) => {
    if (previewMode) return;
    setPhase(next);
  };

  const renderPhase = () => {
    // ── Loading ─────────────────────────────────────────────────────────────
    if (phase === 'loading') {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07050F',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="animate-cake" style={{ marginBottom: 16 }}>
              <Cake size={48} color="#FF4DA6" />
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Loading your surprise...
            </p>
          </div>
        </div>
      );
    }

    // ── Not found ───────────────────────────────────────────────────────────
    if (phase === 'not-found' || !surprise) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07050F',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            padding: 24,
          }}
        >
          <Gift size={48} color="#FF4DA6" />

          <h2 style={{ marginTop: 16 }}>
            Surprise not found
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {error ||
              "This link doesn't lead to a surprise. Check the URL and try again."}
          </p>

          <a
            href="/"
            className="btn-surprise"
            style={{
              marginTop: 20,
              padding: '12px 24px',
              borderRadius: 9999,
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Music size={16} />
            Back to Home
          </a>
        </div>
      );
    }

    // ── Heart Intro ─────────────────────────────────────────────────────────
    if (phase === 'heart') {
      return (
        <HeartIntro
          onContinue={() => handleNextPhase('verify')}
        />
      );
    }

    // ── Birthday verification ───────────────────────────────────────────────
    if (phase === 'verify') {
      const extra = surprise as unknown as Record<string, unknown>;
      return (
        <BirthdayVerify
          recipientName={surprise.nickname || surprise.recipient_name}
          birthdayDate={surprise.birthday_date}
          theme={theme}
          verificationPhotoUrl={
            surprise.verification_photo_url ||
            (extra?.verificationPhoto as string) ||
            (extra?.verification_photo as string) ||
            null
          }
          onVerified={() => handleNextPhase('countdown')}
        />
      );
    }

    // ── Countdown ───────────────────────────────────────────────────────────
    if (phase === 'countdown') {
      return (
        <Countdown
          theme={theme}
          onComplete={() => handleNextPhase('birthday-film')}
        />
      );
    }

    // ── Cinematic Birthday Film ──────────────────────────────────────────────
    if (phase === 'birthday-film') {
      return (
        <BirthdayFilm
          recipientName={surprise.nickname || surprise.recipient_name || 'Cutie'}
          onComplete={() => handleNextPhase('cake-animation')}
        />
      );
    }

    // ── Animated Birthday Cake Page ─────────────────────────────────────────
    if (phase === 'cake-animation') {
      return (
        <CakeAnimationPage
          recipientName={surprise.nickname || surprise.recipient_name || 'Cutie'}
          theme={theme}
          onComplete={() => handleNextPhase('balloon-reasons')}
        />
      );
    }

    // ── 5 Balloons Reasons Page ─────────────────────────────────────────────
    if (phase === 'balloon-reasons') {
      return (
        <BalloonReasonsPage
          surprise={surprise}
          recipientName={surprise.nickname || surprise.recipient_name || 'Cutie'}
          onComplete={() => {
            if (previewMode) return;
            setPageIndex(0);
            setPhase('pages');
          }}
        />
      );
    }

    // ── Birthday Gift Animated Surprise Page (Not currently in flow, left for compat) ──
    if (phase === 'birthday-gift') {
      const hasMore = (surprise.memories && surprise.memories.length > 0) || Boolean(surprise.video_url || surprise.video_file_url);
      return (
        <AnimatedBirthdayGiftPage
          s={surprise}
          theme={theme}
          hasNextPage={hasMore}
          onNext={() => {
            if (previewMode) return;
            setPageIndex(surprise.memories && surprise.memories.length > 0 ? 1 : 2);
            setPhase('pages');
          }}
        />
      );
    }

    // ── Finale ───────────────────────────────────────────────────────────────
    if (phase === 'finale') {
      return (
        <FinalePage
          s={surprise}
          theme={theme}
          onRestart={() => {
            if (previewMode) return;
            stopBirthdayMusic();
            setPhase('verify');
            setPageIndex(0);
          }}
        />
      );
    }

    // ── Multi-page surprise ─────────────────────────────────────────────────
    const isLast = pageIndex === PAGES.length - 1;

    const pageProps = {
      s: surprise,
      theme,
      onNext: () => { if (!previewMode) goPage(1); },
      onPrev: () => { if (!previewMode) goPage(-1); },
      isLast,
    };

    const pageKey = `page-${pageIndex}`;

    return (
      <div
        style={{
          background: theme.bg,
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <div
          key={pageKey}
          className={
            transitioning
              ? 'animate-page-out'
              : 'animate-page-in'
          }
          style={{ paddingBottom: 90 }}
        >
          {pageIndex === 0 && (
            <LetterPage
              {...pageProps}
              onNext={() => { if (!previewMode) goPage(1); }}
            />
          )}

          {pageIndex === 1 && (
            <MemoriesPage
              {...pageProps}
              onPrev={() => { if (!previewMode) goPage(-1); }}
              onNext={() => { if (!previewMode) goPage(1); }}
            />
          )}

          {pageIndex === 2 && (
            <VideoPage
              {...pageProps}
              onPrev={() => { if (!previewMode) goPage(-1); }}
              onNext={() => { if (!previewMode) goPage(1); }}
            />
          )}
        </div>

        <PageNav
          pages={PAGES}
          current={pageIndex}
          onPrev={() => { if (!previewMode) goPage(-1); }}
          onNext={() => { if (!previewMode) goPage(1); }}
          isLast={isLast}
          accent={theme.accent}
        />
      </div>
    );
  };

  const getPreviousPhaseHandler = () => {
    if (previewMode) return null;
    if (phase === 'birthday-film') return () => setPhase('countdown');
    if (phase === 'cake-animation') return () => setPhase('birthday-film');
    if (phase === 'balloon-reasons') return () => setPhase('cake-animation');
    return null;
  };

  const handleGlobalPrev = getPreviousPhaseHandler();

  return (
    <>
      {previewMode && onBackFromPreview && (
        <button
          onClick={onBackFromPreview}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 999999,
            padding: '10px 16px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)'; }}
        >
          <ArrowLeft size={16} /> Back to Generated Surprise
        </button>
      )}
      {!previewMode && handleGlobalPrev && (
        <button
          onClick={handleGlobalPrev}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 999999,
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            transition: 'opacity 0.2s, background 0.2s',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
      )}
      {renderPhase()}
    </>
  );
}