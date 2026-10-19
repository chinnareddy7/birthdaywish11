import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Heart, Sparkles } from 'lucide-react';
import type { Surprise, Memory as MemoryType } from '../../lib/supabase';
import { type Theme, LightHearts } from '../../lib/effects';

interface Props {
  s: Surprise;
  theme: Theme;
  onNext: () => void;
  onPrev?: () => void;
  isLast: boolean;
}

export default function MemoriesPage({ s, theme, onNext, isLast }: Props) {
  const memories: MemoryType[] = s.memories ?? [];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const goSlide = useCallback((delta: number) => {
    setDirection(delta);
    setSlideIdx((i) => (i + delta + memories.length) % memories.length);
  }, [memories.length]);

  const openLightbox = (idx: number) => {
    setSlideIdx(idx);
    setLightboxIdx(idx);
    setSlideshow(false);
  };

  useEffect(() => {
    if (!slideshow || memories.length === 0) return;
    const id = setInterval(() => goSlide(1), 3500);
    return () => clearInterval(id);
  }, [slideshow, goSlide, memories.length]);

  useEffect(() => {
    if (lightboxIdx !== null) setLightboxIdx(slideIdx);
  }, [slideIdx, lightboxIdx]);

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

  useEffect(() => {
    // Small delay to trigger the cinematic reveal sequence
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffafb, #ffecee)',
      fontFamily: "'Inter', sans-serif",
      padding: '80px 24px 120px',
      position: 'relative',
      overflowX: 'hidden',
      color: '#333'
    }}>
      <style>{`
        /* Slide in animations for photos */
        @keyframes slideInLeftBounce {
          0% { opacity: 0; transform: translateX(-100vw) rotate(-20deg); }
          70% { opacity: 1; transform: translateX(25px) rotate(6deg); }
          85% { transform: translateX(-10px) rotate(-3deg); }
          100% { opacity: 1; transform: translateX(0) rotate(0deg); }
        }
        @keyframes slideInRightBounce {
          0% { opacity: 0; transform: translateX(100vw) rotate(20deg); }
          70% { opacity: 1; transform: translateX(-25px) rotate(-6deg); }
          85% { transform: translateX(10px) rotate(3deg); }
          100% { opacity: 1; transform: translateX(0) rotate(0deg); }
        }
        @keyframes slideInTopBounce {
          0% { opacity: 0; transform: translateY(-100vh) rotate(-15deg); }
          70% { opacity: 1; transform: translateY(25px) rotate(4deg); }
          85% { transform: translateY(-10px) rotate(-2deg); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        @keyframes slideInBottomBounce {
          0% { opacity: 0; transform: translateY(100vh) rotate(15deg); }
          70% { opacity: 1; transform: translateY(-25px) rotate(-4deg); }
          85% { transform: translateY(10px) rotate(2deg); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg); }
        }

        /* Basic Fade In */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-slow {
          animation: fadeIn 1.2s ease-out forwards;
        }

        /* Heart floating */
        @keyframes floatHeartPage {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }

        /* Wrappers for the photo slide animation */
        .photo-wrapper {
          opacity: 0;
          position: relative;
        }
        .slide-left { animation: slideInLeftBounce 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-right { animation: slideInRightBounce 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-top { animation: slideInTopBounce 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-bottom { animation: slideInBottomBounce 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

        /* The actual inner card */
        .mem-recipient-card {
          width: 250px;
          background: #fff;
          padding: 14px 14px 28px 14px;
          border-radius: 4px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
          cursor: pointer;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .mem-recipient-card:hover {
          transform: rotate(0deg) scale(1.08) translateY(-12px) !important;
          box-shadow: 0 25px 50px rgba(255, 77, 133, 0.25), 0 10px 20px rgba(255, 77, 133, 0.15) !important;
          z-index: 50 !important;
        }

        /* Buttons */
        .mem-btn-primary {
          background: linear-gradient(135deg, #ff75a0, #ff4d85);
          color: white;
          padding: 16px 40px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.15rem;
          border: none;
          box-shadow: 0 8px 24px rgba(255, 77, 133, 0.35);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .mem-btn-primary:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 30px rgba(255, 77, 133, 0.45);
        }
        
        .mem-btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: #ff4d85;
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          border: 2px solid #ffe1e8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mem-btn-secondary:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 77, 133, 0.1);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .mem-recipient-card { width: 220px; }
        }
      `}</style>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', opacity: 0.5, animation: 'floatHeartPage 7s ease-in-out infinite' }}><Heart size={28} color="#ffb3c6" fill="#ffb3c6" /></div>
      <div style={{ position: 'absolute', top: '15%', right: '12%', opacity: 0.4, animation: 'floatHeartPage 6s ease-in-out infinite 1s' }}><Heart size={18} color="#ff8fab" fill="#ff8fab" /></div>
      <div style={{ position: 'absolute', top: '40%', left: '5%', opacity: 0.3, animation: 'floatHeartPage 8s ease-in-out infinite 2s' }}><Heart size={22} color="#ffb3c6" fill="#ffb3c6" /></div>
      <div style={{ position: 'absolute', top: '60%', right: '8%', opacity: 0.5, animation: 'floatHeartPage 5s ease-in-out infinite 1.5s' }}><Heart size={32} color="#ff8fab" fill="#ff8fab" /></div>
      <div style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.4, animation: 'floatHeartPage 7s ease-in-out infinite 0.5s' }}><Heart size={24} color="#ffb3c6" fill="#ffb3c6" /></div>

      <div style={{ position: 'absolute', top: '30%', left: '25%', width: 8, height: 8, borderRadius: '50%', background: '#ff99ac', boxShadow: '0 0 15px #ff99ac', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: '70%', right: '30%', width: 6, height: 6, borderRadius: '50%', background: '#ff99ac', boxShadow: '0 0 12px #ff99ac', opacity: 0.5 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Intro */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 80,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Sparkles size={28} color="#ff4d85" style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ margin: '0 0 12px', fontFamily: "'Dancing Script', cursive", fontSize: '3.8rem', color: '#ff4d85', fontWeight: 700, textShadow: '0 4px 15px rgba(255, 77, 133, 0.15)' }}>
            Beautiful Memories
          </h2>
          <p style={{ margin: 0, color: '#ff75a0', fontSize: '1.5rem', fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
            Little moments, beautiful memories ❤️
          </p>
        </div>

        {/* Gallery */}
        {memories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff75a0' }}>
            <h3 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2rem' }}>No memories shared</h3>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '60px 30px', /* large gap to allow strings and overlap */
            marginBottom: 100,
            paddingTop: 40 // space for the top strings
          }}>
            {memories.map((m, i) => {
              // Deterministic variation based on index
              const rotations = [-4, 3, -2, 5, -3, 2, -5, 4];
              const offsets = [0, 15, -10, 5, -15, 10, -5, 20];
              const animClasses = ['slide-left', 'slide-top', 'slide-right', 'slide-bottom'];
              
              const rot = rotations[i % rotations.length];
              const offsetY = offsets[i % offsets.length];
              const animClass = animClasses[i % animClasses.length];
              
              // Base delay after title fades in (1s), then stagger each photo by 0.3s
              const delay = 1.0 + (i * 0.3);

              return (
                <div key={m.id || i} style={{ position: 'relative', marginTop: offsetY }}>
                  {/* The string that is already present and fades in early */}
                  <div 
                    style={{ 
                      opacity: 0, 
                      animationDelay: '0.8s', // Strings appear slightly before photos
                    }} 
                    className={revealed ? 'animate-fade-in-slow' : ''}
                  >
                    {/* Horizontal string segment - overlaps to form a continuous line */}
                    <div style={{
                      position: 'absolute',
                      top: -40,
                      left: '-50%',
                      width: '200%',
                      height: 2,
                      background: 'rgba(255, 179, 198, 0.5)',
                      zIndex: 1
                    }} />
                    {/* Vertical hanging string */}
                    <div style={{
                      position: 'absolute',
                      top: -40,
                      left: '50%',
                      width: 2,
                      height: 40,
                      background: 'rgba(255, 179, 198, 0.6)',
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }} />
                  </div>

                  {/* The sliding photo */}
                  <div 
                    className={`photo-wrapper ${revealed ? animClass : ''}`}
                    style={{ animationDelay: `${delay}s` }}
                  >
                    <button 
                      onClick={() => openLightbox(i)} 
                      className="mem-recipient-card"
                      style={{
                        transform: `rotate(${rot}deg)`,
                      }}
                    >
                      {/* Photo Clip/Pin */}
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        left: '50%',
                        width: 14,
                        height: 18,
                        background: 'linear-gradient(135deg, #ff75a0, #ff4d85)',
                        borderRadius: 3,
                        transform: 'translateX(-50%)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        zIndex: 10
                      }} />
                      
                      <img 
                        src={m.url} 
                        alt={m.caption || 'Memory'} 
                        loading="lazy" 
                        style={{ width: '100%', height: 230, objectFit: 'cover', borderRadius: 2, display: 'block' }} 
                      />
                      
                      {m.caption && (
                        <div style={{ 
                          marginTop: 18, 
                          fontFamily: "'Dancing Script', cursive", 
                          fontSize: '1.35rem', 
                          color: '#ff4d85', 
                          fontWeight: 700, 
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}>
                          {m.caption}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Emotional Outro & Continue */}
        {memories.length > 0 && (
          <div style={{ 
            textAlign: 'center',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(20px)',
            // Show the outro after the last photo has finished sliding in
            transition: `all 1s ease-out ${1.5 + (memories.length * 0.3)}s`
          }}>
            <Heart size={32} color="#ff4d85" fill="#ff4d85" style={{ marginBottom: 16, opacity: 0.8 }} />
            <h3 style={{ 
              fontFamily: "'Dancing Script', cursive", 
              fontSize: '2.6rem', 
              color: '#ff4d85',
              fontWeight: 700,
              margin: '0 0 50px',
              textShadow: '0 2px 10px rgba(255, 77, 133, 0.1)'
            }}>
              Every picture holds a beautiful memory ❤️
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onNext} className="mem-btn-primary">
                {isLast ? 'Finish' : 'Continue'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div onClick={() => setLightboxIdx(null)} style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(255, 245, 247, 0.95)', 
          zIndex: 20000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 24, 
          cursor: 'pointer', 
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out forwards'
        }}>
          {/* Close */}
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); setSlideshow(false); }} style={{ 
            position: 'absolute', top: 24, right: 24, width: 48, height: 48, borderRadius: '50%', background: '#fff', border: `2px solid #ffe1e8`, color: '#ff4d85', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 15px rgba(255, 77, 133, 0.15)', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <X size={24} />
          </button>

          {/* Prev */}
          <button onClick={(e) => { e.stopPropagation(); goSlide(-1); }} style={{ 
            position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 56, height: 56, borderRadius: '50%', background: '#fff', border: `2px solid #ffe1e8`, color: '#ff4d85', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 15px rgba(255, 77, 133, 0.15)', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; e.currentTarget.style.background = '#fff0f3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; e.currentTarget.style.background = '#fff'; }}>
            <ChevronLeft size={30} />
          </button>

          {/* Image Container */}
          <div key={slideIdx} className="animate-fade-in" style={{ position: 'relative', maxWidth: '85vw', maxHeight: '75vh', zIndex: 5 }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: '#fff',
              padding: '16px 16px 32px 16px',
              borderRadius: 8,
              boxShadow: '0 25px 60px rgba(255, 77, 133, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img src={memories[slideIdx].url} alt={memories[slideIdx].caption || 'Memory'} style={{ maxWidth: '80vw', maxHeight: '65vh', borderRadius: 4, objectFit: 'contain' }} />
              {memories[slideIdx].caption && (
                <div style={{ 
                  marginTop: 24, 
                  color: '#ff4d85', 
                  fontFamily: "'Dancing Script', cursive", 
                  fontSize: '2rem',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  {memories[slideIdx].caption}
                </div>
              )}
            </div>
          </div>

          {/* Next */}
          <button onClick={(e) => { e.stopPropagation(); goSlide(1); }} style={{ 
            position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 56, height: 56, borderRadius: '50%', background: '#fff', border: `2px solid #ffe1e8`, color: '#ff4d85', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 15px rgba(255, 77, 133, 0.15)', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; e.currentTarget.style.background = '#fff0f3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; e.currentTarget.style.background = '#fff'; }}>
            <ChevronRight size={30} />
          </button>

          {/* Slideshow & Indicator */}
          <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 10 }}>
            <button onClick={(e) => { e.stopPropagation(); setSlideshow(!slideshow); }} style={{
              background: slideshow ? '#ff4d85' : '#fff',
              color: slideshow ? '#fff' : '#ff4d85',
              padding: '10px 24px',
              borderRadius: 50,
              fontWeight: 600,
              fontSize: '0.9rem',
              border: `2px solid ${slideshow ? '#ff4d85' : '#ffe1e8'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(255, 77, 133, 0.15)',
              transition: 'all 0.2s'
            }}>
              {slideshow ? <Pause size={16} /> : <Play size={16} />} {slideshow ? 'Pause Slideshow' : 'Start Slideshow'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {memories.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setDirection(i > slideIdx ? 1 : -1); setSlideIdx(i); }} style={{ width: i === slideIdx ? 24 : 10, height: 10, borderRadius: 5, background: i === slideIdx ? '#ff4d85' : '#ffb3c6', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
