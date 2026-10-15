import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Surprise } from '../../lib/supabase';
import './BalloonReasonsPage.css';

interface Props {
  surprise?: Surprise | null;
  recipientName?: string;
  onComplete: () => void;
}

interface BalloonItem {
  id: number;
  color: string;
  glow: string;
  knotColor: string;
  top: string;
  left: string;
  floatClass: string;
  reasonNo: number;
  text: string;
  borderColor: string;
  badgeEmoji: string;
}

const BALLOON_COLORS = [
  { color: '#ff4d85', glow: 'rgba(255, 77, 133, 0.4)', knotColor: '#d92c63', borderColor: '#ff7eb3' },
  { color: '#ff7eb3', glow: 'rgba(255, 126, 179, 0.4)', knotColor: '#e05c93', borderColor: '#ffa3cb' },
  { color: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.4)', knotColor: '#d94c4c', borderColor: '#ff8e8e' },
  { color: '#ffb6b9', glow: 'rgba(255, 182, 185, 0.4)', knotColor: '#d99598', borderColor: '#ffccd0' },
  { color: '#fca3cc', glow: 'rgba(252, 163, 204, 0.4)', knotColor: '#d881aa', borderColor: '#ffc1e3' },
];

const BALLOON_POSITIONS = [
  { top: '5%', left: '12%', floatClass: 'float-1' },
  { top: '35%', left: '25%', floatClass: 'float-2' },
  { top: '15%', left: '45%', floatClass: 'float-3' },
  { top: '8%', left: '72%', floatClass: 'float-4' },
  { top: '40%', left: '80%', floatClass: 'float-5' },
  { top: '55%', left: '15%', floatClass: 'float-3' },
  { top: '65%', left: '45%', floatClass: 'float-1' },
  { top: '58%', left: '68%', floatClass: 'float-2' },
  { top: '25%', left: '60%', floatClass: 'float-4' },
  { top: '45%', left: '8%', floatClass: 'float-5' },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: string;
  ty: string;
}

export default function BalloonReasonsPage({ surprise, onComplete }: Props) {
  const [poppedIds, setPoppedIds] = useState<number[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const skyRef = useRef<HTMLDivElement>(null);

  // Extract messages from DB or fallback
  const balloonsData = React.useMemo(() => {
    let customMessages: { message: string; emoji: string }[] = [];
    try {
      if (surprise?.balloon_personal_message) {
        const parsed = JSON.parse(surprise.balloon_personal_message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customMessages = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse balloon_personal_message', e);
    }

    if (customMessages.length === 0) {
      // Default fallback if no data
      customMessages = [
        { message: 'You make every day brighter ❤️', emoji: '✨' },
        { message: 'Your smile is my favorite thing 💖', emoji: '🥰' },
        { message: 'You always know how to make me laugh ✨', emoji: '😂' }
      ];
    }

    return customMessages.map((msg, i) => {
      const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
      const p = BALLOON_POSITIONS[i % BALLOON_POSITIONS.length];
      return {
        id: i + 1,
        ...c,
        ...p,
        reasonNo: i + 1,
        text: msg.message,
        badgeEmoji: msg.emoji || '💖',
      } as BalloonItem;
    });
  }, [surprise]);

  const playPopSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio autoplay fail-safe
    }
  };

  const handlePop = (balloon: BalloonItem, e: React.MouseEvent, elem: HTMLElement) => {
    if (poppedIds.includes(balloon.id)) return;

    // Add a quick pop animation class before unmounting
    elem.classList.add('balloon-popping');
    
    setTimeout(() => {
      playPopSound();

      const rect = skyRef.current?.getBoundingClientRect();
      const clickX = rect ? e.clientX - rect.left : 150;
      const clickY = rect ? e.clientY - rect.top : 100;

      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        const dist = 50 + Math.random() * 60;
        newParticles.push({
          id: Date.now() + i,
          x: clickX,
          y: clickY,
          color: balloon.color,
          tx: `${Math.cos(angle) * dist}px`,
          ty: `${Math.sin(angle) * dist}px`,
        });
      }
      
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 800);

      setPoppedIds((prev) => [...prev, balloon.id]);
    }, 120); 
  };

  const allPopped = poppedIds.length === balloonsData.length;
  // After all balloons are popped, sort/retrieve by their original ID/index
  const finalMessages = [...balloonsData].sort((a, b) => a.id - b.id);
  // Reveal one message per pop, following the original customization order
  const revealedMessages = finalMessages.slice(0, poppedIds.length);

  return (
    <div className={`balloon-page-wrapper ${allPopped ? 'all-popped' : ''}`}>
      
      {/* Background Soft Glows (Matching Heart Arrow) */}
      <div className="br-bg-ambient br-bg-1" />
      <div className="br-bg-ambient br-bg-2" />

      {/* Gentle Floating Particles */}
      <div className="br-particle br-p-1">❤</div>
      <div className="br-particle br-p-2">❤</div>
      <div className="br-particle br-p-3" />
      <div className="br-particle br-p-4" />

      <div className="balloon-content-container">
        
        {/* Intro Headings */}
        <div className="balloon-intro-text">
          <h1 className="br-title">
            {allPopped ? "You found them all! ❤️" : "Pop the Balloons... 🎈"}
          </h1>
          <p className="br-subtitle">
            {allPopped ? "All your little surprises are yours ❤️" : "Each one has a little surprise for you ❤️"}
          </p>
          
          {/* Progress Indicator */}
          {!allPopped && (
            <p className="br-progress">
              {poppedIds.length} of {balloonsData.length} balloons popped ❤️
            </p>
          )}
        </div>

        {/* Floating balloons sky */}
        {!allPopped && (
          <div className="balloons-sky-area" ref={skyRef}>
            {balloonsData.map((balloon) => {
              if (poppedIds.includes(balloon.id)) return null;

              return (
                <div
                  key={balloon.id}
                  className={`balloon-wrapper ${balloon.floatClass}`}
                  style={{ top: balloon.top, left: balloon.left }}
                  onClick={(e) => handlePop(balloon, e, e.currentTarget)}
                >
                  <div
                    className="balloon-body"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${balloon.color} 55%, ${balloon.knotColor} 100%)`,
                      boxShadow: `inset -5px -7px 14px rgba(0,0,0,0.1), 0 8px 24px ${balloon.glow}`,
                    }}
                  >
                    <div className="balloon-shine" />
                    <div
                      className="balloon-knot"
                      style={{ borderTop: `7px solid ${balloon.knotColor}` }}
                    />
                  </div>
                  <div className="balloon-string" />
                </div>
              );
            })}

            {/* Particle explosion elements */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="pop-particle"
                style={
                  {
                    left: p.x,
                    top: p.y,
                    color: p.color,
                    '--tx': p.tx,
                    '--ty': p.ty,
                  } as React.CSSProperties
                }
              >
                ❤
              </div>
            ))}
          </div>
        )}

        {/* Revealed Reason Cards */}
        {revealedMessages.length > 0 && (
          <div className="reasons-cards-list">
            {revealedMessages.map((card) => (
              <div key={card.id} className="reason-card">
                <p className="reason-text">{card.text}</p>
                <div className="reason-icon">{card.badgeEmoji}</div>
              </div>
            ))}
          </div>
        )}

        {/* Post-balloon Customized Birthday Message Card */}
        {allPopped && (
          <div className="br-completion-container">
            <button className="br-continue-btn" onClick={onComplete}>
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
