import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NavPage {
  id: string;
  label: string;
}

interface Props {
  pages: NavPage[];
  current: number;
  onPrev: () => void;
  onNext: () => void;
  isLast: boolean;
  accent: string;
}

export default function PageNav({ pages, current, onPrev, onNext, isLast, accent }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'rgba(7,5,15,0.85)', backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${accent}33`,
    }}>
      {/* Previous */}
      <button
        onClick={onPrev}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9999,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
          transition: 'opacity 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      >
        <ChevronLeft size={16} /> Previous
      </button>

      {/* Dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {pages.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: i === current ? 28 : 10, height: 10, borderRadius: 5,
              background: i === current ? accent : 'rgba(255,255,255,0.25)',
              boxShadow: i === current ? `0 0 12px ${accent}88` : 'none',
              transition: 'all 0.3s',
            }} className={i === current ? 'animate-nav-dot' : ''} />
            {i === current && (
              <span style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="btn-surprise"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 9999,
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none',
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}
      >
        {isLast ? 'Finish' : 'Next'} <ChevronRight size={16} />
      </button>
    </div>
  );
}
