import { ChevronRight } from 'lucide-react';

export interface NavPage {
  id: string;
  label: string;
}

interface Props {
  pages: NavPage[];
  current: number;
  onPrev?: () => void;
  onNext: () => void;
  isLast: boolean;
  accent: string;
}

export default function PageNav({ pages, current, onNext, isLast, accent }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 12,
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
        paddingLeft: 'max(20px, env(safe-area-inset-left, 20px))',
        paddingRight: 'max(20px, env(safe-area-inset-right, 20px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(7,5,15,0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${accent}33`,
      }}
    >
      {/* Left spacer reserving room for fixed bottom-left Previous button so center dots stay balanced */}
      <div style={{ minWidth: 100, flex: 1, display: 'flex', justifyContent: 'flex-start' }} />

      {/* Dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 2 }}>
        {pages.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: i === current ? 28 : 10,
                height: 10,
                borderRadius: 5,
                background: i === current ? accent : 'rgba(255,255,255,0.25)',
                boxShadow: i === current ? `0 0 12px ${accent}88` : 'none',
                transition: 'all 0.3s',
              }}
              className={i === current ? 'animate-nav-dot' : ''}
            />
            {i === current && (
              <span
                style={{
                  fontSize: 10,
                  color: accent,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {p.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Next */}
      <div style={{ minWidth: 100, flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onNext}
          className="btn-surprise"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 22px',
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {isLast ? 'Finish' : 'Next'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
