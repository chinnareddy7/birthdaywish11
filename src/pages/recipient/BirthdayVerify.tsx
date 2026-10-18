import { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react';
import { type Theme } from '../../lib/effects';
import { resumeAudio } from '../../lib/audio';

interface Props {
  recipientName: string;
  birthdayDate: string | null;
  theme: Theme;
  verificationPhotoUrl?: string | null;
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

interface ParsedPhoto {
  url: string | null;
  shape: string;
  isCustomShape: boolean;
  objectFit: 'cover' | 'contain';
}

export function getShapeClipStyles(shape: string): CSSProperties {
  switch (shape) {
    case 'circle':
      return { borderRadius: '50%', overflow: 'hidden' };
    case 'oval':
      return { borderRadius: '50%', overflow: 'hidden' };
    case 'rounded-rectangle':
      return { borderRadius: '24px', overflow: 'hidden' };
    case 'triangle':
      return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
    case 'hexagon':
      return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    case 'star':
      return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
    case 'heart':
      return { clipPath: 'url(#verify-heart-clip)' };
    case 'square':
      return { aspectRatio: '1 / 1', borderRadius: '20px', overflow: 'hidden' };
    case 'rect':
    default:
      return { borderRadius: '22px', overflow: 'hidden' };
  }
}

function parseVerificationPhoto(raw: unknown): ParsedPhoto {
  if (!raw) {
    return { url: null, shape: 'rect', isCustomShape: false, objectFit: 'cover' };
  }

  let data = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        data = JSON.parse(trimmed);
      } catch {
        return {
          url: trimmed,
          shape: 'rect',
          isCustomShape: false,
          objectFit: 'cover',
        };
      }
    } else {
      return {
        url: trimmed,
        shape: 'rect',
        isCustomShape: false,
        objectFit: 'cover',
      };
    }
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, any>;
    // Avoid dead blob URLs if persistent originalUrl or dataUrl is available
    let url = obj.finalUrl || obj.originalUrl || obj.url || obj.photoUrl || obj.src || null;
    if (typeof url === 'string' && url.startsWith('blob:') && obj.originalUrl && !obj.originalUrl.startsWith('blob:')) {
      url = obj.originalUrl;
    }

    const shape = obj.config?.shape || 'rect';
    const isCustomShape = Boolean(shape && shape !== 'rect' && shape !== 'square');
    const objectFit = (obj.config?.objectFit as 'cover' | 'contain') || (isCustomShape ? 'contain' : 'cover');

    return { url, shape, isCustomShape, objectFit };
  }

  return { url: null, shape: 'rect', isCustomShape: false, objectFit: 'cover' };
}

