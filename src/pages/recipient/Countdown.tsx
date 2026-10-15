import { useEffect, useState } from 'react';
import { type Theme } from '../../lib/effects';
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
        // Allow time for the final visual transition ("It's Time!" + Heart Expand)
        setTimeout(onComplete, 2800); 
      } else {
        setCount(step);
        playCountTick(3 - step);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  // Format single digits with a leading zero
  const f = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#fffaf8',
      backgroundImage: `radial-gradient(ellipse at 50% 30%, #fffcfb 0%, #fff0ee 40%, #ffe1df 100%)`,
      fontFamily: "'Inter', sans-serif", 
      position: 'relative', 
      overflow: 'hidden',
      color: '#333'
    }}>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          15% { transform: rotate(-45deg) scale(1.08); }
          30% { transform: rotate(-45deg) scale(1); }
          45% { transform: rotate(-45deg) scale(1.04); }
          60% { transform: rotate(-45deg) scale(1); }
        }
        @keyframes finalHeartGrow {
          0% { transform: rotate(-45deg) scale(1); }
          30% { transform: rotate(-45deg) scale(1.4); }
          100% { transform: rotate(-45deg) scale(60); opacity: 0; }
        }
        @keyframes numberPop {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes particleBurst {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: scale(1.5) translateY(-100px); opacity: 0; }
        }
        @keyframes screenFlash {
          0% { filter: brightness(1) blur(0); opacity: 1; }
          60% { filter: brightness(1.2) blur(3px); opacity: 1; }
          100% { filter: brightness(1.4) blur(10px); opacity: 0; }
        }
        
        .cd-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 90px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 182, 193, 0.5);
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(255, 182, 193, 0.15);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .cd-num {
          font-size: 2.2rem;
          font-weight: 700;
          color: #cc5b7a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .cd-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(204, 91, 122, 0.7);
          letter-spacing: 1px;
        }
        
        /* Grid for responsive 2x2 on mobile */
        .cd-grid {
          display: flex;
          gap: 16px;
          margin: 40px 0;
          position: relative;
          z-index: 5;
        }
        @media (max-width: 500px) {
          .cd-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .cd-box {
            width: 100px;
            height: 100px;
          }
        }
        
        .heart-shape {
          position: relative;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff7eb3, #ff4d85);
          transform: rotate(-45deg);
          border-radius: 4px;
          box-shadow: 0 5px 15px rgba(255, 77, 133, 0.3);
          z-index: 2;
        }
        .heart-shape::before,
        .heart-shape::after {
          content: '';
          position: absolute;
          width: 40px;
          height: 40px;
          background: inherit;
          border-radius: 50%;
        }
        .heart-shape::before { top: -20px; left: 0; }
        .heart-shape::after { top: 0; left: 20px; }
        
        .heart-glow {
          position: absolute;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(255, 77, 133, 0.4) 0%, transparent 70%);
          filter: blur(10px);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      {/* Background Soft Glows */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 450, height: 450, borderRadius: '50%', background: `radial-gradient(circle, rgba(255, 192, 203, 0.35), transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, rgba(255, 218, 185, 0.35), transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Gentle Floating Particles */}
      <div style={{ position: 'absolute', top: '20%', left: '18%', animation: 'floatHeart 6s infinite', color: 'rgba(255, 182, 193, 0.5)', fontSize: '24px' }}>❤</div>
      <div style={{ position: 'absolute', top: '65%', right: '15%', animation: 'floatHeart 5s infinite 1s', color: 'rgba(255, 182, 193, 0.4)', fontSize: '18px' }}>❤</div>
      <div style={{ position: 'absolute', top: '35%', right: '22%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 0 10px rgba(255,182,193,0.8)', animation: 'floatHeart 4s infinite 2s' }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: brighten ? 'screenFlash 1s ease-in 1.5s forwards' : 'none'
      }}>
        
        {/* Top Text */}
        {!brighten ? (
          <div style={{ textAlign: 'center', animation: 'fadeScaleIn 1s ease-out forwards' }}>
            <h1 style={{ fontSize: '2.4rem', color: '#cc5b7a', margin: '0 0 8px', fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
              Something Special Is Coming...
            </h1>
            <p style={{ color: '#d9738e', margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 400 }}>
              Your birthday surprise is almost ready ❤️
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', animation: 'fadeScaleIn 0.8s ease-out forwards', marginBottom: 20 }}>
             <h1 style={{ fontSize: '3rem', color: '#ff4d85', margin: '0 0 8px', fontFamily: "'Dancing Script', cursive", fontWeight: 700, textShadow: '0 0 15px rgba(255, 77, 133, 0.3)' }}>
              It's Time!
            </h1>
            <p style={{ color: '#d9738e', margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 500 }}>
              Your special surprise is waiting for you ❤️
            </p>
          </div>
        )}

        {/* Heart Animation */}
        <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <div className="heart-glow" />
          <div className="heart-shape" style={{ animation: brighten ? 'finalHeartGrow 1.5s cubic-bezier(0.5, 0, 0.3, 1) forwards' : 'heartPulse 2s infinite' }} />
        </div>

        {/* Burst Particles on Completion */}
        {brighten && (
          <>
            <div style={{ position: 'absolute', top: '50%', left: '40%', fontSize: '20px', color: '#ff69b4', animation: 'particleBurst 1s ease-out forwards', zIndex: 5 }}>❤</div>
            <div style={{ position: 'absolute', top: '45%', left: '55%', fontSize: '16px', color: '#ff69b4', animation: 'particleBurst 1s ease-out 0.2s forwards', zIndex: 5 }}>❤</div>
            <div style={{ position: 'absolute', top: '55%', left: '60%', fontSize: '24px', color: '#ff1493', animation: 'particleBurst 1.2s ease-out 0.1s forwards', zIndex: 5 }}>❤</div>
            <div style={{ position: 'absolute', top: '40%', left: '45%', fontSize: '14px', color: '#ff1493', animation: 'particleBurst 0.9s ease-out 0.3s forwards', zIndex: 5 }}>❤</div>
          </>
        )}

        {/* Countdown Grid */}
        {!brighten && (
          <div className="cd-grid" style={{ animation: 'fadeScaleIn 1s ease-out 0.3s forwards', opacity: 0 }}>
            <div className="cd-box">
              <span className="cd-num">00</span>
              <span className="cd-label">DAYS</span>
            </div>
            <div className="cd-box">
              <span className="cd-num">00</span>
              <span className="cd-label">HOURS</span>
            </div>
            <div className="cd-box">
              <span className="cd-num">00</span>
              <span className="cd-label">MINUTES</span>
            </div>
            <div className="cd-box">
              <span key={count} className="cd-num" style={{ animation: 'numberPop 0.4s ease-out forwards' }}>
                {f(count)}
              </span>
              <span className="cd-label">SECONDS</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
