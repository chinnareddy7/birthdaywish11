import { useEffect, useState } from 'react';
import { type Theme, RisingSparkles } from '../../lib/effects';
import { playCountTick, playCelebrationFanfare } from '../../lib/audio';

interface Props {
  theme: Theme;
  onComplete: () => void;
}

export default function Countdown({ theme, onComplete }: Props) {
  const [count, setCount] = useState(3);
  const [brighten, setBrighten] = useState(false);

  useEffect(() => {
    let step = 3;
    playCountTick(0);
    const id = setInterval(() => {
      step -= 1;
      if (step <= 0) {
        clearInterval(id);
        setCount(0);
        setBrighten(true);
        playCelebrationFanfare();
        setTimeout(onComplete, 600);
      } else {
        setCount(step);
        playCountTick(3 - step);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  const showGo = brighten || count === 0;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: brighten
        ? `radial-gradient(ellipse at 50% 50%, ${theme.accent}55, ${theme.accent2}33 40%, ${theme.bg} 75%)`
        : `radial-gradient(ellipse at 50% 40%, ${theme.accent}11, transparent 60%), ${theme.bg}`,
      transition: 'background 0.8s ease',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <RisingSparkles count={24} />

      {brighten && (
        <div className="animate-bg-brighten" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${theme.accent}44, transparent 60%)`, pointerEvents: 'none' }} />
      )}

      {showGo ? (
        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div className="animate-count-glow" style={{ fontSize: '8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            Go!
          </div>
        </div>
      ) : (
        <div key={count} className="animate-count-pop animate-count-glow" style={{
          fontSize: '12rem', fontWeight: 900, color: '#fff', lineHeight: 1,
          fontFamily: "'Inter', sans-serif", position: 'relative', zIndex: 2,
        }}>
          {count}
        </div>
      )}

      <p className="animate-fade-in" style={{ position: 'relative', zIndex: 2, color: 'rgba(255,255,255,0.6)', fontSize: 16, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 24 }}>
        {showGo ? 'Here it comes...' : 'Get Ready...'}
      </p>
    </div>
  );
}