export default function BirthdayVerify({
  recipientName,
  birthdayDate,
  verificationPhotoUrl,
  onVerified,
}: Props) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  
  // 0 = none, 1 = glow active, 2 = heart growing / transitioning
  const [unlockStage, setUnlockStage] = useState(0);

  // Parse photo data safely
  const parsedPhoto = useMemo(
    () => parseVerificationPhoto(verificationPhotoUrl),
    [verificationPhotoUrl]
  );
  const [imgSrc, setImgSrc] = useState<string | null>(parsedPhoto.url);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImgSrc(parsedPhoto.url);
    setImageError(false);
    setImageLoaded(false);

    // Immediate and frame-delayed check for cached images or data URIs
    const checkComplete = () => {
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setImageLoaded(true);
      }
    };
    checkComplete();
    const t = setTimeout(checkComplete, 50);
    return () => clearTimeout(t);
  }, [parsedPhoto.url]);

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('[BirthdayVerify] Verification photo failed to load:', {
      src: imgSrc,
      errorEvent: e?.type,
    });
    // If finalUrl failed, try fallback to originalUrl from JSON if available and persistent
    if (typeof verificationPhotoUrl === 'string') {
      try {
        const parsed = JSON.parse(verificationPhotoUrl);
        if (parsed.originalUrl && parsed.originalUrl !== imgSrc && !parsed.originalUrl.startsWith('blob:')) {
          console.info('[BirthdayVerify] Falling back to originalUrl:', parsed.originalUrl);
          setImgSrc(parsed.originalUrl);
          return;
        }
      } catch {}
    }
    setImageError(true);
    setImageLoaded(false);
  };

  // Dial pad dynamic dimension measurement
  const dialPadRef = useRef<HTMLDivElement>(null);
  const [dialPadDims, setDialPadDims] = useState<{ width: number; height: number }>({
    width: 242,
    height: 328,
  });

  useEffect(() => {
    const el = dialPadRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDialPadDims({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Auto-submit when length reaches 8
  useEffect(() => {
    if (passcode.length === 8 && !checking && unlockStage === 0) {
      submit();
    }
  }, [passcode, checking, unlockStage]);

  const submit = () => {
    if (passcode.length !== 8) {
      setError("Not quite... try again ❤️");
      triggerShake();
      return;
    }

    setChecking(true);
    setError('');

    const day = passcode.slice(0, 2);
    const month = passcode.slice(2, 4);
    const year = passcode.slice(4, 8);
    const enteredDate = `${year}-${month}-${day}`;

    setTimeout(() => {
      if (birthdayDate && birthdayMatches(enteredDate, birthdayDate)) {
        resumeAudio();
        
        // Start Heart Arrow transition style
        setUnlockStage(1); // date field glows pink
        
        setTimeout(() => {
          setUnlockStage(2); // Heart grows, transition
        }, 600);

        setTimeout(() => {
          onVerified();
        }, 1800);
      } else {
        setError("Not quite... try again ❤️");
        triggerShake();
        setChecking(false);
        setPasscode('');
      }
    }, 400);
  };

  const handleKeyPress = (key: string) => {
    if (checking || unlockStage > 0) return;

    if (key === 'backspace') {
      setPasscode((prev) => prev.slice(0, -1));
      setError('');
      return;
    }

    if (key === 'clear') {
      setPasscode('');
      setError('');
      return;
    }

    if (passcode.length >= 8) return;

    setPasscode((prev) => prev + key);
    setError('');
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Determine active section for soft pink glow
  const isDayActive = passcode.length < 2;
  const isMonthActive = passcode.length >= 2 && passcode.length < 4;
  const isYearActive = passcode.length >= 4 && passcode.length < 8;

  const renderDay = () => {
    if (passcode.length === 0) return 'DD';
    return passcode.slice(0, 2).padEnd(2, '_');
  };

  const renderMonth = () => {
    if (passcode.length === 0) return 'MM';
    if (passcode.length <= 2) return '__';
    return passcode.slice(2, 4).padEnd(2, '_');
  };

  const renderYear = () => {
    if (passcode.length === 0) return 'YYYY';
    if (passcode.length <= 4) return '____';
    return passcode.slice(4, 8).padEnd(4, '_');
  };

  const hasValidPhoto = Boolean(imgSrc && !imageError);

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#fffaf8',
      backgroundImage: `radial-gradient(ellipse at 50% 30%, #fffcfb 0%, #fff0ee 40%, #ffe1df 100%)`,
      textAlign: 'center', 
      padding: '24px 16px 48px', 
      fontFamily: "'Inter', sans-serif", 
      position: 'relative', 
      overflowY: 'auto',
      overflowX: 'hidden',
      color: '#333',
      boxSizing: 'border-box'
    }}>
      {/* SVG Defs for ObjectBoundingBox-based Heart Clip */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <clipPath id="verify-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5, 0.88 C 0.2, 0.65, 0, 0.45, 0, 0.28 C 0, 0.12, 0.12, 0, 0.28, 0 C 0.38, 0, 0.46, 0.05, 0.5, 0.12 C 0.54, 0.05, 0.62, 0, 0.72, 0 C 0.88, 0, 1, 0.12, 1, 0.28 C 1, 0.45, 0.8, 0.65, 0.5, 0.88 Z" />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatPhoto {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }
        @keyframes inputShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes unlockHeartGrow {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          40% { transform: scale(1.2) rotate(-45deg); opacity: 1; }
          100% { transform: scale(80) rotate(-45deg); opacity: 0; }
        }
        @keyframes unlockTransition {
          0% { filter: brightness(1) blur(0); }
          60% { filter: brightness(1.1) blur(2px); opacity: 1; }
          100% { filter: brightness(1.3) blur(10px); opacity: 0; }
        }
        @keyframes particleBurst {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: scale(1.5) translateY(-100px); opacity: 0; }
        }
        @keyframes glowingBreathing {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 105, 180, 0.4); }
          50% { box-shadow: 0 0 35px rgba(255, 105, 180, 0.7); }
        }
        
        .anim-stagger-1 { animation: fadeScaleIn 0.8s ease-out 0.1s forwards; opacity: 0; }
        .anim-stagger-2 { animation: fadeScaleIn 0.8s ease-out 0.3s forwards; opacity: 0; }
        .anim-stagger-3 { animation: fadeScaleIn 0.8s ease-out 0.5s forwards; opacity: 0; }
        .anim-stagger-4 { animation: fadeScaleIn 0.8s ease-out 0.7s forwards; opacity: 0; }
        .anim-stagger-5 { animation: fadeScaleIn 0.8s ease-out 0.9s forwards; opacity: 0; }
        .anim-stagger-6 { animation: fadeScaleIn 0.8s ease-out 1.1s forwards; opacity: 0; }
        
        .photo-wrapper {
          animation: fadeScaleIn 0.8s ease-out 0.5s forwards;
          opacity: 0;
        }

        .verify-photo-card {
          width: 250px;
          height: 330px;
          max-width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verify-keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 70px);
          gap: 16px;
          justify-content: center;
          width: fit-content;
          margin: 0 auto;
        }
        
        .keypad-btn {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          border: 1px solid rgba(255, 182, 193, 0.7);
          background: rgba(255, 255, 255, 0.55);
          color: #cc5b7a;
          font-size: 24px;
          font-weight: 300;
          cursor: pointer;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 15px rgba(255, 182, 193, 0.15);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .keypad-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 105, 180, 0.5);
          box-shadow: 0 6px 20px rgba(255, 105, 180, 0.2), inset 0 0 10px rgba(255, 182, 193, 0.3);
          transform: translateY(-2px);
          color: #ff4d85;
        }
        .keypad-btn:active {
          transform: scale(0.92);
          background: rgba(255, 240, 245, 0.95);
          box-shadow: 0 2px 10px rgba(255, 105, 180, 0.2);
        }
        
        .date-section {
          transition: all 0.3s ease;
        }
        .date-active {
          color: #ff4d85 !important;
          text-shadow: 0 0 15px rgba(255, 105, 180, 0.5);
          transform: scale(1.05);
        }

        /* Layout Container */
        .verify-body-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 36px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 719px) {
          .verify-body-container {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .verify-photo-card {
            width: min(210px, 60vw) !important;
            height: min(210px, 60vw) !important;
            margin: 0 auto 4px !important;
          }
        }

        @media (max-width: 480px) {
          .verify-keypad-grid {
            grid-template-columns: repeat(3, 62px) !important;
            gap: 12px !important;
          }
          .keypad-btn {
            width: 62px !important;
            height: 62px !important;
            font-size: 22px !important;
            border-radius: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .verify-keypad-grid {
            grid-template-columns: repeat(3, 54px) !important;
            gap: 10px !important;
          }
          .keypad-btn {
            width: 54px !important;
            height: 54px !important;
            font-size: 19px !important;
            border-radius: 12px !important;
          }
        }

        /* Giant growing heart for transition */
        .unlock-heart {
          position: absolute;
          width: 100px;
          height: 100px;
          background: #ff1744;
          transform: rotate(-45deg);
          top: 50%;
          left: 50%;
          margin-top: -50px;
          margin-left: -50px;
          z-index: 10;
          opacity: 0;
          pointer-events: none;
        }
        .unlock-heart::before,
        .unlock-heart::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          background: inherit;
          border-radius: 50%;
        }
        .unlock-heart::before {
          top: -50px;
          left: 0;
        }
        .unlock-heart::after {
          top: 0;
          left: 50px;
        }
      `}</style>

      {/* Background Soft Glows */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 450, height: 450, borderRadius: '50%', background: `radial-gradient(circle, rgba(255, 192, 203, 0.35), transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, rgba(255, 218, 185, 0.35), transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Gentle Floating Hearts & Particles */}
      <div style={{ position: 'absolute', top: '20%', left: '18%', animation: 'floatHeart 6s infinite', color: 'rgba(255, 182, 193, 0.5)', fontSize: '24px' }}>❤</div>
      <div style={{ position: 'absolute', top: '65%', right: '15%', animation: 'floatHeart 5s infinite 1s', color: 'rgba(255, 182, 193, 0.4)', fontSize: '18px' }}>❤</div>
      <div style={{ position: 'absolute', top: '35%', right: '22%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 0 10px rgba(255,182,193,0.8)', animation: 'floatHeart 4s infinite 2s' }} />
      <div style={{ position: 'absolute', bottom: '25%', left: '20%', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 0 10px rgba(255,182,193,0.8)', animation: 'floatHeart 7s infinite 0.5s' }} />

      {/* Unlock Transition Heart */}
      {unlockStage === 2 && (
        <div className="unlock-heart" style={{ animation: 'unlockHeartGrow 1.5s cubic-bezier(0.5, 0, 0.3, 1) forwards' }} />
      )}

      {/* Unlock Transition Particles */}
      {unlockStage >= 1 && (
        <>
          <div style={{ position: 'absolute', top: '50%', left: '40%', fontSize: '20px', color: '#ff69b4', animation: 'particleBurst 1s ease-out forwards', zIndex: 5 }}>❤</div>
          <div style={{ position: 'absolute', top: '45%', left: '55%', fontSize: '16px', color: '#ff69b4', animation: 'particleBurst 1s ease-out 0.2s forwards', zIndex: 5 }}>❤</div>
          <div style={{ position: 'absolute', top: '55%', left: '60%', fontSize: '24px', color: '#ff1493', animation: 'particleBurst 1.2s ease-out 0.1s forwards', zIndex: 5 }}>❤</div>
          <div style={{ position: 'absolute', top: '40%', left: '45%', fontSize: '14px', color: '#ff1493', animation: 'particleBurst 0.9s ease-out 0.3s forwards', zIndex: 5 }}>❤</div>
        </>
      )}

      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        width: '100%', 
        maxWidth: 820, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        animation: unlockStage === 2 ? 'unlockTransition 1s ease-in forwards' : undefined,
        transition: 'max-width 0.3s ease',
      }}>
        
        {/* Title */}
        <h1 className="anim-stagger-1" style={{ fontSize: 'clamp(2.2rem, 5vw, 2.8rem)', color: '#cc5b7a', margin: '0 0 4px', fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
          Before We Begin...
        </h1>
        <p className="anim-stagger-2" style={{ color: '#d9738e', margin: '0 0 16px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
          Something special is waiting for you ❤️
        </p>

        {recipientName && (
          <div className="anim-stagger-3" style={{ marginBottom: 28, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', color: '#ff4d85', fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>💗 {recipientName}</span>
          </div>
        )}

        {/* Main interactive area: Photo + Keypad */}
        <div className="verify-body-container">
          
          {/* Automatically measured and scaled Photo Card / Fallback Heart Placeholder */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {hasValidPhoto ? (
              <div
                className="photo-wrapper verify-photo-card"
                style={{
                  width: dialPadDims.width || 250,
                  height: dialPadDims.height || 330,
                  borderRadius: parsedPhoto.isCustomShape ? 0 : 24,
                  overflow: parsedPhoto.isCustomShape ? 'visible' : 'hidden',
                  border: parsedPhoto.isCustomShape ? 'none' : '2px solid rgba(255, 182, 193, 0.85)',
                  boxShadow: parsedPhoto.isCustomShape ? 'none' : '0 8px 30px rgba(255, 182, 193, 0.35), inset 0 0 20px rgba(255, 255, 255, 0.6)',
                  background: parsedPhoto.isCustomShape ? 'transparent' : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'width 0.25s ease, height 0.25s ease',
                  ...(parsedPhoto.isCustomShape ? { filter: 'drop-shadow(0 8px 18px rgba(255, 182, 193, 0.55))' } : {}),
                }}
              >
                <img
                  ref={imgRef}
                  src={imgSrc!}
                  alt="Birthday surprise verification"
                  onLoad={() => setImageLoaded(true)}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: parsedPhoto.objectFit,
                    objectPosition: 'center',
                    display: 'block',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.35s ease',
                    ...getShapeClipStyles(parsedPhoto.shape),
                  }}
                />

                {/* Soft skeleton placeholder while loading */}
                {!imageLoaded && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 240, 245, 0.6)',
                      borderRadius: parsedPhoto.isCustomShape ? 0 : 22,
                    }}
                  >
                    <span style={{ fontSize: 28, animation: 'floatHeart 2s infinite' }}>💗</span>
                  </div>
                )}
              </div>
            ) : (
              /* Heart placeholder shown ONLY when photo is genuinely unavailable or failed to load */
              <div
                className="photo-wrapper verify-photo-card"
                style={{
                  width: dialPadDims.width || 250,
                  height: dialPadDims.height || 330,
                  borderRadius: 24,
                  border: '2px solid rgba(255, 182, 193, 0.75)',
                  boxShadow: '0 8px 30px rgba(255, 182, 193, 0.25)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  boxSizing: 'border-box',
                  transition: 'width 0.25s ease, height 0.25s ease',
                }}
              >
                <span style={{ fontSize: 44, animation: 'floatHeart 3s infinite', filter: 'drop-shadow(0 4px 12px rgba(255,105,180,0.45))' }}>💗</span>
                <span style={{ marginTop: 12, fontSize: 16, color: '#cc5b7a', fontWeight: 600, fontFamily: "'Dancing Script', cursive" }}>
                  A Special Memory
                </span>
                <span style={{ marginTop: 4, fontSize: 11, color: 'rgba(204, 91, 122, 0.6)' }}>
                  Awaits Behind The Lock
                </span>
              </div>
            )}
          </div>

          {/* Birthday keypad wrapper */}
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: shake ? 'inputShake 0.4s ease-in-out' : undefined
            }}
          >
            <p
              className="anim-stagger-5"
              style={{
                margin: '0 0 12px',
                color: '#d9738e',
                fontSize: 'clamp(1.3rem, 3.5vw, 1.6rem)',
                fontWeight: 500,
                fontFamily: "'Dancing Script', cursive",
              }}
            >
              Tell me when your special day is ❤️
            </p>
            
            {/* Birthday display */}
            <div className="anim-stagger-5" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 24,
                  padding: '14px 28px',
                  background: unlockStage >= 1 ? 'rgba(255, 240, 245, 0.95)' : 'rgba(255, 255, 255, 0.7)',
                  border: `1px solid ${unlockStage >= 1 ? 'rgba(255, 105, 180, 0.7)' : 'rgba(255, 182, 193, 0.6)'}`,
                  borderRadius: '24px',
                  boxShadow: unlockStage >= 1 ? '0 0 30px rgba(255, 105, 180, 0.5)' : '0 8px 25px rgba(255, 182, 193, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s ease',
                  animation: unlockStage === 1 ? 'glowingBreathing 1s infinite' : undefined
                }}
              >
                <span
                  className={`date-section ${isDayActive && !checking ? 'date-active' : ''}`}
                  style={{
                    fontSize: 'clamp(22px, 5vw, 28px)',
                    fontWeight: 400,
                    letterSpacing: 4,
                    color: passcode.length >= 2 || unlockStage >= 1 ? '#cc5b7a' : (passcode.length > 0 ? '#ff4d85' : 'rgba(204, 91, 122, 0.4)'),
                  }}
                >
                  {renderDay()}
                </span>

                <span style={{ color: 'rgba(255, 182, 193, 0.9)', fontSize: 24, fontWeight: 300, padding: '0 4px' }}>/</span>

                <span
                  className={`date-section ${isMonthActive && !checking ? 'date-active' : ''}`}
                  style={{
                    fontSize: 'clamp(22px, 5vw, 28px)',
                    fontWeight: 400,
                    letterSpacing: 4,
                    color: passcode.length >= 4 || unlockStage >= 1 ? '#cc5b7a' : (passcode.length > 2 ? '#ff4d85' : 'rgba(204, 91, 122, 0.4)'),
                  }}
                >
                  {renderMonth()}
                </span>

                <span style={{ color: 'rgba(255, 182, 193, 0.9)', fontSize: 24, fontWeight: 300, padding: '0 4px' }}>/</span>

                <span
                  className={`date-section ${isYearActive && !checking ? 'date-active' : ''}`}
                  style={{
                    fontSize: 'clamp(22px, 5vw, 28px)',
                    fontWeight: 400,
                    letterSpacing: 4,
                    color: passcode.length >= 8 || unlockStage >= 1 ? '#cc5b7a' : (passcode.length > 4 ? '#ff4d85' : 'rgba(204, 91, 122, 0.4)'),
                  }}
                >
                  {renderYear()}
                </span>
              </div>
            </div>

            {/* Number keypad - reference container for dimensions */}
            <div
              ref={dialPadRef}
              className="anim-stagger-6 verify-keypad-grid"
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="keypad-btn"
                >
                  {key}
                </button>
              ))}
              {/* Clear */}
              <button
                type="button"
                onClick={() => handleKeyPress('clear')}
                className="keypad-btn"
                style={{ fontSize: 13, fontWeight: 500, color: '#d9738e' }}
              >
                CLEAR
              </button>

              {/* Zero */}
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="keypad-btn"
              >
                0
              </button>

              {/* Backspace */}
              <button
                type="button"
                onClick={() => handleKeyPress('backspace')}
                className="keypad-btn"
              >
                ←
              </button>
            </div>

            {/* Error Message Area */}
            <div style={{ height: 30, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {error && (
                <div
                  style={{
                    color: '#ff4d85',
                    fontSize: 16,
                    fontWeight: 500,
                    fontFamily: "'Dancing Script', cursive",
                    textShadow: '0 0 10px rgba(255, 77, 133, 0.3)',
                    animation: 'fadeScaleIn 0.3s ease-out forwards'
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
