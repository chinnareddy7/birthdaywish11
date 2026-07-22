import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Sparkles, Image as ImageIcon, Heart } from 'lucide-react';
import type { Surprise, Memory as MemoryType } from '../../lib/supabase';
import { type Theme, LightHearts } from '../../lib/effects';

interface Props {
  s: Surprise;
  theme: Theme;
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}

export default function MemoriesPage({ s, theme, onNext, onPrev, isLast }: Props) {
  const memories: MemoryType[] = s.memories ?? [];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const accent = theme.accent;

  const goSlide = useCallback((delta: number) => {
    setDirection(delta);
    setSlideIdx((i) => (i + delta + memories.length) % memories.length);
  }, [memories.length]);

  const openLightbox = (idx: number) => {
    setSlideIdx(idx);
    setLightboxIdx(idx);
    setSlideshow(false);
  };

  // Auto-advance slideshow.
  useEffect(() => {
    if (!slideshow || memories.length === 0) return;
    const id = setInterval(() => goSlide(1), 3500);
    return () => clearInterval(id);
  }, [slideshow, goSlide, memories.length]);

  // Keep lightbox in sync with slide index.
  useEffect(() => {
    if (lightboxIdx !== null) setLightboxIdx(slideIdx);
  }, [slideIdx, lightboxIdx]);

  // Keyboard nav in lightbox.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      else if (e.key === 'ArrowRight') goSlide(1);
      else if (e.key === 'ArrowLeft') goSlide(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, goSlide]);

  if (memories.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 60%), ${theme.bg}`, color: '#fff', fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: 24 }}>
        <ImageIcon size={48} color={accent} />
        <h2 style={{ marginTop: 16, fontFamily: "'Dancing Script', cursive", fontSize: '2rem' }}>No memories uploaded</h2>
        <NavButtons onNext={onNext} onPrev={onPrev} isLast={isLast} accent={accent} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 60%), ${theme.bg}`, fontFamily: "'Inter', sans-serif", padding: '48px 24px 120px', position: 'relative', overflow: 'hidden' }}>
      <LightHearts accent={accent} count={8} />
      <div className="animate-page-in" style={{ maxWidth: 980, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Sparkles size={24} color={accent} />
          <h2 style={{ margin: '10px 0 4px', fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#fff' }}>Beautiful Memories</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Our favorite moments together</p>
        </div>

        {/* Gallery grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
          {memories.map((m, i) => (
            <button key={i} onClick={() => openLightbox(i)} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', padding: 0, border: `1px solid ${accent}33`, background: 'rgba(255,255,255,0.03)' }}>
              <img src={m.url} alt={m.caption || 'Memory'} loading="lazy" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 60%, ${accent}22)`, opacity: 0, transition: 'opacity 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              />
              {m.caption && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: 12, textAlign: 'left' }}>
                  {m.caption}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Slideshow toggle */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => { setSlideshow(!slideshow); setLightboxIdx(slideIdx); }} className="btn-surprise" style={{ padding: '12px 28px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {slideshow ? <><Pause size={16} /> Pause Slideshow</> : <><Play size={16} fill="#fff" /> Start Slideshow</>}
          </button>
        </div>
      </div>

      {/* Lightbox / slideshow viewer */}
      {lightboxIdx !== null && (
        <div onClick={() => setLightboxIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          <LightHearts accent={accent} count={6} />

          {/* Close */}
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); setSlideshow(false); }} style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: `1px solid ${accent}55`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <X size={22} />
          </button>

          {/* Prev */}
          <button onClick={(e) => { e.stopPropagation(); goSlide(-1); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}44`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <ChevronLeft size={26} />
          </button>

          {/* Image */}
          <div key={slideIdx} className={direction >= 0 ? 'animate-page-in' : 'animate-fade-in'} style={{ position: 'relative', maxWidth: '86vw', maxHeight: '78vh', zIndex: 3 }} onClick={(e) => e.stopPropagation()}>
            <img src={memories[slideIdx].url} alt={memories[slideIdx].caption || 'Memory'} style={{ maxWidth: '86vw', maxHeight: '78vh', borderRadius: 14, boxShadow: `0 0 60px ${accent}44`, objectFit: 'contain' }} />
            {memories[slideIdx].caption && (
              <div style={{ position: 'absolute', bottom: -48, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: "'Dancing Script', cursive", fontSize: 22 }}>{memories[slideIdx].caption}</div>
            )}
          </div>

          {/* Next */}
          <button onClick={(e) => { e.stopPropagation(); goSlide(1); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}44`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <ChevronRight size={26} />
          </button>

          {/* Counter + indicator dots */}
          <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 5 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{slideIdx + 1} / {memories.length}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {memories.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setDirection(i > slideIdx ? 1 : -1); setSlideIdx(i); }} style={{ width: i === slideIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === slideIdx ? accent : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <NavButtons onNext={onNext} onPrev={onPrev} isLast={isLast} accent={accent} />
    </div>
  );
}

function NavButtons({ onNext, onPrev, isLast, accent }: { onNext: () => void; onPrev: () => void; isLast: boolean; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
      <button onClick={onPrev} style={navBtnStyle}>Previous</button>
      <button onClick={onNext} className="btn-surprise" style={{ ...navBtnStyle, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none' }}>
        {isLast ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '12px 28px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: 14,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
};


