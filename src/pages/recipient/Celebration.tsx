import { useEffect, useState } from 'react';
import { type Theme, RisingBalloons, ConfettiExplosion, FloatingHearts, SparkleField, CelebrationConfetti } from '../../lib/effects';
import { playBirthdayMusic } from '../../lib/audio';

interface Props {
  theme: Theme;
  onComplete: () => void;
}

export default function Celebration({ theme, onComplete }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const musicId = setTimeout(() => playBirthdayMusic(), 400);
    // Start the fade-out just before transitioning, so there's never a blank screen.
    const leaveId = setTimeout(() => setLeaving(true), 3600);
    const doneId = setTimeout(onComplete, 4000);
    return () => { clearTimeout(musicId); clearTimeout(leaveId); clearTimeout(doneId); };
  }, [onComplete]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 40%, ${theme.accent}40, ${theme.accent2}26 40%, ${theme.bg} 80%)`,
      textAlign: 'center', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
      opacity: leaving ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <SparkleField count={40} />
      <RisingBalloons accent={theme.accent} accent2={theme.accent2} />
      <FloatingHearts accent={theme.accent} />
      <ConfettiExplosion />
      {/* Re-fire confetti partway through so it never goes empty */}
      <CelebrationConfetti />

      <div style={{ position: 'relative', zIndex: 2, padding: 24 }}>
        <div style={{ fontSize: '4rem', marginBottom: 12, animation: 'heartBeatSoft 1.6s ease-in-out infinite' }}>
          🎉
        </div>
        <h1 className="animate-fade-up" style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', margin: 0, textShadow: `0 0 40px ${theme.accent}88` }}>
          Happy Birthday!
        </h1>
        <p className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, marginTop: 16, letterSpacing: '0.1em' }}>
          Your surprise is unfolding...
        </p>
      </div>
    </div>
  );
}
